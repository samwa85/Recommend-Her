// ============================================================================
// API Error Handling Utilities
// ============================================================================

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Standardize error responses from various sources
 */
export function normalizeError(error: unknown): APIError {
  // Handle Response objects (HTTP errors)
  if (error instanceof Response) {
    return {
      message: getHTTPErrorMessage(error.status),
      status: error.status,
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  // Handle API error objects
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    
    // Check for rate limiting
    if (err['status'] === 429 || 
        (typeof err['message'] === 'string' && err['message'].includes('Too many requests'))) {
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        status: 429,
        code: 'RATE_LIMITED',
      };
    }
    
    if (err['message']) {
      return {
        message: String(err['message']),
        status: typeof err['status'] === 'number' ? err['status'] : undefined,
        code: typeof err['code'] === 'string' ? err['code'] : undefined,
      };
    }
    
    if (err['error']) {
      return {
        message: String(err['error']),
      };
    }
  }
  
  // Fallback
  return {
    message: 'An unexpected error occurred',
  };
}

function getHTTPErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please sign in.';
    case 403:
      return 'Access denied. You do not have permission.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict. Resource may already exist.';
    case 429:
      return 'Too many requests. Please wait a moment.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return `Request failed with status ${status}`;
  }
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('network') || 
           error.message.includes('fetch') ||
           error.message.includes('connection');
  }
  return false;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status === 429;
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return err['status'] === 429 ||
           (typeof err['message'] === 'string' && 
            err['message'].toLowerCase().includes('too many requests'));
  }
  
  return false;
}
