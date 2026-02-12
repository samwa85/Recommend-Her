// ============================================================================
// OPTIMISTIC UPDATES - UI updates before server confirmation
// ============================================================================

import { useState, useCallback } from 'react';

export interface OptimisticOptions<T> {
  onError?: (error: Error, previousData: T) => void;
  onSuccess?: (data: T) => void;
  rollbackOnError?: boolean;
}

export interface OptimisticState<T> {
  data: T;
  isPending: boolean;
  error: Error | null;
}

/**
 * Hook for optimistic updates
 */
export function useOptimistic<T>(
  initialData: T,
  options: OptimisticOptions<T> = {}
) {
  const { onError, onSuccess, rollbackOnError = true } = options;
  
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isPending: false,
    error: null,
  });

  const execute = useCallback(async (
    optimisticData: T,
    asyncOperation: () => Promise<T>
  ): Promise<boolean> => {
    const previousData = state.data;
    
    // Optimistically update UI
    setState({
      data: optimisticData,
      isPending: true,
      error: null,
    });
    
    try {
      const result = await asyncOperation();
      
      setState({
        data: result,
        isPending: false,
        error: null,
      });
      
      onSuccess?.(result);
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Rollback to previous data
      if (rollbackOnError) {
        setState({
          data: previousData,
          isPending: false,
          error: err,
        });
      } else {
        setState(prev => ({
          ...prev,
          isPending: false,
          error: err,
        }));
      }
      
      onError?.(err, previousData);
      return false;
    }
  }, [state.data, onError, onSuccess, rollbackOnError]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isPending: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    setData,
    reset,
  };
}

/**
 * Batch multiple optimistic updates
 */
export function createBatchUpdate() {
  const pending = new Map<string, Promise<unknown>>();
  
  return {
    add(id: string, operation: () => Promise<unknown>): void {
      pending.set(id, operation());
    },
    
    async commit(): Promise<void> {
      const operations = Array.from(pending.values());
      pending.clear();
      
      const results = await Promise.allSettled(operations);
      
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(`${failures.length} operations failed`);
      }
    },
    
    clear(): void {
      pending.clear();
    },
  };
}

export default useOptimistic;
