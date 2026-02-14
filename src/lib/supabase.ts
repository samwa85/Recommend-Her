import { createClient } from '@supabase/supabase-js';
import type {
  Profile,
  TalentProfile,
  SponsorProfile,
  VettingReview,
  RecommendationRequest,
  OpportunityOutcome,
  AuditLog,
  PendingTalentReview,
  PendingSponsorApproval,
  PublicTalentProfile,
  AdminDashboardMetrics,
  RecommendationRequestDetail,
  TalentProfileInput,
  SponsorProfileInput,
  AdminReviewInput,
  SponsorStatus,
  RequestStatus,
  OutcomeType,
} from './database.types';

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'];
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  Profile,
  TalentProfile,
  SponsorProfile,
  VettingReview,
  RecommendationRequest,
  OpportunityOutcome,
  AuditLog,
  PendingTalentReview,
  PendingSponsorApproval,
  PublicTalentProfile,
  AdminDashboardMetrics,
  RecommendationRequestDetail,
};

// ============================================================================
// AUTH HELPERS
// ============================================================================

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return data;
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
}

// ============================================================================
// TALENT PROFILE API
// ============================================================================

export async function submitTalentProfile(input: TalentProfileInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('submit_talent_profile', {
    p_user_id: user.id,
    p_headline: input.headline,
    p_bio: input.bio || '',
    p_years_experience: input.years_experience || 0,
    p_industry: input.industry || '',
    p_current_title: input.current_title || '',
    p_role_category: input.role_category || '',
    p_skills: input.skills || [],
    p_linkedin_url: input.linkedin_url || '',
    p_portfolio_url: input.portfolio_url,
    p_website_url: input.website_url,
  });

  return { data, error };
}

export async function getMyTalentProfile(): Promise<TalentProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data;
}

export async function getApprovedTalent(options?: {
  industry?: string;
  seniority?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('v_public_talent_profiles')
    .select('*', { count: 'exact' });

  if (options?.industry) {
    query = query.eq('industry', options.industry);
  }
  if (options?.seniority) {
    query = query.eq('current_role_title', options.seniority);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  return { data, error, count };
}

// ============================================================================
// SPONSOR PROFILE API
// ============================================================================

export async function createSponsorProfile(input: SponsorProfileInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('sponsor_profiles')
    .insert({
      user_id: user.id,
      ...input,
      status: 'pending',
    })
    .select()
    .single();

  return { data, error };
}

export async function getMySponsorProfile(): Promise<SponsorProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('sponsor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data;
}

// ============================================================================
// ADMIN API
// ============================================================================

export async function getAdminMetrics(): Promise<AdminDashboardMetrics | null> {
  const { data } = await supabase
    .from('v_admin_dashboard_metrics')
    .select('*')
    .single();
  
  return data;
}

export async function getPendingTalentReviews(): Promise<PendingTalentReview[]> {
  const { data } = await supabase
    .from('v_pending_talent_reviews')
    .select('*')
    .order('submitted_at', { ascending: true });
  
  return data || [];
}

export async function getPendingSponsorApprovals(): Promise<PendingSponsorApproval[]> {
  const { data } = await supabase
    .from('v_pending_sponsor_approvals')
    .select('*')
    .order('created_at', { ascending: true });
  
  return data || [];
}

export async function adminReviewTalent(
  talentId: string,
  input: AdminReviewInput
) {
  const { data, error } = await supabase.rpc('admin_review_talent', {
    p_talent_id: talentId,
    p_decision: input.decision,
    p_feedback_to_talent: input.feedback_to_talent,
    p_internal_notes: input.internal_notes,
  });

  return { data, error };
}

export async function adminReviewSponsor(
  sponsorId: string,
  decision: SponsorStatus
) {
  const { data, error } = await supabase.rpc('admin_review_sponsor', {
    p_sponsor_id: sponsorId,
    p_decision: decision,
  });

  return { data, error };
}

export async function getAllTalent(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  // Use LEFT JOIN to include talent even if profiles record is missing (anonymous)
  // This ensures we don't lose data due to missing profile records
  let query = supabase
    .from('talent_profiles')
    .select(`
      *,
      profiles:profiles!left(full_name, email)
    `, { count: 'exact' });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('getAllTalent error:', error);
  }
  
  // Log details for debugging
  if (data && data.length > 0) {
    const withProfile = data.filter((d: { profiles: unknown }) => d.profiles !== null).length;
    const withoutProfile = data.filter((d: { profiles: unknown }) => d.profiles === null).length;
    console.log(`getAllTalent results: ${data.length} total (${withProfile} with profile, ${withoutProfile} without)`);
  }
  
  return { data, error, count };
}

// Diagnostic function to check raw talent profile data
export async function getTalentProfileDebug() {
  // Get raw talent_profiles without joins
  const { data: rawTalent, error: rawError } = await supabase
    .from('talent_profiles')
    .select('*')
    .limit(10);
  
  // Get count by status
  const { data: statusCounts, error: countError } = await supabase
    .rpc('get_talent_status_counts');
  
  console.log('Raw talent_profiles sample:', rawTalent?.length, rawError);
  console.log('Status counts:', statusCounts, countError);
  
  return { rawTalent, rawError, statusCounts, countError };
}

// Test function to verify database is recording data
export async function testDatabaseRecording() {
  console.log('🧪 [Test] Testing database recording...');
  
  // Count before
  const { count: beforeCount } = await supabase
    .from('talent_profiles')
    .select('*', { count: 'exact', head: true });
  
  console.log('🧪 [Test] Talent count before:', beforeCount);
  
  // Try to insert a test record
  const testId = `test-${Date.now()}`;
  const { data: insertData, error: insertError } = await supabase.rpc('submit_talent_profile_anon', {
    p_full_name: 'Test User',
    p_email: `test-${testId}@example.com`,
    p_headline: 'Test Headline',
    p_bio: 'Test bio for debugging',
    p_years_experience: 5,
    p_industry: 'Technology',
    p_current_title: 'Senior Product Manager',
    p_role_category: 'Product',
    p_skills: ['Testing'],
    p_linkedin_url: '',
    p_portfolio_url: '',
    p_website_url: null,
  });
  
  console.log('🧪 [Test] Insert result:', { data: insertData, error: insertError });
  
  // Count after
  const { count: afterCount } = await supabase
    .from('talent_profiles')
    .select('*', { count: 'exact', head: true });
  
  console.log('🧪 [Test] Talent count after:', afterCount);
  console.log('🧪 [Test] Difference:', (afterCount || 0) - (beforeCount || 0));
  
  return {
    beforeCount,
    afterCount,
    difference: (afterCount || 0) - (beforeCount || 0),
    insertData,
    insertError,
    success: !insertError && (afterCount || 0) > (beforeCount || 0)
  };
}

export async function getAllSponsors(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('sponsor_profiles')
    .select(`
      *,
      profiles:profiles(full_name, email)
    `, { count: 'exact' });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query.order('created_at', { ascending: false });
  return { data, error, count };
}

export async function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: string;
}) {
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      actor:profiles(full_name, email)
    `, { count: 'exact' });

  if (options?.action) {
    query = query.eq('action', options.action);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error, count } = await query.order('created_at', { ascending: false });
  return { data, error, count };
}

export async function deleteTalentProfile(talentId: string) {
  // This will cascade delete related records due to FK constraints
  const { error } = await supabase
    .from('talent_profiles')
    .delete()
    .eq('id', talentId);

  return { error };
}

// ============================================================================
// RECOMMENDATION REQUESTS API
// ============================================================================

export async function createRecommendationRequest(
  talentId: string,
  message?: string
) {
  const { data, error } = await supabase.rpc('create_recommendation_request', {
    p_talent_id: talentId,
    p_message: message,
  });

  return { data, error };
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
) {
  const { data, error } = await supabase.rpc('update_request_status', {
    p_request_id: requestId,
    p_new_status: status,
  });

  return { data, error };
}

export async function getMyRequests(options?: {
  as?: 'sponsor' | 'talent';
  status?: RequestStatus;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Not authenticated') };

  let query = supabase
    .from('v_recommendation_requests_detail')
    .select('*');

  if (options?.as === 'sponsor') {
    // Filter by sponsor (via sponsor_id joined through profile)
    const { data: sponsor } = await supabase
      .from('sponsor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (sponsor) {
      query = query.eq('sponsor_id', sponsor.id);
    }
  } else if (options?.as === 'talent') {
    // Filter by talent
    const { data: talent } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (talent) {
      query = query.eq('talent_id', talent.id);
    }
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

export async function recordOutcome(
  requestId: string,
  outcome: OutcomeType,
  notes?: string
) {
  const { data, error } = await supabase.rpc('record_outcome', {
    p_request_id: requestId,
    p_outcome: outcome,
    p_notes: notes,
  });

  return { data, error };
}

// ============================================================================
// CONTACT SUBMISSIONS API
// ============================================================================

export async function submitContactForm(input: {
  full_name: string;
  email: string;
  inquiry_type: string;
  organization?: string;
  message: string;
}) {
  // Use direct insert instead of RPC
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({
      full_name: input.full_name,
      email: input.email,
      inquiry_type: input.inquiry_type,
      organization: input.organization || '',
      message: input.message,
      status: 'new'
    })
    .select('id')
    .single();

  return { data: data?.id, error };
}

export async function getContactSubmissions(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('contact_submissions')
    .select('*', { count: 'exact' });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query.order('created_at', { ascending: false });
  return { data, error, count };
}

export async function updateContactSubmissionStatus(
  submissionId: string,
  status: 'new' | 'read' | 'replied' | 'archived'
) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', submissionId);

  return { data, error };
}

// ============================================================================
// SPONSOR ANONYMOUS SUBMISSION API
// ============================================================================

export async function submitSponsorProfileAnon(input: {
  full_name: string;
  email: string;
  title: string;
  phone?: string;
  org_name: string;
  linkedin_url?: string;
  industry: string;
  sponsor_type?: string;
  commitment_note?: string;
  wants_talent_pool_access?: boolean;
  wants_onboarding_call?: boolean;
}) {
  const { data, error } = await supabase.rpc('submit_sponsor_profile_anon', {
    p_full_name: input.full_name,
    p_email: input.email,
    p_title: input.title,
    p_phone: input.phone || '',
    p_org_name: input.org_name,
    p_linkedin_url: input.linkedin_url || '',
    p_industry: input.industry,
    p_sponsor_type: input.sponsor_type || 'connector',
    p_commitment_note: input.commitment_note || '',
    p_wants_talent_pool_access: input.wants_talent_pool_access || false,
    p_wants_onboarding_call: input.wants_onboarding_call || false,
  });

  return { data, error };
}

// ============================================================================
// AUTH TRIGGERS (for automatic profile creation on signup)
// ============================================================================

export async function signUpWithProfile(
  email: string,
  password: string,
  fullName: string,
  role: 'talent' | 'sponsor'
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { data: null, error: authError };
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      role,
      full_name: fullName,
      email,
    });

  return { data: authData, error: profileError };
}
