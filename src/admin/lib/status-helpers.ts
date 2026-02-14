// ============================================================================
// STATUS HELPERS - Shared status helper functions
// ============================================================================

import { StatusVariants } from '@/lib/types/enums';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a human-readable label for a status value
 * Converts snake_case to Title Case
 */
export function getStatusLabel(status: string): string {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get the color name for a status value
 * Returns: 'green', 'red', 'blue', or 'gray'
 */
export function getStatusColor(status: string): string {
  const variant = StatusVariants[status];
  switch (variant) {
    case 'default':
      return 'green';
    case 'destructive':
      return 'red';
    case 'secondary':
      return 'blue';
    case 'outline':
    default:
      return 'gray';
  }
}
