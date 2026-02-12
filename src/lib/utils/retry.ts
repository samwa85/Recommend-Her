// ============================================================================
// RETRY UTILITIES - Exponential backoff for failed requests
// ============================================================================

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['network', 'timeout', 'rate limit', '503', '502', '504'],
  onRetry: () => {},
};

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error 
    ? error.message.toLowerCase() 
    : String(error).toLowerCase();
  
  // Network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') ||
      errorMessage.includes('internet')) {
    return true;
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('timed out')) {
    return true;
  }
  
  // HTTP status codes
  if (retryableErrors.some(code => errorMessage.includes(code))) {
    return true;
  }
  
  // Supabase specific errors
  if (errorMessage.includes('connection') || 
      errorMessage.includes('unavailable')) {
    return true;
  }
  
  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        throw lastError;
      }
      
      // Check if error is retryable
      if (!isRetryableError(error, config.retryableErrors)) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      config.onRetry(attempt, lastError, jitteredDelay);
      
      await sleep(jitteredDelay);
    }
  }
  
  throw lastError;
}

/**
 * Retry wrapper for Supabase queries
 */
export function createRetryableQuery<T>(
  queryFn: () => Promise<T>,
  options?: RetryOptions
) {
  return () => withRetry(queryFn, options);
}

export default withRetry;
