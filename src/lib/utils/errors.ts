// ============================================================================
// ERROR HANDLING UTILITIES
// Shared error handling functions for queries
// ============================================================================

import { type PostgrestError } from '@supabase/supabase-js';

/**
 * Standard result type for single record queries
 */
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Standard result type for list queries
 */
export interface ListResult<T> {
  data: T[];
  count: number;
  error: Error | null;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result type
 */
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
  error: Error | null;
}

/**
 * Map Supabase PostgrestError to user-friendly message
 */
export function getErrorMessage(error: PostgrestError): string {
  const errorCodeMap: Record<string, string> = {
    // Unique violation
    '23505': 'A record with this information already exists.',
    // Foreign key violation
    '23503': 'This record is referenced by other data and cannot be modified.',
    // Check constraint violation
    '23514': 'Invalid data: some field values do not meet requirements.',
    // Not null violation
    '23502': 'Required field is missing.',
    // Custom codes
    'P0001': 'The operation could not be completed.',
  };

  if (error.code && errorCodeMap[error.code]) {
    return errorCodeMap[error.code];
  }

  // Common patterns
  if (error.message?.includes('JWT')) {
    return 'Session expired. Please log in again.';
  }
  if (error.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  if (error.code === '404' || error.message?.includes('not found')) {
    return 'The requested record was not found.';
  }

  return error.message || 'An unexpected error occurred';
}

/**
 * Handle query error with consistent formatting
 * @param error - Error to handle
 * @returns Typed result with error
 */
export function handleQueryError<T>(error: unknown): { 
  data: T; 
  count: number; 
  error: Error 
} {
  let message: string;
  
  if (typeof error === 'object' && error !== null && 'code' in error) {
    // PostgrestError
    message = getErrorMessage(error as PostgrestError);
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error) || 'An unexpected error occurred';
  }

  console.error('[Query Error]:', error);
  
  return {
    data: [] as T,
    count: 0,
    error: new Error(message),
  };
}

/**
 * Handle single record query error
 */
export function handleSingleQueryError<T>(error: unknown): QueryResult<T> {
  let message: string;
  
  if (typeof error === 'object' && error !== null && 'code' in error) {
    message = getErrorMessage(error as PostgrestError);
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error) || 'An unexpected error occurred';
  }

  console.error('[Query Error]:', error);
  
  return {
    data: null,
    error: new Error(message),
  };
}

/**
 * Assert that data is not null, throw if it is
 */
export function assertNotNull<T>(
  data: T | null,
  message = 'Data not found'
): asserts data is T {
  if (data === null || data === undefined) {
    throw new Error(message);
  }
}

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage = 'Operation failed'
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    console.error(`[${errorMessage}]:`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
