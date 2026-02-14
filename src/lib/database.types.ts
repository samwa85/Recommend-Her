// ============================================================================
// RECOMMENDHER DATABASE TYPES
// Single Source of Truth - Matches supabase/migrations/001_recommendher_schema.sql
// ============================================================================

// ============================================================================
// STATUS TYPES (Enums)
// ============================================================================

export type TalentStatus = 'submitted' | 'pending' | 'vetted' | 'approved' | 'rejected' | 'archived';
export type SponsorStatus = 'pending' | 'active' | 'inactive' | 'archived' | 'approved' | 'rejected';
export type RequestStatus = 'open' | 'in_review' | 'approved' | 'rejected' | 'closed';
export type MessageStatus = 'new' | 'unread' | 'read' | 'replied' | 'archived' | 'spam';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type SponsorType = 'individual' | 'company' | 'community';
export type AdminRole = 'super_admin' | 'admin' | 'viewer';
export type AuditAction = 'created' | 'updated' | 'deleted' | 'status_changed' | 'viewed' | 'downloaded' | 'exported' | 'logged_in' | 'logged_out';
export type EntityType = 'talent' | 'sponsor' | 'request' | 'message' | 'file' | 'admin_user' | 'system';
export type FileOwnerType = 'talent' | 'sponsor' | 'request' | 'message';

// ============================================================================
// CORE TABLES
// ============================================================================

/**
 * Files table - Stores metadata for files uploaded to Supabase Storage
 * Used for CVs, attachments, etc.
 */
export interface File {
  id: string;
  owner_type: FileOwnerType;
  owner_id: string;
  bucket: string;
  path: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  public_url: string | null;
  is_primary: boolean;
  created_at: string;
}

/**
 * Talent Profiles - Stores all "For Talent" submissions
 */
export interface TalentProfile {
  id: string;
  
  // Personal Information
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  country: string;
  
  // Professional Information
  headline: string | null;
  bio: string | null;
  current_company: string | null;
  current_title: string | null;
  years_experience: number | null;
  industry: string | null;
  role_category: string | null;
  
  // Skills (JSON array)
  skills: string[] | null;
  
  // Links
  linkedin_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  
  // CV File Reference
  cv_file_id: string | null;
  
  // Status & Admin
  status: TalentStatus;
  source_page: string | null;
  notes_admin: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations
  cv_file?: File;
  
  // Legacy aliases for backwards compatibility
  /** @deprecated Use cv_file_id instead */
  cv_file_path?: string | null;
  /** @deprecated Use current_title instead */
  seniority_level?: string | null;
  /** @deprecated Use role_category instead */
  functions?: string[] | null;
  /** @deprecated Use years_experience instead */
  years_of_experience?: string | null;
  /** @deprecated Use created_at instead */
  submitted_at?: string;
  /** @deprecated Use full_name/email directly */
  profiles?: { full_name: string; email: string } | null;
}

/**
 * Sponsor Profiles - Stores "For Sponsors" pledge/profile submissions
 */
export interface SponsorProfile {
  id: string;
  
  // Personal Information
  full_name: string;
  email: string;
  phone: string | null;
  
  // Organization Information
  organization: string | null;
  job_title: string | null;
  industry: string | null;
  linkedin_url: string | null;
  
  // Sponsor Classification
  sponsor_type: SponsorType;
  commitment_level: string | null;
  
  // Focus Areas (JSON array)
  focus_areas: string[] | null;
  
  // Status & Admin
  status: SponsorStatus;
  notes_admin: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Legacy aliases for backwards compatibility
  /** @deprecated Use organization instead */
  org_name?: string | null;
  /** @deprecated Use job_title instead */
  title?: string | null;
  /** @deprecated Use notes_admin instead */
  commitment_note?: string | null;
  /** @deprecated Use full_name/email directly */
  profiles?: { full_name: string; email: string } | null;
  /** @deprecated Use sponsor_type instead */
  sponsorType?: SponsorType;
  /** @deprecated Use organization instead */
  company_name?: string | null;
  /** @deprecated Use email instead */
  contact_email?: string | null;
  /** @deprecated - No direct equivalent in schema */
  company_size?: string | null;
}

/**
 * Requests - Powers the Requests admin module
 * Used for recommendation requests, sponsorship intros, talent matching, etc.
 */
export interface Request {
  id: string;
  
  // Request Details
  request_type: 'recommendation' | 'sponsorship_intro' | 'talent_match' | 'general';
  title: string | null;
  description: string;
  
  // Relationships
  talent_id: string | null;
  sponsor_id: string | null;
  
  // Workflow
  priority: Priority;
  status: RequestStatus;
  assigned_admin_id: string | null;
  due_date: string | null;
  resolution_notes: string | null;
  source_page: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations
  talent?: TalentProfile;
  sponsor?: SponsorProfile;
  assigned_admin?: AdminUser;
}

/**
 * Messages - All contact form messages + inbound messages
 */
export interface Message {
  id: string;
  
  // Sender Information
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  
  // Message Content
  subject: string | null;
  message: string;
  page_source: string | null;
  
  // Status & Handling
  status: MessageStatus;
  handled_by_admin_id: string | null;
  replied_at: string | null;
  
  // Timestamp
  created_at: string;
  
  // Relations
  handled_by?: AdminUser;
  
  // Legacy aliases for backwards compatibility
  /** @deprecated Use sender_name instead */
  full_name?: string;
  /** @deprecated Use sender_email instead */
  email?: string;
  /** @deprecated Use page_source instead */
  inquiry_type?: string;
  /** @deprecated Use sender_name/sender_email contextually */
  organization?: string;
}

/**
 * Admin Users - Admin dashboard access and audit tracking
 */
export interface AdminUser {
  id: string;
  
  // Identity
  auth_user_id: string | null;
  
  // Profile
  full_name: string;
  email: string;
  avatar_url: string | null;
  
  // Role & Permissions
  role: AdminRole;
  
  // Status
  is_active: boolean;
  last_login_at: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Audit Logs - Audit trail for all admin actions
 */
export interface AuditLog {
  id: string;
  
  // Actor
  admin_id: string | null;
  admin_email: string | null;
  
  // Action Details
  action: AuditAction;
  
  // Entity
  entity_type: EntityType;
  entity_id: string | null;
  
  // Change Data
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  
  // Context
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  
  // Timestamp
  created_at: string;
  
  // Relations
  admin?: AdminUser;
}

// ============================================================================
// VIEW TYPES
// ============================================================================

export interface TalentStatusCount {
  status: TalentStatus;
  count: number;
  last_7_days: number;
  last_30_days: number;
}

export interface SponsorStatusCount {
  status: SponsorStatus;
  count: number;
  last_7_days: number;
}

export interface RequestStatusCount {
  status: RequestStatus;
  priority: Priority;
  count: number;
  last_7_days: number;
}

export interface MessageStatusCount {
  status: MessageStatus;
  count: number;
  last_24_hours: number;
}

export interface RecentActivity {
  id: string;
  action: AuditAction;
  entity_type: EntityType;
  entity_id: string | null;
  admin_name: string;
  admin_email: string | null;
  created_at: string;
  entity_name: string | null;
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
  request_type: 'recommendation' | 'sponsorship_intro' | 'talent_match' | 'general';
  title?: string;
  description: string;
  talent_id?: string;
  sponsor_id?: string;
  priority?: Priority;
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
  public_url?: string;
  is_primary?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ============================================================================
// DASHBOARD METRICS
// ============================================================================

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
  new_talent_today?: number;
  new_talent_7d?: number;
  new_talent_30d?: number;
  new_sponsors_today?: number;
  new_sponsors_7d?: number;
  new_sponsors_30d?: number;
  new_requests_today?: number;
  new_requests_7d?: number;
  new_messages_today?: number;
  new_messages_7d?: number;
  pending_talent_reviews?: number;
  pending_sponsor_approvals?: number;
  approved_sponsors?: number;
  talent_last_7_days?: number;
  requests_last_30_days?: number;
  pending_requests?: number;
}

export interface SubmissionsTrend {
  date: string;
  talent_count: number;
  sponsor_count: number;
  request_count: number;
  message_count: number;
}

// ============================================================================
// ADMIN TYPES (for views and RPCs)
// ============================================================================

export interface VettingReview {
  id: string;
  talent_id: string;
  reviewer_id: string;
  review_notes?: string;
  vetting_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface OpportunityOutcome {
  id: string;
  request_id: string;
  outcome_type: 'hired' | 'interviewed' | 'declined' | 'no_response';
  notes?: string;
  created_at: string;
}

export interface PendingTalentReview {
  id: string;
  full_name: string;
  email: string;
  headline?: string;
  industry?: string;
  seniority_level?: string;
  years_experience?: number;
  linkedin_url?: string;
  cv_file_path?: string;
  status: string;
  submitted_at: string;
  days_pending: number;
}

export interface PendingSponsorApproval {
  id: string;
  company_name: string;
  contact_email: string;
  sponsor_type: string;
  status: string;
  created_at: string;
  // Legacy aliases
  full_name?: string;
  email?: string;
  title?: string;
  org_name?: string;
  industry?: string;
  commitment_note?: string;
  company_size?: string;
}

export interface PublicTalentProfile {
  id: string;
  full_name: string;
  headline?: string;
  bio?: string;
  industry?: string;
  years_of_experience?: string;
  role_category?: string;
  seeking_roles?: string[];
  skills?: string[];
  linkedin_url?: string;
  website_url?: string;
  is_public: boolean;
}

export type AdminDashboardMetrics = DashboardMetrics;

export interface RecommendationRequestDetail extends RecommendationRequest {
  talent_name?: string;
  sponsor_name?: string;
  message?: string;
  sponsor_org?: string;
}

export interface AdminReviewInput {
  decision: 'approved' | 'rejected' | 'needs_changes';
  feedback_to_talent?: string;
  internal_notes?: string;
}

export type OutcomeType = 'hired' | 'interviewed' | 'declined' | 'no_response';
export type VettingDecision = 'approved' | 'needs_changes' | 'rejected';

// ============================================================================
// CONSTANTS
// ============================================================================

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Marketing',
  'Operations',
  'Human Resources',
  'Legal',
  'Consulting',
  'Non-profit',
  'Education',
  'Manufacturing',
  'Retail',
  'Media',
  'Other',
] as const;

export const ROLE_CATEGORIES = [
  'Leadership',
  'Tech',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Legal',
  'Product',
  'Design',
  'Data',
  'Other',
] as const;

export const SENIORITY_LEVELS = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
  'C-Level',
  'Executive',
] as const;

export const FUNCTIONS = [
  'Engineering',
  'Product Management',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'Human Resources',
  'Legal',
  'Customer Success',
  'Data Science',
  'Business Development',
  'Strategy',
  'Communications',
  'Other',
] as const;

export const COMMITMENT_LEVELS = [
  'intro_calls',
  'referrals',
  'mentorship',
  'board_roles',
  'investments',
  'hiring',
] as const;

export const SPONSOR_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
  { value: 'community', label: 'Community Organization' },
] as const;

export const TALENT_STATUS_LABELS: Record<TalentStatus, string> = {
  submitted: 'Submitted',
  pending: 'Pending Review',
  vetted: 'Vetted',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const SPONSOR_STATUS_LABELS: Record<SponsorStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  open: 'Open',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  closed: 'Closed',
};

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  new: 'New',
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
  spam: 'Spam',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  viewer: 'Viewer',
};

// ============================================================================
// LEGACY TYPES (For backwards compatibility)
// ============================================================================

// These are kept for backwards compatibility with existing code
// New code should use the types above

/** @deprecated Use TalentProfile instead */
export type Profile = {
  id: string;
  role: 'talent' | 'sponsor' | 'admin';
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  location?: string;
  created_at: string;
  updated_at: string;
};

/** @deprecated Use Message instead */
export type ContactSubmission = Message;

/** @deprecated Use MessageStatus instead */
export type ContactSubmissionStatus = MessageStatus;

/** @deprecated Use Request instead */
export type RecommendationRequest = Request;

/** @deprecated Use RequestStatus instead */
export type OldRequestStatus = 'requested' | 'accepted' | 'declined' | 'intro_sent' | 'closed';