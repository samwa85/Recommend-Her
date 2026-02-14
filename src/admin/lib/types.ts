// ============================================================================
// ADMIN TYPES - Single Source of Truth
// Matches supabase/migrations schema
// ============================================================================

import type {
  TalentProfile,
  SponsorProfile,
  Request,
  Message,
  AdminUser,
  AuditLog,
  File,
  TalentStatus,
  SponsorStatus,
  RequestStatus,
  MessageStatus,
  Priority,
  AdminRole,
  AuditAction,
  EntityType,
  DashboardMetrics,
  RecentActivity,
} from '@/lib/database.types';

// ============================================================================
// RE-EXPORT CORE TYPES
// ============================================================================

export type {
  TalentProfile,
  SponsorProfile,
  Request,
  Message,
  AdminUser,
  AuditLog,
  File,
  TalentStatus,
  SponsorStatus,
  RequestStatus,
  MessageStatus,
  Priority,
  AdminRole,
  AuditAction,
  EntityType,
  DashboardMetrics,
  RecentActivity,
};

// ============================================================================
// ADMIN ENTITY TYPES (with joined/derived fields)
// ============================================================================

/**
 * Talent profile with admin-specific joined fields
 */
export interface AdminTalent extends TalentProfile {
  // Joined from relations
  cv_file?: File;
  // Derived/computed fields for admin UI
  days_since_submission?: number;
  request_count?: number;
}

/**
 * Sponsor profile with admin-specific joined fields
 */
export interface AdminSponsor extends SponsorProfile {
  // Derived/computed fields for admin UI
  request_count?: number;
  talent_matched_count?: number;
}

/**
 * Request with admin-specific joined fields
 */
export interface AdminRequest extends Request {
  // Joined from relations
  talent?: TalentProfile;
  sponsor?: SponsorProfile;
  assigned_admin?: AdminUser;
  // Derived fields
  days_open?: number;
}

/**
 * Message with admin-specific joined fields
 */
export interface AdminMessage extends Message {
  // Joined from relations
  handled_by?: AdminUser;
  // Derived fields
  days_since_sent?: number;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface TalentFilters {
  status?: TalentStatus | 'all';
  industry?: string;
  role_category?: string;
  seniority?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SponsorFilters {
  status?: SponsorStatus | 'all';
  sponsor_type?: SponsorType | 'all';
  industry?: string;
  commitment_level?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface RequestFilters {
  status?: RequestStatus | 'all';
  request_type?: RequestType | 'all';
  priority?: Priority | 'all';
  assigned_admin_id?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface MessageFilters {
  status?: MessageStatus | 'all';
  inquiry_type?: string;
  page_source?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AuditLogFilters {
  action?: AuditAction | 'all';
  entity_type?: EntityType | 'all';
  admin_id?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// TYPE ALIASES FOR CLARITY
// ============================================================================

export type RequestType = 'recommendation' | 'sponsorship_intro' | 'talent_match' | 'general';
export type SponsorType = 'individual' | 'company' | 'community';

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  perPage: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedData<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ============================================================================
// TIME SERIES DATA TYPES
// ============================================================================

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

// Alias for backwards compatibility
export type TimeSeriesData = TimeSeriesDataPoint;

/**
 * Activity log entry
 */
export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  admin_id?: string;
  admin_name?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsData {
  // Trend data
  talentTrend: TimeSeriesDataPoint[];
  sponsorTrend: TimeSeriesDataPoint[];
  requestTrend: TimeSeriesDataPoint[];
  messageTrend: TimeSeriesDataPoint[];
  
  // Breakdown by dimensions
  talentByStatus: Record<string, number>;
  talentByIndustry: Record<string, number>;
  talentByLocation: Record<string, number>;
  talentByRoleCategory?: Record<string, number>;
  
  sponsorsByType?: Record<string, number>;
  sponsorsByIndustry?: Record<string, number>;
  
  requestsByStatus: Record<string, number>;
  requestsByPriority?: Record<string, number>;
  requestsByType?: Record<string, number>;
  
  messagesByStatus?: Record<string, number>;
  messagesBySource?: Record<string, number>;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export type TalentAction = 'approve' | 'reject' | 'archive' | 'restore' | 'edit' | 'delete' | 'view' | 'download_cv';
export type SponsorAction = 'activate' | 'deactivate' | 'archive' | 'restore' | 'edit' | 'delete' | 'view';
export type RequestAction = 'approve' | 'reject' | 'close' | 'reopen' | 'assign' | 'edit' | 'delete' | 'view';
export type MessageAction = 'mark_read' | 'mark_unread' | 'reply' | 'archive' | 'mark_spam' | 'delete' | 'view';

// ============================================================================
// TIME RANGE TYPES
// ============================================================================

export type TimeRange = 'today' | '7days' | '30days' | '90days' | 'year' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

// ============================================================================
// ENTITY TO TABLE MAPPING
// ============================================================================

export const ENTITY_TABLES = {
  talent: 'talent_profiles',
  sponsors: 'sponsor_profiles',
  requests: 'requests',
  messages: 'messages',
  files: 'files',
  admin_users: 'admin_users',
  audit_logs: 'audit_logs',
} as const;

export const STORAGE_BUCKETS = {
  files: 'recommendher-files',
} as const;

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================

export const TALENT_STATUS_CONFIG: Record<TalentStatus, { label: string; color: string; icon: string }> = {
  submitted: { label: 'Submitted', color: 'blue', icon: 'Send' },
  pending: { label: 'Pending Review', color: 'yellow', icon: 'Clock' },
  vetted: { label: 'Vetted', color: 'purple', icon: 'CheckCircle' },
  approved: { label: 'Approved', color: 'green', icon: 'CheckCircle' },
  rejected: { label: 'Rejected', color: 'red', icon: 'XCircle' },
  archived: { label: 'Archived', color: 'gray', icon: 'Archive' },
};

export const SPONSOR_STATUS_CONFIG: Record<SponsorStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: 'yellow', icon: 'Clock' },
  active: { label: 'Active', color: 'green', icon: 'CheckCircle' },
  inactive: { label: 'Inactive', color: 'gray', icon: 'Pause' },
  archived: { label: 'Archived', color: 'gray', icon: 'Archive' },
  approved: { label: 'Approved', color: 'green', icon: 'CheckCircle' },
  rejected: { label: 'Rejected', color: 'red', icon: 'XCircle' },
};

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; icon: string }> = {
  open: { label: 'Open', color: 'blue', icon: 'Circle' },
  in_review: { label: 'In Review', color: 'yellow', icon: 'Eye' },
  approved: { label: 'Approved', color: 'green', icon: 'CheckCircle' },
  rejected: { label: 'Rejected', color: 'red', icon: 'XCircle' },
  closed: { label: 'Closed', color: 'gray', icon: 'Archive' },
};

export const MESSAGE_STATUS_CONFIG: Record<MessageStatus, { label: string; color: string; icon: string }> = {
  new: { label: 'New', color: 'blue', icon: 'Mail' },
  unread: { label: 'Unread', color: 'blue', icon: 'Mail' },
  read: { label: 'Read', color: 'gray', icon: 'MailOpen' },
  replied: { label: 'Replied', color: 'green', icon: 'Reply' },
  archived: { label: 'Archived', color: 'gray', icon: 'Archive' },
  spam: { label: 'Spam', color: 'red', icon: 'AlertTriangle' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'gray' },
  normal: { label: 'Normal', color: 'blue' },
  high: { label: 'High', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' },
};

export const ADMIN_ROLE_CONFIG: Record<AdminRole, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'purple' },
  admin: { label: 'Admin', color: 'blue' },
  viewer: { label: 'Viewer', color: 'gray' },
};

// ============================================================================
// REQUEST TYPE CONFIG
// ============================================================================

export const REQUEST_TYPE_CONFIG: Record<RequestType, { label: string; description: string }> = {
  recommendation: { 
    label: 'Recommendation', 
    description: 'Request for talent recommendation' 
  },
  sponsorship_intro: { 
    label: 'Sponsorship Intro', 
    description: 'Request introduction to a sponsor' 
  },
  talent_match: { 
    label: 'Talent Match', 
    description: 'Request to match with specific talent' 
  },
  general: { 
    label: 'General', 
    description: 'General inquiry or request' 
  },
};

// ============================================================================
// SPONSOR TYPE CONFIG
// ============================================================================

export const SPONSOR_TYPE_CONFIG: Record<SponsorType, { label: string; description: string }> = {
  individual: { label: 'Individual', description: 'Individual mentor or connector' },
  company: { label: 'Company', description: 'Corporate sponsor or hiring company' },
  community: { label: 'Community', description: 'Community organization or network' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate days since a given date
 */
export function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const days = daysSince(dateString);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}