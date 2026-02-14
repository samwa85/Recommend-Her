// ============================================================================
// DATABASE TYPES - Generated from Supabase Schema
// Single source of truth for database table types
// ============================================================================

// ============================================================================
// BASE TYPES
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface TalentProfileRow {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  portfolio_url?: string | null;
  country: string | null;
  city: string | null;
  years_of_experience?: string | null;
  years_experience?: number | null;
  education_level: string | null;
  current_role_title?: string | null;
  seniority_level?: string | null;
  industry: string | null;
  seeking_roles?: string[] | null;
  role_category?: string | null;
  functions?: string[] | null;
  work_mode_preference: string | null;
  salary_range: string | null;
  headline: string | null;
  bio: string | null;
  skills: string[] | null;
  languages?: string[] | null;
  cv_file_id?: string | null;
  cv_file_path?: string | null;
  source: string | null;
  referral_code: string | null;
  gdpr_consent?: boolean;
  status: string;
  visibility?: string;
  internal_notes?: string | null;
  admin_private_notes?: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  reviewed_by: string | null;
}

export interface SponsorProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  company_name: string;
  company_website: string | null;
  company_size: string | null;
  industry: string | null;
  company_description: string | null;
  is_recruiter: boolean;
  job_title: string | null;
  focus_areas: string[] | null;
  role_types: string[] | null;
  sponsorship_amount: string | null;
  message: string | null;
  source: string | null;
  referral_code: string | null;
  gdpr_consent: boolean;
  status: string;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  last_contacted_at: string | null;
  handled_by_admin_id: string | null;
}

export interface RequestRow {
  id: string;
  request_type: string;
  talent_id: string | null;
  sponsor_id: string | null;
  description: string;
  priority: string | null;
  status: string;
  admin_notes: string | null;
  handled_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface MessageRow {
  id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  admin_reply: string | null;
  handled_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
  replied_at: string | null;
}

export interface FileRow {
  id: string;
  owner_type: string;
  owner_id: string;
  bucket: string;
  path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  public_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DOMAIN MODEL TYPES (CamelCase versions for UI)
// ============================================================================

export type TalentProfile = TalentProfileRow;
export type SponsorProfile = SponsorProfileRow;
export type Request = RequestRow;
export type Message = MessageRow;
export type FileRecord = FileRow;

// ============================================================================
// INSERT TYPES (for create operations)
// ============================================================================

export type TalentProfileInput = Omit<
  TalentProfileRow,
  'id' | 'created_at' | 'updated_at' | 'reviewed_at' | 'reviewed_by'
>;

export type SponsorProfileInput = Omit<
  SponsorProfileRow,
  'id' | 'created_at' | 'updated_at' | 'last_contacted_at' | 'handled_by_admin_id'
>;

export type RequestInput = Omit<
  RequestRow,
  'id' | 'created_at' | 'updated_at' | 'resolved_at' | 'handled_by_admin_id'
>;

export type MessageInput = Omit<
  MessageRow,
  'id' | 'created_at' | 'updated_at' | 'replied_at' | 'handled_by_admin_id' | 'admin_reply'
>;

export type FileInput = Omit<
  FileRow,
  'id' | 'created_at' | 'updated_at' | 'public_url'
>;

// ============================================================================
// UPDATE TYPES (for update operations)
// ============================================================================

export type TalentProfileUpdate = Partial<
  Omit<TalentProfileRow, 'id' | 'created_at'>
>;

export type SponsorProfileUpdate = Partial<
  Omit<SponsorProfileRow, 'id' | 'created_at'>
>;

export type RequestUpdate = Partial<Omit<RequestRow, 'id' | 'created_at'>>;

export type MessageUpdate = Partial<Omit<MessageRow, 'id' | 'created_at'>>;

export type FileUpdate = Partial<Omit<FileRow, 'id' | 'created_at'>>;

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface TalentFilters {
  status?: string;
  industry?: string;
  role_category?: string;
  seniority_level?: string;
  country?: string;
  city?: string;
  source?: string;
  education_level?: string;
  years_of_experience?: string;
  years_experience?: number;
  has_cv?: 'yes' | 'no' | '';
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SponsorFilters {
  status?: string;
  industry?: string;
  company_size?: string;
  is_recruiter?: boolean;
  sponsorship_amount?: string;
  source?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface RequestFilters {
  status?: string;
  request_type?: string;
  priority?: string;
  talent_id?: string;
  sponsor_id?: string;
  handled_by_admin_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface MessageFilters {
  status?: string;
  sender_email?: string;
  handled_by_admin_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// ============================================================================
// BLOG POST TYPES
// ============================================================================

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  video_url: string | null;
  author_name: string;
  author_title: string | null;
  author_image: string | null;
  category: string;
  tags: string[] | null;
  read_time: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type BlogPost = BlogPostRow;

export type BlogPostInput = Omit<
  BlogPostRow,
  'id' | 'created_at' | 'updated_at' | 'published_at' | 'created_by'
>;

export type BlogPostUpdate = Partial<
  Omit<BlogPostRow, 'id' | 'created_at' | 'created_by'>
>;

export interface BlogFilters {
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  author?: string;
  tag?: string;
  search?: string;
}

// ============================================================================
// SUPABASE DATABASE INTERFACE
// Used with createClient<Database>()
// ============================================================================

export interface Database {
  public: {
    Tables: {
      talent_profiles: {
        Row: TalentProfileRow;
        Insert: TalentProfileInput;
        Update: TalentProfileUpdate;
        Relationships: [];
      };
      sponsor_profiles: {
        Row: SponsorProfileRow;
        Insert: SponsorProfileInput;
        Update: SponsorProfileUpdate;
        Relationships: [];
      };
      requests: {
        Row: RequestRow;
        Insert: RequestInput;
        Update: RequestUpdate;
        Relationships: [];
      };
      messages: {
        Row: MessageRow;
        Insert: MessageInput;
        Update: MessageUpdate;
        Relationships: [];
      };
      files: {
        Row: FileRow;
        Insert: FileInput;
        Update: FileUpdate;
        Relationships: [];
      };
      blog_posts: {
        Row: BlogPostRow;
        Insert: BlogPostInput;
        Update: BlogPostUpdate;
        Relationships: [];
      };
    };
    Views: {
      v_talent_status_counts: {
        Row: { status: string; count: number };
      };
      v_sponsor_status_counts: {
        Row: { status: string; count: number };
      };
      v_request_status_counts: {
        Row: { status: string; count: number };
      };
      v_message_status_counts: {
        Row: { status: string; count: number };
      };
    };
    Functions: {
      get_submissions_trend: {
        Args: { days: number };
        Returns: { date: string; talent_count: number; sponsor_count: number }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
