// ============================================================================
// RETRY UTILITY - Exponential backoff for failed requests
// ============================================================================

export interface RetryOptions {
  maxRetries?: number;
  maxAttempts?: number; // Alias for maxRetries
  baseDelay?: number;
  initialDelay?: number; // Alias for baseDelay
  maxDelay?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { 
    ...DEFAULT_OPTIONS, 
    maxRetries: options.maxAttempts || options.maxRetries,
    baseDelay: options.initialDelay || options.baseDelay,
    ...options 
  };
  const maxAttempts = opts.maxRetries!;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Check if error is retryable
      const statusCode = (error as { status?: number })?.status;
      if (statusCode && !opts.retryableStatuses?.includes(statusCode)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay! * Math.pow(2, attempt),
        opts.maxDelay!
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 1000;
      
      // Call onRetry callback if provided
      if (opts.onRetry) {
        opts.onRetry(attempt + 1, lastError, delay + jitter);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}

/**
 * Create a retryable query function
 */
export function createRetryableQuery<T>(
  queryFn: () => Promise<T>,
  options: RetryOptions = {}
): () => Promise<T> {
  return () => withRetry(queryFn, options);
}

/**
 * Circuit breaker pattern - stop calling failing service
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private threshold: number;
  private timeout: number;

  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
