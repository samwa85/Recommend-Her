// ============================================================================
// RECOMMENDHER DATABASE TYPES - Single Source of Truth
// Generated from: 001_recommendher_schema.sql
// ============================================================================

// ============================================================================
// ENUMS / CONSTANTS
// ============================================================================

export const TALENT_STATUS = ['pending', 'approved', 'rejected', 'archived'] as const;
export type TalentStatus = typeof TALENT_STATUS[number];

export const SPONSOR_STATUS = ['active', 'inactive', 'archived'] as const;
export type SponsorStatus = typeof SPONSOR_STATUS[number];

export const SPONSOR_TYPE = ['individual', 'company', 'community'] as const;
export type SponsorType = typeof SPONSOR_TYPE[number];

export const REQUEST_TYPE = ['recommendation', 'sponsorship_intro', 'talent_match', 'general'] as const;
export type RequestType = typeof REQUEST_TYPE[number];

export const REQUEST_PRIORITY = ['low', 'normal', 'high', 'urgent'] as const;
export type RequestPriority = typeof REQUEST_PRIORITY[number];

export const REQUEST_STATUS = ['open', 'in_review', 'approved', 'rejected', 'closed'] as const;
export type RequestStatus = typeof REQUEST_STATUS[number];

export const MESSAGE_STATUS = ['unread', 'read', 'replied', 'archived', 'spam'] as const;
export type MessageStatus = typeof MESSAGE_STATUS[number];

export const FILE_OWNER_TYPE = ['talent', 'sponsor', 'request', 'message'] as const;
export type FileOwnerType = typeof FILE_OWNER_TYPE[number];

// ============================================================================
// TABLE INTERFACES
// ============================================================================

/**
 * files - File metadata for CVs and attachments
 */
export interface File {
  id: string;                    // uuid PK
  owner_type: FileOwnerType;     // talent | sponsor | request | message
  owner_id: string;              // uuid
  bucket: string;                // default: 'recommendher-files'
  path: string;                  // Unique path in storage
  file_name: string;
  mime_type: string | null;
  file_size: number | null;      // bigint
  public_url: string | null;
  is_primary: boolean;           // default: false
  created_at: string;            // timestamptz
}

/**
 * talent_profiles - Talent/Candidate profiles
 */
export interface TalentProfile {
  id: string;                    // uuid PK
  
  // Personal Information
  full_name: string;
  email: string;                 // UNIQUE
  phone: string | null;
  location: string | null;
  country: string;               // default: 'Tanzania'
  
  // Professional Information
  headline: string | null;
  bio: string | null;
  current_company: string | null;
  current_title: string | null;
  years_experience: number | null;
  industry: string | null;
  role_category: string | null;
  
  // Skills as JSON array
  skills: string[];              // jsonb
  
  // Links
  linkedin_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  
  // CV File Reference
  cv_file_id: string | null;     // FK -> files.id
  
  // Status & Admin
  status: TalentStatus;          // default: 'pending'
  source_page: string | null;
  notes_admin: string | null;
  
  // Timestamps
  created_at: string;            // timestamptz
  updated_at: string;            // timestamptz
  
  // Joins (optional)
  cv_file?: File;
}

/**
 * sponsor_profiles - Sponsor/Mentor/Recruiter profiles
 */
export interface SponsorProfile {
  id: string;                    // uuid PK
  
  // Personal Information
  full_name: string;
  email: string;                 // UNIQUE
  phone: string | null;
  
  // Organization Information
  organization: string | null;
  job_title: string | null;
  industry: string | null;
  linkedin_url: string | null;
  
  // Sponsor Classification
  sponsor_type: SponsorType;     // default: 'individual'
  commitment_level: string | null;
  
  // Focus Areas as JSON array
  focus_areas: string[];         // jsonb
  
  // Status & Admin
  status: SponsorStatus;         // default: 'active'
  notes_admin: string | null;
  
  // Timestamps
  created_at: string;            // timestamptz
  updated_at: string;            // timestamptz
}

/**
 * requests - Recommendation requests and sponsorship introductions
 */
export interface Request {
  id: string;                    // uuid PK
  
  // Request Details
  request_type: RequestType;
  title: string | null;
  description: string;
  
  // Relationships
  talent_id: string | null;      // FK -> talent_profiles.id
  sponsor_id: string | null;     // FK -> sponsor_profiles.id
  
  // Workflow
  priority: RequestPriority;     // default: 'normal'
  status: RequestStatus;         // default: 'open'
  assigned_admin_id: string | null;
  due_date: string | null;       // date
  resolution_notes: string | null;
  source_page: string | null;
  
  // Timestamps
  created_at: string;            // timestamptz
  updated_at: string;            // timestamptz
  
  // Joins (optional)
  talent?: TalentProfile;
  sponsor?: SponsorProfile;
}

/**
 * messages - Contact form submissions and inquiries
 */
export interface Message {
  id: string;                    // uuid PK
  
  // Sender Information
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  
  // Message Content
  subject: string | null;
  message: string;
  page_source: string | null;
  
  // Status & Handling
  status: MessageStatus;         // default: 'unread'
  handled_by_admin_id: string | null;
  replied_at: string | null;     // timestamptz
  
  // Timestamps
  created_at: string;            // timestamptz
}

// ============================================================================
// VIEW INTERFACES
// ============================================================================

export interface TalentStatusCounts {
  status: TalentStatus;
  count: number;
  last_7_days: number;
  last_30_days: number;
}

export interface SponsorStatusCounts {
  status: SponsorStatus;
  count: number;
  last_7_days: number;
}

export interface RequestStatusCounts {
  status: RequestStatus;
  priority: RequestPriority;
  count: number;
  last_7_days: number;
}

export interface MessageStatusCounts {
  status: MessageStatus;
  count: number;
  last_24_hours: number;
}

export interface DashboardMetrics {
  total_talent: number;
  pending_talent: number;
  approved_talent: number;
  rejected_talent: number;
  total_sponsors: number;
  active_sponsors: number;
  total_requests: number;
  open_requests: number;
  total_messages: number;
  unread_messages: number;
  new_talent_7d: number;
  new_sponsors_7d: number;
}

export interface SubmissionTrend {
  date: string;                  // YYYY-MM-DD
  talent_count: number;
  sponsor_count: number;
  request_count: number;
  message_count: number;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface TalentProfileInput {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  country?: string;
  headline?: string;
  bio?: string;
  current_company?: string;
  current_title?: string;
  years_experience?: number;
  industry?: string;
  role_category?: string;
  skills?: string[];
  linkedin_url?: string;
  portfolio_url?: string;
  website_url?: string;
  source_page?: string;
}

export interface SponsorProfileInput {
  full_name: string;
  email: string;
  phone?: string;
  organization?: string;
  job_title?: string;
  industry?: string;
  linkedin_url?: string;
  sponsor_type?: SponsorType;
  commitment_level?: string;
  focus_areas?: string[];
}

export interface RequestInput {
  request_type: RequestType;
  title?: string;
  description: string;
  talent_id?: string;
  sponsor_id?: string;
  priority?: RequestPriority;
  due_date?: string;
  source_page?: string;
}

export interface MessageInput {
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  subject?: string;
  message: string;
  page_source?: string;
}

export interface FileInput {
  owner_type: FileOwnerType;
  owner_id: string;
  bucket?: string;
  path: string;
  file_name: string;
  mime_type?: string;
  file_size?: number;
  is_primary?: boolean;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface TalentFilters {
  status?: TalentStatus;
  industry?: string;
  role_category?: string;
  skills?: string[];
  location?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SponsorFilters {
  status?: SponsorStatus;
  sponsor_type?: SponsorType;
  industry?: string;
  focus_areas?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface RequestFilters {
  request_type?: RequestType;
  status?: RequestStatus;
  priority?: RequestPriority;
  talent_id?: string;
  sponsor_id?: string;
  assigned_admin_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface MessageFilters {
  status?: MessageStatus;
  sender_email?: string;
  handled_by_admin_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// ============================================================================
// CONSTANTS FOR UI
// ============================================================================

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Operations',
  'Human Resources',
  'Legal',
  'Consulting',
  'Non-profit',
  'Manufacturing',
  'Retail',
  'Media',
  'Real Estate',
  'Agriculture',
  'Energy',
  'Transportation',
  'Hospitality',
  'Government',
  'Other',
] as const;

export const ROLE_CATEGORIES = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Legal',
  'Customer Success',
  'Data',
  'Strategy',
  'General Management',
  'Executive',
  'Other',
] as const;

export const COMMITMENT_LEVELS = [
  'Mentor (1-2 hours/month)',
  'Connector (2-5 hours/month)',
  'Sponsor (5-10 hours/month)',
  'Champion (10+ hours/month)',
] as const;

export const STATUS_LABELS: Record<string, string> = {
  // Talent
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
  
  // Sponsor
  active: 'Active',
  inactive: 'Inactive',
  
  // Request
  open: 'Open',
  in_review: 'In Review',
  
  // Message
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
  spam: 'Spam',
};
