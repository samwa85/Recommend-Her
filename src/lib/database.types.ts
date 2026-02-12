// ============================================================================
// RECOMMENDHER DATABASE TYPES
// Generated from Supabase schema
// ============================================================================

export type UserRole = 'talent' | 'sponsor' | 'admin';
export type TalentStatus = 'draft' | 'submitted' | 'vetted' | 'approved' | 'rejected';
export type SponsorStatus = 'pending' | 'approved' | 'rejected';
export type RequestStatus = 'requested' | 'accepted' | 'declined' | 'intro_sent' | 'closed';
export type VettingDecision = 'approved' | 'rejected' | 'needs_changes';
export type OutcomeType = 'shortlisted' | 'interview' | 'offer' | 'hired' | 'no_fit';
export type SponsorType = 'mentor' | 'connector' | 'hiring' | 'board' | 'investor';

// ============================================================================
// CORE TABLES
// ============================================================================

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface TalentProfile {
  id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  years_experience?: number;
  industry?: string;
  seniority_level?: string;
  functions?: string[];
  skills?: string[];
  languages?: string[];
  linkedin_url?: string;
  portfolio_url?: string;
  cv_file_path?: string;
  status: TalentStatus;
  visibility: 'private' | 'vetted_only';
  admin_private_notes?: string;
  submitted_at?: string;
  vetted_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  
  // Join fields
  profiles?: Profile;
}

export interface SponsorProfile {
  id: string;
  user_id: string;
  org_name?: string;
  company_name?: string;
  contact_email?: string;
  company_size?: string;
  title?: string;
  industry?: string;
  sponsor_type?: SponsorType;
  commitment_note?: string;
  verified: boolean;
  status: SponsorStatus;
  created_at: string;
  updated_at: string;
  
  // Join fields
  profiles?: Profile;
}

export interface VettingReview {
  id: string;
  talent_id: string;
  admin_id?: string;
  decision: VettingDecision;
  feedback_to_talent?: string;
  internal_notes?: string;
  created_at: string;
  
  // Join fields
  talent_profiles?: TalentProfile;
  admin?: Profile;
}

export interface RecommendationRequest {
  id: string;
  sponsor_id: string;
  talent_id: string;
  message?: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  
  // Join fields
  sponsor_profiles?: SponsorProfile;
  talent_profiles?: TalentProfile;
}

export interface OpportunityOutcome {
  id: string;
  request_id: string;
  outcome: OutcomeType;
  notes?: string;
  outcome_date?: string;
  created_at: string;
  
  // Join fields
  recommendation_requests?: RecommendationRequest;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  
  // Join fields
  actor?: Profile;
}

// ============================================================================
// VIEWS
// ============================================================================

export interface PendingTalentReview {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  headline?: string;
  industry?: string;
  seniority_level?: string;
  years_experience?: number;
  submitted_at?: string;
  cv_file_path?: string;
  linkedin_url?: string;
  status: TalentStatus;
}

export interface PendingSponsorApproval {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  org_name?: string;
  company_name?: string;
  contact_email?: string;
  title?: string;
  industry?: string;
  sponsor_type?: SponsorType;
  commitment_note?: string;
  created_at: string;
}

export interface PublicTalentProfile {
  id: string;
  headline?: string;
  bio?: string;
  years_experience?: number;
  industry?: string;
  seniority_level?: string;
  functions?: string[];
  skills?: string[];
  languages?: string[];
  linkedin_url?: string;
  portfolio_url?: string;
  full_name: string;
  approved_at?: string;
}

export interface AdminDashboardMetrics {
  pending_talent_reviews: number;
  pending_sponsor_approvals: number;
  approved_talent: number;
  approved_sponsors: number;
  pending_requests: number;
  talent_last_7_days: number;
  requests_last_30_days: number;
}

export interface RecommendationRequestDetail {
  id: string;
  status: RequestStatus;
  message?: string;
  created_at: string;
  updated_at: string;
  sponsor_id: string;
  sponsor_name: string;
  sponsor_org?: string;
  talent_id: string;
  talent_name: string;
  talent_headline?: string;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface TalentProfileInput {
  headline: string;
  bio?: string;
  years_experience?: number;
  industry?: string;
  seniority_level?: string;
  functions?: string[];
  skills?: string[];
  languages?: string[];
  linkedin_url?: string;
  portfolio_url?: string;
  cv_file_path?: string;
}

export interface SponsorProfileInput {
  org_name?: string;
  title?: string;
  industry?: string;
  sponsor_type?: SponsorType;
  commitment_note?: string;
}

export interface AdminReviewInput {
  decision: VettingDecision;
  feedback_to_talent?: string;
  internal_notes?: string;
}

export interface RecommendationRequestInput {
  talent_id: string;
  message?: string;
}

export interface OutcomeInput {
  request_id: string;
  outcome: OutcomeType;
  notes?: string;
  outcome_date?: string;
}

// ============================================================================
// CONTACT SUBMISSION
// ============================================================================

export type ContactSubmissionStatus = 'new' | 'read' | 'replied' | 'archived';

export interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  inquiry_type: string;
  organization?: string;
  message: string;
  status: ContactSubmissionStatus;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
}

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

export const SENIORITY_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Executive',
  'C-Suite',
  'Board Member',
] as const;

export const FUNCTIONS = [
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
] as const;

export const SPONSOR_TYPES = [
  { value: 'mentor', label: 'Mentor' },
  { value: 'connector', label: 'Connector' },
  { value: 'hiring', label: 'Hiring Manager' },
  { value: 'board', label: 'Board Member' },
  { value: 'investor', label: 'Investor' },
] as const;

export const TALENT_STATUS_LABELS: Record<TalentStatus, string> = {
  draft: 'Draft',
  submitted: 'Pending Review',
  vetted: 'Vetted',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const SPONSOR_STATUS_LABELS: Record<SponsorStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  requested: 'Requested',
  accepted: 'Accepted',
  declined: 'Declined',
  intro_sent: 'Intro Sent',
  closed: 'Closed',
};

export const CONTACT_STATUS_LABELS: Record<ContactSubmissionStatus, string> = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
};
