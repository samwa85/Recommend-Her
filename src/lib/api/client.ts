// ============================================================================
// ROBUST API CLIENT - With retry, rate limiting, and error handling
// ============================================================================

import { getInsforgeClient } from '@/lib/insforge/client';
import { withRetry } from '@/lib/utils/retry';
import { handleRateLimit, isRateLimited } from '@/lib/utils/rate-limit';
import { toast } from 'sonner';

interface APIOptions {
  retry?: boolean;
  retryCount?: number;
  timeout?: number;
  showErrorToast?: boolean;
}

const DEFAULT_OPTIONS: APIOptions = {
  retry: true,
  retryCount: 3,
  timeout: 30000,
  showErrorToast: true,
};

/**
 * Robust database query with retry and error handling
 */
export async function query<T>(
  operation: () => Promise<{ data: T | null; error: Error | null }>,
  options: APIOptions = {}
): Promise<{ data: T | null; error: Error | null }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    let result;
    
    if (opts.retry) {
      result = await withRetry(
        async () => {
          const res = await operation();
          if (res.error) throw res.error;
          return res;
        },
        { maxRetries: opts.retryCount }
      );
    } else {
      result = await operation();
    }
    
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    // Handle rate limiting
    handleRateLimit(error, 'api');
    
    // Show error toast if enabled
    if (opts.showErrorToast && !isRateLimited('api')) {
      toast.error(getErrorMessage(err));
    }
    
    return { data: null, error: err };
  }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: Error): string {
  const message = error.message || '';
  
  // Database errors
  if (message.includes('42P01')) return 'Database table not found. Please contact support.';
  if (message.includes('42501')) return 'Permission denied. Please check your access rights.';
  if (message.includes('23505')) return 'This record already exists.';
  
  // Network errors
  if (message.includes('fetch') || message.includes('network')) {
    return 'Network error. Please check your connection.';
  }
  
  // Timeout errors
  if (message.includes('timeout')) return 'Request timed out. Please try again.';
  
  // Auth errors
  if (message.includes('JWT') || message.includes('token')) {
    return 'Session expired. Please log in again.';
  }
  
  // Default
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Optimistic update helper
 */
export function optimisticUpdate<T>(
  currentData: T[],
  newItem: T,
  idKey: keyof T
): T[] {
  const exists = currentData.find(item => item[idKey] === newItem[idKey]);
  
  if (exists) {
    return currentData.map(item =>
      item[idKey] === newItem[idKey] ? newItem : item
    );
  }
  
  return [newItem, ...currentData];
}

/**
 * Batch operation helper
 */
export async function batchOperation<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  options: { concurrency?: number; stopOnError?: boolean } = {}
): Promise<{ results: R[]; errors: { item: T; error: Error }[] }> {
  const { concurrency = 5, stopOnError = false } = options;
  
  const results: R[] = [];
  const errors: { item: T; error: Error }[] = [];
  
  // Process in batches
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    
    const batchResults = await Promise.allSettled(
      batch.map(item => operation(item))
    );
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const error = result.reason instanceof Error 
          ? result.reason 
          : new Error(String(result.reason));
        
        errors.push({ item: batch[index], error });
        
        if (stopOnError) {
          throw error;
        }
      }
    });
  }
  
  return { results, errors };
}

// ============================================================================
// EXPORT
// ============================================================================

export { withRetry, isRateLimited, handleRateLimit };
