// ============================================================================
// INPUT SANITIZATION UTILITIES
// Prevent XSS and sanitize user inputs
// ============================================================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags except allowed safe ones
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  // Future: allow specific safe HTML tags
  // const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'];
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize plain text - removes all HTML
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._%+-@]/g, '');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  const trimmed = url.trim();
  
  // Only allow http/https URLs
  if (!trimmed.match(/^https?:\/\//i)) {
    return '';
  }
  
  try {
    const parsed = new URL(trimmed);
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize phone number - keep only digits and basic formatting
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  return phone
    .replace(/[^\d+\-\(\)\s.]/g, '')
    .trim();
}

/**
 * Truncate text to max length
 */
export function truncateText(input: string, maxLength: number): string {
  if (!input || input.length <= maxLength) return input;
  return input.substring(0, maxLength) + '...';
}

/**
 * Validate file name - prevent directory traversal
 */
export function sanitizeFileName(filename: string): string {
  if (!filename) return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.\./g, '_') // Prevent directory traversal
    .substring(0, 255); // Max filename length
}

/**
 * Check for suspicious patterns (SQL injection attempts)
 */
export function containsSqlInjection(input: string): boolean {
  if (!input) return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
    /';\s*$/,
    /"\s*OR\s*""/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation result
 */
export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  errors: string[];
}

/**
 * Validate and sanitize talent profile input
 */
export function validateTalentInput(input: {
  full_name?: string;
  email?: string;
  headline?: string;
  bio?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  // Check for SQL injection
  const allFields = [input.full_name, input.email, input.headline, input.bio].filter(Boolean);
  if (allFields.some(f => containsSqlInjection(f!))) {
    errors.push('Invalid characters detected in input');
  }
  
  // Validate email
  if (!input.email || !input.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Invalid email format');
  }
  
  // Validate name length
  if (!input.full_name || input.full_name.length < 2 || input.full_name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  // Validate headline
  if (input.headline && input.headline.length > 200) {
    errors.push('Headline must be less than 200 characters');
  }
  
  // Validate URLs
  if (input.linkedin_url && !input.linkedin_url.match(/^https:\/\/(www\.)?linkedin\.com\//i)) {
    errors.push('Invalid LinkedIn URL');
  }
  
  return {
    valid: errors.length === 0,
    sanitized: {
      full_name: sanitizeText(input.full_name || ''),
      email: sanitizeEmail(input.email || ''),
      headline: sanitizeText(input.headline || ''),
      bio: sanitizeText(input.bio || ''),
      linkedin_url: sanitizeUrl(input.linkedin_url || ''),
      portfolio_url: sanitizeUrl(input.portfolio_url || ''),
    } as unknown as string,
    errors,
  };
}
