// ============================================================================
// ROBUST QUERY HOOK - Advanced data fetching with retry, cache, and error handling
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { withRetry } from '@/lib/utils/retry';
import { globalCache } from '@/lib/utils/cache';

// ============================================================================
// TYPES
// ============================================================================

export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
}

export interface QueryOptions<T> {
  // Caching
  cacheKey?: string;
  cacheTtl?: number;
  staleTime?: number;
  
  // Retry
  retry?: boolean | number;
  retryDelay?: number;
  
  // Lifecycle
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number | false;
  
  // Callbacks
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: T | null, error: Error | null) => void;
}

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: Required<QueryOptions<unknown>> = {
  cacheKey: '',
  cacheTtl: 5 * 60 * 1000, // 5 minutes
  staleTime: 0,
  retry: 3,
  retryDelay: 1000,
  enabled: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: false,
  onSuccess: () => {},
  onError: () => {},
  onSettled: () => {},
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useRobustQuery<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryState<T> & {
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const config = { ...DEFAULT_OPTIONS, ...options } as Required<QueryOptions<T>>;
  const cacheKey = config.cacheKey || queryFn.toString();
  
  // Check cache for initial data
  const cachedData = globalCache.get<T>(cacheKey);
  const isStale = cachedData === undefined || config.staleTime === 0;
  
  const [state, setState] = useState<QueryState<T>>({
    data: cachedData || null,
    isLoading: isStale && config.enabled,
    isFetching: false,
    error: null,
    isError: false,
    isSuccess: cachedData !== undefined,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const executeQuery = useCallback(async (isBackground = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isBackground) {
      setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }));
    } else {
      setState(prev => ({ ...prev, isFetching: true }));
    }

    try {
      // Check cache first if not stale
      if (!isBackground) {
        const cached = globalCache.get<T>(cacheKey);
        if (cached !== undefined && config.staleTime > 0) {
          setState({
            data: cached,
            isLoading: false,
            isFetching: false,
            error: null,
            isError: false,
            isSuccess: true,
          });
          config.onSuccess(cached);
          config.onSettled(cached, null);
          return;
        }
      }

      // Execute query with retry
      const data = await withRetry(queryFn, {
        maxAttempts: typeof config.retry === 'number' ? config.retry : config.retry ? 3 : 1,
        initialDelay: config.retryDelay,
        onRetry: (attempt, error, delay) => {
          console.warn(`[useRobustQuery] Retry ${attempt} after ${delay}ms:`, error.message);
        },
      });

      // Update cache
      globalCache.set(cacheKey, data, config.cacheTtl);

      setState({
        data,
        isLoading: false,
        isFetching: false,
        error: null,
        isError: false,
        isSuccess: true,
      });

      config.onSuccess(data);
      config.onSettled(data, null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('[useRobustQuery] Query failed:', err);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isFetching: false,
        error: err,
        isError: true,
        isSuccess: false,
      }));

      config.onError(err);
      config.onSettled(null, err);
    }
  }, [queryFn, cacheKey, config]);

  const refetch = useCallback(async () => {
    // Clear cache before refetch
    globalCache.delete(cacheKey);
    await executeQuery(false);
  }, [executeQuery, cacheKey]);

  const invalidate = useCallback(() => {
    globalCache.delete(cacheKey);
  }, [cacheKey]);

  // Initial fetch
  useEffect(() => {
    if (!config.enabled) return;
    
    executeQuery(false);
  }, [config.enabled, executeQuery]);

  // Window focus refetch
  useEffect(() => {
    if (!config.refetchOnWindowFocus || !config.enabled) return;

    const handleFocus = () => {
      executeQuery(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [config.refetchOnWindowFocus, config.enabled, executeQuery]);

  // Reconnect refetch
  useEffect(() => {
    if (!config.refetchOnReconnect || !config.enabled) return;

    const handleOnline = () => {
      executeQuery(true);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [config.refetchOnReconnect, config.enabled, executeQuery]);

  // Interval refetch
  useEffect(() => {
    if (!config.refetchInterval || !config.enabled) return;

    intervalRef.current = setInterval(() => {
      executeQuery(true);
    }, config.refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config.refetchInterval, config.enabled, executeQuery]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    invalidate,
  };
}

// ============================================================================
// MUTATION HOOK
// ============================================================================

export interface MutationState<T, V> {
  mutate: (variables: V) => void;
  mutateAsync: (variables: V) => Promise<T>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

export interface MutationOptions<T, V> {
  onMutate?: (variables: V) => void | Promise<void>;
  onSuccess?: (data: T, variables: V) => void | Promise<void>;
  onError?: (error: Error, variables: V) => void | Promise<void>;
  onSettled?: (data: T | null, error: Error | null, variables: V) => void | Promise<void>;
  retry?: boolean | number;
}

export function useRobustMutation<T, V = unknown>(
  mutationFn: (variables: V) => Promise<T>,
  options: MutationOptions<T, V> = {}
): MutationState<T, V> {
  const [state, setState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null as Error | null,
    data: null as T | null,
  });

  const mutateAsync = useCallback(async (variables: V): Promise<T> => {
    setState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
    });

    try {
      await options.onMutate?.(variables);

      const data = await withRetry(() => mutationFn(variables), {
        maxAttempts: typeof options.retry === 'number' ? options.retry : options.retry ? 3 : 1,
      });

      setState({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        data,
      });

      await options.onSuccess?.(data, variables);
      await options.onSettled?.(data, null, variables);

      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      setState({
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: err,
        data: null,
      });

      await options.onError?.(err, variables);
      await options.onSettled?.(null, err, variables);

      throw err;
    }
  }, [mutationFn, options]);

  const mutate = useCallback(async (variables: V): Promise<void> => {
    try {
      await mutateAsync(variables);
    } catch {
      // Error already handled in mutateAsync
    }
  }, [mutateAsync]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    mutate,
    mutateAsync,
    ...state,
    reset,
  };
}

export default useRobustQuery;
