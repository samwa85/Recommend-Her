// ============================================================================
// RETRY MECHANISM FOR NETWORK REQUESTS
// Exponential backoff for failed requests
// ============================================================================

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'network',
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'fetch failed',
    'Failed to fetch',
  ],
  onRetry: () => {},
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  const errorMessage = error.message.toLowerCase();
  return retryableErrors.some(pattern => 
    errorMessage.includes(pattern.toLowerCase())
  );
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Only retry certain errors
      if (!isRetryableError(lastError, config.retryableErrors)) {
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier
      );

      // Notify about retry
      config.onRetry(attempt, lastError);

      // Wait before retry
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Wrapper for Supabase queries with retry
 */
export async function queryWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options?: RetryOptions
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await queryFn();
      if (error) throw new Error(error.message);
      return { data, error: null };
    }, options);
    
    return result;
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Hook-style retry wrapper for React components
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withRetry(() => fn(...args), options);
  }) as T;
}

// ============================================================================
// OFFLINE DETECTION
// ============================================================================

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handler = () => {
      window.removeEventListener('online', handler);
      resolve();
    };

    window.addEventListener('online', handler);
  });
}

// ============================================================================
// REQUEST QUEUE FOR OFFLINE SUPPORT
// ============================================================================

interface QueuedRequest {
  id: string;
  timestamp: number;
  type: 'talent' | 'sponsor' | 'contact';
  data: any;
}

const QUEUE_KEY = 'pending_requests_queue';

export const requestQueue = {
  add(request: Omit<QueuedRequest, 'id' | 'timestamp'>): void {
    const queue = this.getAll();
    queue.push({
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  getAll(): QueuedRequest[] {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  remove(id: string): void {
    const queue = this.getAll().filter(r => r.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  clear(): void {
    localStorage.removeItem(QUEUE_KEY);
  },

  size(): number {
    return this.getAll().length;
  },
};
