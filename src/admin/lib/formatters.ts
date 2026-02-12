// ============================================================================
// ADMIN FORMATTERS - Single Source of Truth for Data Formatting
// ============================================================================

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// ============================================================================
// DATE FORMATTERS
// ============================================================================

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param formatStr - date-fns format string (default: 'MMM dd, yyyy')
 */
export function formatDate(dateString: string | null | undefined, formatStr = 'MMM dd, yyyy'): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatStr) : '-';
  } catch {
    return '-';
  }
}

/**
 * Format a date string to include time
 * @param dateString - ISO date string
 */
export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '-';
  } catch {
    return '-';
  }
}

/**
 * Format a date for table display (short format)
 * @param dateString - ISO date string
 */
export function formatTableDate(dateString: string | null | undefined): string {
  return formatDate(dateString, 'MMM d, yyyy');
}

/**
 * Get date range for analytics
 * @param range - 'today' | '7days' | '30days' | '90days' | 'custom'
 * @param customRange - optional custom range
 */
export function getDateRange(
  range: 'today' | '7days' | '30days' | '90days' | 'custom',
  customRange?: { start: string; end: string }
): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  let start: Date;
  
  switch (range) {
    case 'today':
      start = new Date();
      start.setHours(0, 0, 0, 0);
      break;
    case '7days':
      start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case '30days':
      start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case '90days':
      start = new Date();
      start.setDate(start.getDate() - 90);
      start.setHours(0, 0, 0, 0);
      break;
    case 'custom':
      if (customRange) {
        start = parseISO(customRange.start);
        const customEnd = parseISO(customRange.end);
        if (isValid(start) && isValid(customEnd)) {
          return { start, end: customEnd };
        }
      }
      start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
  }
  
  return { start, end };
}

// ============================================================================
// FILE SIZE FORMATTERS
// ============================================================================

/**
 * Format file size in bytes to human-readable format
 * @param bytes - file size in bytes
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '-';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Get file extension from filename
 * @param filename - file name or path
 */
export function getFileExtension(filename: string | null | undefined): string {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is a CV/resume based on extension
 * @param filename - file name or path
 */
export function isCVFile(filename: string | null | undefined): boolean {
  const ext = getFileExtension(filename);
  return ['pdf', 'doc', 'docx'].includes(ext);
}

// ============================================================================
// NUMBER FORMATTERS
// ============================================================================

/**
 * Format a number with commas
 * @param num - number to format
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}

/**
 * Format a percentage
 * @param value - decimal value (0.5 = 50%)
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0%';
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format a currency value
 * @param amount - amount in cents
 * @param currency - currency code (default: USD)
 */
export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

// ============================================================================
// STRING FORMATTERS
// ============================================================================

/**
 * Truncate a string to a maximum length
 * @param str - string to truncate
 * @param maxLength - maximum length
 * @param suffix - suffix to add (default: '...')
 */
export function truncateString(str: string | null | undefined, maxLength = 50, suffix = '...'): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize the first letter of a string
 * @param str - string to capitalize
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to title case
 * @param str - string to convert
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Format a phone number to a standard format
 * @param phone - phone number string
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number
  if (cleaned.length < 10) return phone;
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Handle international numbers
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  return phone;
}

// ============================================================================
// STATUS FORMATTERS
// ============================================================================

import type { TalentStatus, SponsorStatus, RequestStatus, ContactSubmissionStatus } from '@/lib/database.types';
import { TALENT_STATUS_CONFIG, SPONSOR_STATUS_CONFIG, REQUEST_STATUS_CONFIG, MESSAGE_STATUS_CONFIG } from './types';

/**
 * Get talent status label
 */
export function getTalentStatusLabel(status: TalentStatus): string {
  return TALENT_STATUS_CONFIG[status]?.label || status;
}

/**
 * Get sponsor status label
 */
export function getSponsorStatusLabel(status: SponsorStatus): string {
  return SPONSOR_STATUS_CONFIG[status]?.label || status;
}

/**
 * Get request status label
 */
export function getRequestStatusLabel(status: RequestStatus): string {
  return REQUEST_STATUS_CONFIG[status]?.label || status;
}

/**
 * Get message status label
 */
export function getMessageStatusLabel(status: ContactSubmissionStatus): string {
  return MESSAGE_STATUS_CONFIG[status]?.label || status;
}

/**
 * Get talent status color
 */
export function getTalentStatusColor(status: TalentStatus): string {
  const colorMap: Record<string, string> = {
    draft: 'gray',
    submitted: 'yellow',
    vetted: 'blue',
    approved: 'green',
    rejected: 'red',
  };
  return colorMap[status] || 'gray';
}

/**
 * Get sponsor status color
 */
export function getSponsorStatusColor(status: SponsorStatus): string {
  const colorMap: Record<string, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
  };
  return colorMap[status] || 'gray';
}

/**
 * Get request status color
 */
export function getRequestStatusColor(status: RequestStatus): string {
  const colorMap: Record<string, string> = {
    requested: 'blue',
    accepted: 'green',
    declined: 'red',
    intro_sent: 'purple',
    closed: 'gray',
  };
  return colorMap[status] || 'gray';
}

/**
 * Get message status color
 */
export function getMessageStatusColor(status: ContactSubmissionStatus): string {
  const colorMap: Record<string, string> = {
    new: 'blue',
    read: 'gray',
    replied: 'green',
    archived: 'gray',
  };
  return colorMap[status] || 'gray';
}

// ============================================================================
// URL FORMATTERS
// ============================================================================

/**
 * Format a CV file path to a display URL
 * @param filePath - file path from Supabase storage
 * @returns Full public URL to the CV file
 */
export function formatCVUrl(filePath: string | null | undefined): string {
  if (!filePath) return '#';
  
  // If already a full URL, return as-is
  if (filePath.startsWith('http')) return filePath;
  
  // Construct Supabase storage public URL
  const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'];
  const bucketName = 'talent-cvs'; // Default CV bucket
  
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

/**
 * Get CV file name from path
 * @param filePath - file path from Supabase storage
 * @returns File name only
 */
export function getCVFileName(filePath: string | null | undefined): string {
  if (!filePath) return 'CV File';
  return filePath.split('/').pop() || 'CV File';
}

/**
 * Format a LinkedIn URL for display
 * @param url - LinkedIn URL
 */
export function formatLinkedInUrl(url: string | null | undefined): string {
  if (!url) return '-';
  if (url.startsWith('http')) return url;
  return `https://linkedin.com/in/${url}`;
}

/**
 * Format a portfolio URL for display
 * @param url - Portfolio URL
 */
export function formatPortfolioUrl(url: string | null | undefined): string {
  if (!url) return '-';
  if (url.startsWith('http')) return url;
  return `https://${url}`;
}

// ============================================================================
// ARRAY FORMATTERS
// ============================================================================

/**
 * Format an array as a comma-separated string
 * @param arr - array to format
 * @param maxItems - maximum items to display
 */
export function formatArray(arr: string[] | null | undefined, maxItems = 3): string {
  if (!arr || arr.length === 0) return '-';
  
  if (arr.length <= maxItems) {
    return arr.join(', ');
  }
  
  return `${arr.slice(0, maxItems).join(', ')} +${arr.length - maxItems} more`;
}

/**
 * Format a list of skills as badges
 * @param skills - array of skills
 * @param maxSkills - maximum skills to display
 */
export function formatSkills(skills: string[] | null | undefined, maxSkills = 5): string[] {
  if (!skills || skills.length === 0) return [];
  return skills.slice(0, maxSkills);
}

// ============================================================================
// EXPORT ALL FORMATTERS
// ============================================================================

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTableDate,
  getDateRange,
  formatFileSize,
  getFileExtension,
  isCVFile,
  formatNumber,
  formatPercentage,
  formatCurrency,
  truncateString,
  capitalize,
  toTitleCase,
  formatPhone,
  getTalentStatusLabel,
  getSponsorStatusLabel,
  getRequestStatusLabel,
  getMessageStatusLabel,
  getTalentStatusColor,
  getSponsorStatusColor,
  getRequestStatusColor,
  getMessageStatusColor,
  formatCVUrl,
  formatLinkedInUrl,
  formatPortfolioUrl,
  formatArray,
  formatSkills,
};
