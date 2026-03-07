// ============================================================================
// RATE LIMIT HANDLER - Handle 429 errors gracefully
// ============================================================================

import { toast } from 'sonner';

interface RateLimitState {
  retryAfter: number;
  isRateLimited: boolean;
}

const rateLimitState: Map<string, RateLimitState> = new Map();

/**
 * Check if an endpoint is currently rate limited
 */
export function isRateLimited(endpoint: string): boolean {
  const state = rateLimitState.get(endpoint);
  if (!state) return false;
  
  if (Date.now() < state.retryAfter) {
    return true;
  }
  
  // Reset if time has passed
  rateLimitState.delete(endpoint);
  return false;
}

/**
 * Handle rate limit error
 */
export function handleRateLimit(error: unknown, endpoint: string): void {
  const status = (error as { status?: number })?.status;
  
  if (status === 429) {
    // Get retry-after header or default to 60 seconds
    const retryAfter = (error as { retryAfter?: number })?.retryAfter || 60;
    
    rateLimitState.set(endpoint, {
      retryAfter: Date.now() + (retryAfter * 1000),
      isRateLimited: true,
    });

    toast.error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`, {
      duration: 5000,
    });
  }
}

/**
 * Wait for rate limit to reset
 */
export async function waitForRateLimit(endpoint: string): Promise<void> {
  const state = rateLimitState.get(endpoint);
  if (!state) return;
  
  const waitTime = state.retryAfter - Date.now();
  if (waitTime > 0) {
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

/**
 * Decorator for rate-limited functions
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  endpoint: string
): T {
  return (async (...args: unknown[]) => {
    if (isRateLimited(endpoint)) {
      toast.warning('Please wait before trying again.');
      await waitForRateLimit(endpoint);
    }
    
    try {
      return await fn(...args);
    } catch (error) {
      handleRateLimit(error, endpoint);
      throw error;
    }
  }) as T;
}
