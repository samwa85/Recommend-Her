// ============================================================================
// UTILS - Barrel Export
// Shared utility functions
// ============================================================================

// Error handling
export {
  getErrorMessage,
  handleQueryError,
  handleSingleQueryError,
  assertNotNull,
  withErrorHandling,
} from './errors';
export type {
  QueryResult,
  ListResult,
  PaginationParams,
  PaginatedResult,
} from './errors';

// Retry logic
export { withRetry, createRetryableQuery } from './retry';
export type { RetryOptions } from './retry';

// Caching
export { globalCache, memoize } from './cache';
export type { CacheOptions } from './cache';

// Optimistic updates
export { useOptimistic, createBatchUpdate } from './optimistic';
export type { OptimisticOptions, OptimisticState } from './optimistic';

// Validation
export {
  validators,
  validateValue,
  validateObject,
  sanitizers,
  ValidationSchema,
  schemas,
} from './validation';
export type { ValidationRule, ValidationResult } from './validation';
