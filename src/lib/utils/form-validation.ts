// ============================================================================
// FORM VALIDATION - Zod schemas for all forms
// ============================================================================

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const EmailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const PhoneSchema = z
  .string()
  .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
  .optional();

export const URLSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// ============================================================================
// TALENT FORM SCHEMA
// ============================================================================

export const TalentFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: EmailSchema,
  phone: PhoneSchema,
  linkedin_url: URLSchema,
  website_url: URLSchema,
  country: z.string().min(1, 'Country is required'),
  city: z.string().optional(),
  industry: z.string().min(1, 'Industry is required'),
  seniority_level: z.string().min(1, 'Seniority level is required'),
  years_experience: z.number().min(0).optional(),
  headline: z.string().min(10, 'Headline must be at least 10 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  seeking_roles: z.array(z.string()).optional(),
  work_mode_preference: z.enum(['remote', 'hybrid', 'onsite']),
});

export type TalentFormData = z.infer<typeof TalentFormSchema>;

// ============================================================================
// SPONSOR FORM SCHEMA
// ============================================================================

export const SponsorFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: EmailSchema,
  phone: PhoneSchema,
  organization: z.string().min(2, 'Organization is required'),
  job_title: z.string().min(2, 'Job title is required'),
  industry: z.string().min(1, 'Industry is required'),
  linkedin_url: URLSchema,
  sponsor_type: z.enum(['individual', 'company', 'organization']),
  commitment_level: z.enum(['high', 'medium', 'low']),
  focus_areas: z.array(z.string()).min(1, 'Select at least one focus area'),
});

export type SponsorFormData = z.infer<typeof SponsorFormSchema>;

// ============================================================================
// CONTACT FORM SCHEMA
// ============================================================================

export const ContactFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: EmailSchema,
  inquiry_type: z.enum(['general', 'sponsorship', 'talent', 'partnership', 'media']),
  organization: z.string().optional(),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// ============================================================================
// TESTIMONIAL FORM SCHEMA
// ============================================================================

export const TestimonialFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  title: z.string().min(2, 'Title is required'),
  company: z.string().optional(),
  quote: z.string().min(30, 'Quote must be at least 30 characters'),
  is_active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export type TestimonialFormData = z.infer<typeof TestimonialFormSchema>;

// ============================================================================
// BLOG POST SCHEMA
// ============================================================================

export const BlogPostSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  slug: z.string().min(3, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be URL-friendly'),
  excerpt: z.string().min(50, 'Excerpt must be at least 50 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  author_name: z.string().min(2, 'Author name is required'),
  author_title: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

export type BlogPostFormData = z.infer<typeof BlogPostSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((error) => {
    const path = String(error.path.join('.'));
    errors[path] = error.message;
  });
  
  return { success: false, errors };
}

export function getFieldError(
  errors: Record<string, string>,
  field: string
): string | undefined {
  return errors[field];
}
