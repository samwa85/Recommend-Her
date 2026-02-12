// ============================================================================
// ADMIN TYPES - Single Source of Truth
// ============================================================================

import type {
  TalentProfile,
  SponsorProfile,
  RecommendationRequest,
  ContactSubmission,
  TalentStatus,
  SponsorStatus,
  RequestStatus,
  ContactSubmissionStatus,
} from '@/lib/database.types';

// ============================================================================
// ADMIN ENTITY TYPES
// ============================================================================

export interface AdminTalent extends TalentProfile {
  profile_name?: string;
  profile_email?: string;
  profile_phone?: string;
}

export interface AdminSponsor extends SponsorProfile {
  profile_name?: string;
  profile_email?: string;
  profile_phone?: string;
}

export interface AdminRequest extends RecommendationRequest {
  talent_name?: string;
  talent_headline?: string;
  sponsor_name?: string;
  sponsor_org?: string;
}

export interface AdminMessage extends ContactSubmission {
  sender_name?: string;
  sender_email?: string;
  sender_phone?: string;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface TalentFilters {
  status?: TalentStatus | 'all';
  industry?: string;
  seniority?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SponsorFilters {
  status?: SponsorStatus | 'all';
  sponsorType?: string;
  industry?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RequestFilters {
  status?: RequestStatus | 'all';
  type?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MessageFilters {
  status?: ContactSubmissionStatus | 'all';
  inquiryType?: string;
  dateFrom?: string;
  dateTo?: string;
}

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
// METRICS TYPES
// ============================================================================

export interface DashboardMetrics {
  // Talent metrics
  totalTalent: number;
  newTalentToday: number;
  newTalent7Days: number;
  newTalent30Days: number;
  
  // Sponsor metrics
  totalSponsors: number;
  newSponsorsToday: number;
  newSponsors7Days: number;
  newSponsors30Days: number;
  
  // Request metrics
  totalRequests: number;
  openRequests: number;
  newRequestsToday: number;
  newRequests7Days: number;
  
  // Message metrics
  totalMessages: number;
  unreadMessages: number;
  newMessagesToday: number;
  newMessages7Days: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface AnalyticsData {
  talentTrend: TimeSeriesData[];
  sponsorTrend: TimeSeriesData[];
  requestTrend: TimeSeriesData[];
  messageTrend: TimeSeriesData[];
  talentByStatus: Record<string, number>;
  talentByIndustry: Record<string, number>;
  talentByLocation: Record<string, number>;
  requestsByStatus: Record<string, number>;
}

// ============================================================================
// ACTIVITY LOG TYPES
// ============================================================================

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  actor_name?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export type ActivityType = 'talent' | 'sponsor' | 'request' | 'message' | 'system';

// ============================================================================
// ACTION TYPES
// ============================================================================

export type TalentAction = 'approve' | 'reject' | 'edit' | 'delete' | 'view' | 'download_cv';
export type SponsorAction = 'approve' | 'reject' | 'edit' | 'delete' | 'view' | 'archive';
export type RequestAction = 'accept' | 'decline' | 'send_intro' | 'close' | 'view' | 'assign';
export type MessageAction = 'mark_read' | 'mark_unread' | 'reply' | 'archive' | 'delete' | 'view';

// ============================================================================
// TIME RANGE TYPES
// ============================================================================

export type TimeRange = 'today' | '7days' | '30days' | '90days' | 'custom';

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
  requests: 'recommendation_requests',
  messages: 'contact_submissions',
  profiles: 'profiles',
  audit_logs: 'audit_logs',
} as const;

export const STORAGE_BUCKETS = {
  talent_cv: 'talent-cv',
  sponsor_docs: 'sponsor-docs',
} as const;

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================

export const TALENT_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'gray', icon: 'FileText' },
  submitted: { label: 'Pending Review', color: 'yellow', icon: 'Clock' },
  vetted: { label: 'Vetted', color: 'blue', icon: 'CheckCircle' },
  approved: { label: 'Approved', color: 'green', icon: 'CheckCircle2' },
  rejected: { label: 'Rejected', color: 'red', icon: 'XCircle' },
} as const;

export const SPONSOR_STATUS_CONFIG = {
  pending: { label: 'Pending Approval', color: 'yellow', icon: 'Clock' },
  approved: { label: 'Approved', color: 'green', icon: 'CheckCircle' },
  rejected: { label: 'Rejected', color: 'red', icon: 'XCircle' },
} as const;

export const REQUEST_STATUS_CONFIG = {
  requested: { label: 'Requested', color: 'blue', icon: 'MessageSquare' },
  accepted: { label: 'Accepted', color: 'green', icon: 'CheckCircle' },
  declined: { label: 'Declined', color: 'red', icon: 'XCircle' },
  intro_sent: { label: 'Intro Sent', color: 'purple', icon: 'Send' },
  closed: { label: 'Closed', color: 'gray', icon: 'Archive' },
} as const;

export const MESSAGE_STATUS_CONFIG = {
  new: { label: 'New', color: 'blue', icon: 'Mail' },
  read: { label: 'Read', color: 'gray', icon: 'MailOpen' },
  replied: { label: 'Replied', color: 'green', icon: 'Reply' },
  archived: { label: 'Archived', color: 'gray', icon: 'Archive' },
} as const;

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { TalentStatus, SponsorStatus, RequestStatus, ContactSubmissionStatus };
