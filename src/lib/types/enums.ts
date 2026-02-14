// ============================================================================
// ENUMS - Single Source of Truth for Status Values
// ============================================================================

/**
 * Talent profile status values
 * Database: talent_profiles.status
 */
export const TalentStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
} as const;

export type TalentStatus = typeof TalentStatus[keyof typeof TalentStatus];

/**
 * Sponsor profile status values
 * Database: sponsor_profiles.status
 */
export const SponsorStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;

export type SponsorStatus = typeof SponsorStatus[keyof typeof SponsorStatus];

/**
 * Sponsor type classification
 * Database: sponsor_profiles.sponsor_type
 */
export const SponsorType = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company',
  COMMUNITY: 'community',
} as const;

export type SponsorType = typeof SponsorType[keyof typeof SponsorType];

/**
 * Request types
 * Database: requests.request_type
 */
export const RequestType = {
  RECOMMENDATION: 'recommendation',
  SPONSORSHIP_INTRO: 'sponsorship_intro',
  TALENT_MATCH: 'talent_match',
  GENERAL: 'general',
} as const;

export type RequestType = typeof RequestType[keyof typeof RequestType];

/**
 * Request priority levels
 * Database: requests.priority
 */
export const RequestPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type RequestPriority = typeof RequestPriority[keyof typeof RequestPriority];

/**
 * Request workflow status
 * Database: requests.status
 */
export const RequestStatus = {
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CLOSED: 'closed',
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

/**
 * Message/Contact submission status
 * Database: messages.status
 */
export const MessageStatus = {
  UNREAD: 'unread',
  READ: 'read',
  REPLIED: 'replied',
  ARCHIVED: 'archived',
  SPAM: 'spam',
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

/**
 * File owner types (polymorphic)
 * Database: files.owner_type
 */
export const FileOwnerType = {
  TALENT: 'talent',
  SPONSOR: 'sponsor',
  REQUEST: 'request',
  MESSAGE: 'message',
} as const;

export type FileOwnerType = typeof FileOwnerType[keyof typeof FileOwnerType];

/**
 * Storage bucket names
 */
export const StorageBucket = {
  FILES: 'recommendher-files',
} as const;

export type StorageBucket = typeof StorageBucket[keyof typeof StorageBucket];

// ============================================================================
// STATUS LABELS - Human-readable labels
// ============================================================================

export const TALENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const SPONSOR_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  closed: 'Closed',
};

export const REQUEST_PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const MESSAGE_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
  spam: 'Spam',
};

// Combined status labels for generic use
export const StatusLabels: Record<string, string> = {
  ...TALENT_STATUS_LABELS,
  ...SPONSOR_STATUS_LABELS,
  ...REQUEST_STATUS_LABELS,
  ...MESSAGE_STATUS_LABELS,
};

/**
 * Get human-readable label for any status
 */
export function getStatusLabel(status: string): string {
  return StatusLabels[status] || status;
}

// ============================================================================
// STATUS CONFIGURATIONS - UI colors and variants
// ============================================================================

export type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export const StatusVariants: Record<string, StatusVariant> = {
  // Talent
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  archived: 'outline',
  
  // Sponsor
  active: 'default',
  inactive: 'secondary',
  
  // Request
  open: 'secondary',
  in_review: 'outline',
  closed: 'outline',
  
  // Message
  new: 'secondary',
  unread: 'secondary',
  read: 'outline',
  replied: 'default',
  spam: 'destructive',
};

/**
 * Get UI variant for status badge
 */
export function getStatusVariant(status: string): StatusVariant {
  return StatusVariants[status] || 'outline';
}

// ============================================================================
// INDUSTRY CONSTANTS
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

export type Industry = typeof INDUSTRIES[number];

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

export type RoleCategory = typeof ROLE_CATEGORIES[number];

export const COMMITMENT_LEVELS = [
  'Mentor (1-2 hours/month)',
  'Connector (2-5 hours/month)',
  'Sponsor (5-10 hours/month)',
  'Champion (10+ hours/month)',
] as const;

export type CommitmentLevel = typeof COMMITMENT_LEVELS[number];
