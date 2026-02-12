// ============================================================================
// VALIDATION UTILITIES - Data validation helpers
// ============================================================================

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

export const validators = {
  required: (message = 'This field is required'): ValidationRule<unknown> => ({
    validate: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= max,
    message: message || `Must be at most ${max} characters`,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value <= max,
    message: message || `Must be at most ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule<string> => ({
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> => ({
    validate: (value) => /^[\d\s\-\+\(\)]{10,}$/.test(value),
    message,
  }),

  uuid: (message = 'Invalid ID format'): ValidationRule<string> => ({
    validate: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
    message,
  }),
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a single value against multiple rules
 */
export function validateValue<T>(
  value: T,
  rules: ValidationRule<T>[]
): string | null {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate an object against a schema
 */
export function validateObject<T extends Record<string, unknown>>(
  obj: T,
  schema: Record<keyof T, ValidationRule<unknown>[]>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [key, rules] of Object.entries(schema)) {
    const error = validateValue(obj[key], rules as ValidationRule<unknown>[]);
    if (error) {
      errors[key] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// SANITIZATION
// ============================================================================

export const sanitizers = {
  trim: (value: string): string => value.trim(),
  
  lowercase: (value: string): string => value.toLowerCase(),
  
  uppercase: (value: string): string => value.toUpperCase(),
  
  removeSpaces: (value: string): string => value.replace(/\s/g, ''),
  
  removeSpecialChars: (value: string): string => value.replace(/[^a-zA-Z0-9]/g, ''),
  
  normalizeEmail: (value: string): string => {
    const [local, domain] = value.toLowerCase().trim().split('@');
    if (!domain) return value;
    
    // Remove dots and everything after + in Gmail
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      return `${local.replace(/\./g, '').split('+')[0]}@${domain}`;
    }
    
    return `${local}@${domain}`;
  },
};

// ============================================================================
// SCHEMA BUILDER
// ============================================================================

export class ValidationSchema<T extends Record<string, unknown>> {
  private schema: Record<string, ValidationRule<unknown>[]> = {};

  field<K extends keyof T>(
    key: K,
    ...rules: ValidationRule<T[K]>[]
  ): this {
    this.schema[key as string] = rules as ValidationRule<unknown>[];
    return this;
  }

  validate(data: T): ValidationResult {
    return validateObject(data, this.schema as Record<keyof T, ValidationRule<unknown>[]>);
  }
}

// ============================================================================
// PRE-BUILT SCHEMAS
// ============================================================================

export const schemas = {
  email: [validators.required(), validators.email()],
  
  password: [
    validators.required(),
    validators.minLength(8),
    validators.pattern(/[A-Z]/, 'Must contain at least one uppercase letter'),
    validators.pattern(/[a-z]/, 'Must contain at least one lowercase letter'),
    validators.pattern(/[0-9]/, 'Must contain at least one number'),
  ],
  
  phone: [validators.required(), validators.phone()],
  
  url: [validators.required(), validators.url()],
  
  uuid: [validators.required(), validators.uuid()],
};

export default {
  validators,
  validateValue,
  validateObject,
  sanitizers,
  ValidationSchema,
  schemas,
};
