// ============================================================================
// ENHANCED FORM VALIDATION HOOK
// Real-time validation with debouncing
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';

export type Validator<T> = (value: T, allValues?: Record<string, any>) => string | undefined;

export interface FieldConfig<T = any> {
  initialValue: T;
  validators?: Validator<T>[];
  required?: boolean;
  requiredMessage?: string;
}

export interface FieldState<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

export interface UseFormValidationOptions {
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  fields: { [K in keyof T]: FieldConfig<T[K]> },
  options: UseFormValidationOptions = {}
) {
  const {
    debounceMs = 300,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  // Initialize field states
  const [fieldStates, setFieldStates] = useState<{
    [K in keyof T]: FieldState<T[K]>;
  }>(() => {
    const initial: any = {};
    for (const key of Object.keys(fields)) {
      initial[key] = {
        value: fields[key as keyof T].initialValue,
        touched: false,
        dirty: false,
        validating: false,
      };
    }
    return initial;
  });

  // Track debounce timers
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  // Validate a single field
  const validateField = useCallback(<K extends keyof T>(
    fieldName: K,
    value: T[K],
    allValues: Record<string, any>
  ): string | undefined => {
    const config = fields[fieldName];
    
    // Check required
    if (config.required) {
      const isEmpty = value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0);
      
      if (isEmpty) {
        return config.requiredMessage || 'This field is required';
      }
    }

    // Run custom validators
    if (config.validators) {
      for (const validator of config.validators) {
        const error = validator(value, allValues);
        if (error) return error;
      }
    }

    return undefined;
  }, [fields]);

  // Update field value
  const setValue = useCallback(<K extends keyof T>(fieldName: K, value: T[K]) => {
    setFieldStates(prev => {
      const newStates = {
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          dirty: true,
        },
      };

      // Get all current values for cross-field validation
      const allValues: Record<string, any> = {};
      for (const key of Object.keys(newStates)) {
        allValues[key] = newStates[key as keyof T].value;
      }

      // Debounced validation
      if (validateOnChange) {
        if (debounceTimers.current[fieldName as string]) {
          clearTimeout(debounceTimers.current[fieldName as string]);
        }

        debounceTimers.current[fieldName as string] = setTimeout(() => {
          const error = validateField(fieldName, value, allValues);
          
          setFieldStates(current => ({
            ...current,
            [fieldName]: {
              ...current[fieldName],
              error,
              validating: false,
            },
          }));
        }, debounceMs);

        // Set validating state immediately
        newStates[fieldName].validating = true;
      }

      return newStates;
    });
  }, [validateField, debounceMs, validateOnChange]);

  // Handle blur
  const handleBlur = useCallback(<K extends keyof T>(fieldName: K) => {
    setFieldStates(prev => {
      const field = prev[fieldName];
      
      if (validateOnBlur && !field.touched) {
        const allValues: Record<string, any> = {};
        for (const key of Object.keys(prev)) {
          allValues[key] = prev[key as keyof T].value;
        }

        const error = validateField(fieldName, field.value, allValues);
        
        return {
          ...prev,
          [fieldName]: {
            ...field,
            touched: true,
            error,
          },
        };
      }

      return {
        ...prev,
        [fieldName]: {
          ...field,
          touched: true,
        },
      };
    });
  }, [validateField, validateOnBlur]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const allValues: Record<string, any> = {};
    for (const key of Object.keys(fieldStates)) {
      allValues[key] = fieldStates[key as keyof T].value;
    }

    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    for (const key of Object.keys(fields)) {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, fieldStates[fieldName].value, allValues);
      if (error) {
        isValid = false;
        newErrors[fieldName] = error;
      }
    }

    // Update all field states with errors
    setFieldStates(prev => {
      const updated: any = { ...prev };
      for (const key of Object.keys(updated)) {
        updated[key] = {
          ...updated[key],
          touched: true,
          error: newErrors[key as keyof T],
        };
      }
      return updated;
    });

    return isValid;
  }, [fieldStates, fields, validateField]);

  // Reset form
  const reset = useCallback(() => {
    const initial: any = {};
    for (const key of Object.keys(fields)) {
      initial[key] = {
        value: fields[key as keyof T].initialValue,
        touched: false,
        dirty: false,
        validating: false,
        error: undefined,
      };
    }
    setFieldStates(initial);
  }, [fields]);

  // Get form values
  const getValues = useCallback((): T => {
    const values: any = {};
    for (const key of Object.keys(fieldStates)) {
      values[key] = fieldStates[key as keyof T].value;
    }
    return values;
  }, [fieldStates]);

  // Check if form is valid
  const isValid = Object.values(fieldStates).every(f => !f.error && !f.validating);
  
  // Check if form is dirty
  const isDirty = Object.values(fieldStates).some(f => f.dirty);

  return {
    fields: fieldStates,
    setValue,
    handleBlur,
    validateAll,
    reset,
    getValues,
    isValid,
    isDirty,
    errors: Object.fromEntries(
      Object.entries(fieldStates).map(([k, v]) => [k, v.error])
    ) as { [K in keyof T]?: string },
  };
}

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

export const validators = {
  required: (message = 'This field is required') => (value: any): string | undefined => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    return undefined;
  },

  email: (message = 'Please enter a valid email') => (value: string): string | undefined => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return undefined;
  },

  minLength: (min: number, message?: string) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (max: number, message?: string) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length > max) {
      return message || `Must be less than ${max} characters`;
    }
    return undefined;
  },

  url: (message = 'Please enter a valid URL') => (value: string): string | undefined => {
    if (!value) return undefined;
    try {
      new URL(value);
      return undefined;
    } catch {
      return message;
    }
  },

  linkedin: (message = 'Please enter a valid LinkedIn URL') => (value: string): string | undefined => {
    if (!value) return undefined;
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\//i;
    if (!linkedinRegex.test(value)) {
      return message;
    }
    return undefined;
  },

  phone: (message = 'Please enter a valid phone number') => (value: string): string | undefined => {
    if (!value) return undefined;
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) {
      return message;
    }
    return undefined;
  },

  match: (fieldName: string, message = 'Fields do not match') => 
    (value: any, allValues?: Record<string, any>): string | undefined => {
      if (!allValues) return undefined;
      if (value !== allValues[fieldName]) {
        return message;
      }
      return undefined;
    },

  oneOf: (allowedValues: any[], message?: string) => (value: any): string | undefined => {
    if (!allowedValues.includes(value)) {
      return message || `Must be one of: ${allowedValues.join(', ')}`;
    }
    return undefined;
  },
};

export default useFormValidation;
