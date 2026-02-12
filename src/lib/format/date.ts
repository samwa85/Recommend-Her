// ============================================================================
// DATE FORMATTERS - Single Source of Truth for Date Formatting
// ============================================================================

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format date to human-readable string
 * @param date - Date string or null
 * @param fmt - Format pattern (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  date: string | null | undefined,
  fmt = 'MMM dd, yyyy'
): string {
  if (!date) return '-';
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, fmt) : '-';
}

/**
 * Format date with time
 * @param date - Date string or null
 * @returns Formatted datetime string
 */
export function formatDateTime(date: string | null | undefined): string {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date string or null
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | null | undefined): string {
  if (!date) return '-';
  const parsed = parseISO(date);
  return isValid(parsed) ? formatDistanceToNow(parsed, { addSuffix: true }) : '-';
}

/**
 * Format date for table display (shorter format)
 * @param date - Date string or null
 * @returns Short formatted date string
 */
export function formatTableDate(date: string | null | undefined): string {
  return formatDate(date, 'MMM dd');
}

// ============================================================================
// DATE RANGE HELPERS
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
}

/**
 * Get date range for analytics queries
 * @param range - Predefined range
 * @returns Start and end ISO strings
 */
export function getDateRange(
  range: 'today' | '7days' | '30days' | '90days' | 'year'
): DateRange {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7days':
      start.setDate(start.getDate() - 7);
      break;
    case '30days':
      start.setDate(start.getDate() - 30);
      break;
    case '90days':
      start.setDate(start.getDate() - 90);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Get date N days ago as ISO string
 * @param days - Number of days
 * @returns ISO date string
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Check if date is today
 * @param date - Date string
 * @returns Boolean
 */
export function isToday(date: string): boolean {
  const parsed = parseISO(date);
  if (!isValid(parsed)) return false;
  
  const today = new Date();
  return (
    parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()
  );
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTableDate,
  getDateRange,
  getDaysAgo,
  isToday,
};
