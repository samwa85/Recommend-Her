// ============================================================================
// ADMIN QUERIES - Single Source of Truth for Supabase Data Fetching
// ============================================================================

import { supabase } from '@/lib/supabase';
import type {
  TalentStatus,
  SponsorStatus,
  RequestStatus,
  ContactSubmissionStatus,
} from '@/lib/database.types';
import type {
  AdminTalent,
  AdminSponsor,
  AdminRequest,
  AdminMessage,
  TalentFilters,
  SponsorFilters,
  RequestFilters,
  MessageFilters,
  PaginationParams,
  PaginatedData,
  DashboardMetrics,
  AnalyticsData,
  TimeSeriesData,
  ActivityLog,
} from './types';

// ============================================================================
// TALENT QUERIES
// ============================================================================

/**
 * Get all talent with pagination and filters
 */
export async function getTalentList(
  filters: TalentFilters = {},
  pagination: PaginationParams = { page: 1, perPage: 10 }
): Promise<PaginatedData<AdminTalent>> {
  const from = (pagination.page - 1) * pagination.perPage;
  const to = from + pagination.perPage - 1;

  let query = supabase
    .from('talent_profiles')
    .select(`
      *,
      profiles:profiles!left(full_name, email, phone)
    `, { count: 'exact' });

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.industry) {
    query = query.ilike('industry', `%${filters.industry}%`);
  }
  if (filters.seniority) {
    query = query.eq('seniority_level', filters.seniority);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Apply sorting
  const sortColumn = pagination.sortBy || 'created_at';
  query = query.order(sortColumn, { ascending: pagination.sortOrder === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching talent list:', error);
    return {
      data: [],
      count: 0,
      page: pagination.page,
      perPage: pagination.perPage,
      totalPages: 0,
    };
  }

  // Transform data to AdminTalent format
  const transformedData: AdminTalent[] = (data || []).map(item => ({
    ...item,
    profile_name: item.profiles?.full_name,
    profile_email: item.profiles?.email,
    profile_phone: item.profiles?.phone,
  }));

  return {
    data: transformedData,
    count: count || 0,
    page: pagination.page,
    perPage: pagination.perPage,
    totalPages: Math.ceil((count || 0) / pagination.perPage),
  };
}

/**
 * Get a single talent by ID
 */
export async function getTalentById(id: string): Promise<AdminTalent | null> {
  const { data, error } = await supabase
    .from('talent_profiles')
    .select(`
      *,
      profiles:profiles!left(full_name, email, phone, country, location)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching talent by ID:', error);
    return null;
  }

  return {
    ...data,
    profile_name: data.profiles?.full_name,
    profile_email: data.profiles?.email,
    profile_phone: data.profiles?.phone,
  };
}

/**
 * Update talent status
 */
export async function updateTalentStatus(
  id: string,
  status: TalentStatus,
  notes?: string
): Promise<{ error: Error | null }> {
  const updates: any = { status };
  
  if (status === 'approved') {
    updates.approved_at = new Date().toISOString();
  }
  if (status === 'vetted') {
    updates.vetted_at = new Date().toISOString();
  }
  if (notes) {
    updates.admin_private_notes = notes;
  }

  const { error } = await supabase
    .from('talent_profiles')
    .update(updates)
    .eq('id', id);

  return { error };
}

/**
 * Delete a talent profile
 */
export async function deleteTalent(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('talent_profiles')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Get talent count by status
 */
export async function getTalentCountsByStatus(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('talent_profiles')
    .select('status');

  if (error || !data) {
    return {};
  }

  return data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ============================================================================
// SPONSOR QUERIES
// ============================================================================

/**
 * Get all sponsors with pagination and filters
 */
export async function getSponsorList(
  filters: SponsorFilters = {},
  pagination: PaginationParams = { page: 1, perPage: 10 }
): Promise<PaginatedData<AdminSponsor>> {
  const from = (pagination.page - 1) * pagination.perPage;
  const to = from + pagination.perPage - 1;

  let query = supabase
    .from('sponsor_profiles')
    .select(`
      *,
      profiles:profiles(full_name, email, phone)
    `, { count: 'exact' });

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.sponsorType) {
    query = query.eq('sponsor_type', filters.sponsorType);
  }
  if (filters.industry) {
    query = query.ilike('industry', `%${filters.industry}%`);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Apply sorting
  const sortColumn = pagination.sortBy || 'created_at';
  query = query.order(sortColumn, { ascending: pagination.sortOrder === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching sponsor list:', error);
    return {
      data: [],
      count: 0,
      page: pagination.page,
      perPage: pagination.perPage,
      totalPages: 0,
    };
  }

  // Transform data to AdminSponsor format
  const transformedData: AdminSponsor[] = (data || []).map(item => ({
    ...item,
    profile_name: item.profiles?.full_name,
    profile_email: item.profiles?.email,
    profile_phone: item.profiles?.phone,
  }));

  return {
    data: transformedData,
    count: count || 0,
    page: pagination.page,
    perPage: pagination.perPage,
    totalPages: Math.ceil((count || 0) / pagination.perPage),
  };
}

/**
 * Get a single sponsor by ID
 */
export async function getSponsorById(id: string): Promise<AdminSponsor | null> {
  const { data, error } = await supabase
    .from('sponsor_profiles')
    .select(`
      *,
      profiles:profiles(full_name, email, phone, country, location)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching sponsor by ID:', error);
    return null;
  }

  return {
    ...data,
    profile_name: data.profiles?.full_name,
    profile_email: data.profiles?.email,
    profile_phone: data.profiles?.phone,
  };
}

/**
 * Update sponsor status
 */
export async function updateSponsorStatus(
  id: string,
  status: SponsorStatus
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('sponsor_profiles')
    .update({ status })
    .eq('id', id);

  return { error };
}

/**
 * Delete a sponsor profile
 */
export async function deleteSponsor(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('sponsor_profiles')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Get sponsor count by status
 */
export async function getSponsorCountsByStatus(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('sponsor_profiles')
    .select('status');

  if (error || !data) {
    return {};
  }

  return data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ============================================================================
// REQUEST QUERIES
// ============================================================================

/**
 * Get all requests with pagination and filters
 */
export async function getRequestList(
  filters: RequestFilters = {},
  pagination: PaginationParams = { page: 1, perPage: 10 }
): Promise<PaginatedData<AdminRequest>> {
  const from = (pagination.page - 1) * pagination.perPage;
  const to = from + pagination.perPage - 1;

  let query = supabase
    .from('recommendation_requests')
    .select(`
      *,
      talent:talent_profiles(headline, profiles:profiles!left(full_name)),
      sponsor:sponsor_profiles(company_name, profiles:profiles!left(full_name))
    `, { count: 'exact' });

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Apply sorting
  const sortColumn = pagination.sortBy || 'created_at';
  query = query.order(sortColumn, { ascending: pagination.sortOrder === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching request list:', error);
    return {
      data: [],
      count: 0,
      page: pagination.page,
      perPage: pagination.perPage,
      totalPages: 0,
    };
  }

  // Transform data to AdminRequest format
  const transformedData: AdminRequest[] = (data || []).map(item => ({
    ...item,
    talent_name: item.talent?.profiles?.full_name,
    talent_headline: item.talent?.headline,
    sponsor_name: item.sponsor?.profiles?.full_name,
    sponsor_org: item.sponsor?.company_name,
  }));

  return {
    data: transformedData,
    count: count || 0,
    page: pagination.page,
    perPage: pagination.perPage,
    totalPages: Math.ceil((count || 0) / pagination.perPage),
  };
}

/**
 * Get a single request by ID
 */
export async function getRequestById(id: string): Promise<AdminRequest | null> {
  const { data, error } = await supabase
    .from('recommendation_requests')
    .select(`
      *,
      talent:talent_profiles(
        *,
        profiles:profiles!left(full_name, email, phone)
      ),
      sponsor:sponsor_profiles(
        *,
        profiles:profiles!left(full_name, email)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching request by ID:', error);
    return null;
  }

  return {
    ...data,
    talent_name: data.talent?.profiles?.full_name,
    talent_headline: data.talent?.headline,
    sponsor_name: data.sponsor?.profiles?.full_name,
    sponsor_org: data.sponsor?.company_name,
  };
}

/**
 * Update request status
 */
export async function updateRequestStatus(
  id: string,
  status: RequestStatus
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('recommendation_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  return { error };
}

/**
 * Get request count by status
 */
export async function getRequestCountsByStatus(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('recommendation_requests')
    .select('status');

  if (error || !data) {
    return {};
  }

  return data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ============================================================================
// MESSAGE QUERIES
// ============================================================================

/**
 * Get all messages with pagination and filters
 */
export async function getMessageList(
  filters: MessageFilters = {},
  pagination: PaginationParams = { page: 1, perPage: 10 }
): Promise<PaginatedData<AdminMessage>> {
  const from = (pagination.page - 1) * pagination.perPage;
  const to = from + pagination.perPage - 1;

  let query = supabase
    .from('contact_submissions')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.inquiryType) {
    query = query.eq('inquiry_type', filters.inquiryType);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Apply sorting
  const sortColumn = pagination.sortBy || 'created_at';
  query = query.order(sortColumn, { ascending: pagination.sortOrder === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching message list:', error);
    return {
      data: [],
      count: 0,
      page: pagination.page,
      perPage: pagination.perPage,
      totalPages: 0,
    };
  }

  // Transform data to AdminMessage format
  const transformedData: AdminMessage[] = (data || []).map(item => ({
    ...item,
    sender_name: item.full_name,
    sender_email: item.email,
  }));

  return {
    data: transformedData,
    count: count || 0,
    page: pagination.page,
    perPage: pagination.perPage,
    totalPages: Math.ceil((count || 0) / pagination.perPage),
  };
}

/**
 * Get a single message by ID
 */
export async function getMessageById(id: string): Promise<AdminMessage | null> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching message by ID:', error);
    return null;
  }

  return {
    ...data,
    sender_name: data.full_name,
    sender_email: data.email,
  };
}

/**
 * Update message status
 */
export async function updateMessageStatus(
  id: string,
  status: ContactSubmissionStatus
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('contact_submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  return { error };
}

/**
 * Get message count by status
 */
export async function getMessageCountsByStatus(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('status');

  if (error || !data) {
    return {};
  }

  return data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ============================================================================
// DASHBOARD METRICS QUERIES
// ============================================================================

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Get talent counts
  const [talentTotal, talentToday, talent7Days, talent30Days] = await Promise.all([
    supabase.from('talent_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('talent_profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('talent_profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('talent_profiles').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
  ]);

  // Get sponsor counts
  const [sponsorTotal, sponsorToday, sponsor7Days, sponsor30Days] = await Promise.all([
    supabase.from('sponsor_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('sponsor_profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('sponsor_profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('sponsor_profiles').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
  ]);

  // Get request counts
  const [requestTotal, requestOpen, requestToday, request7Days] = await Promise.all([
    supabase.from('recommendation_requests').select('*', { count: 'exact', head: true }),
    supabase.from('recommendation_requests').select('*', { count: 'exact', head: true }).in('status', ['requested', 'accepted', 'intro_sent']),
    supabase.from('recommendation_requests').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('recommendation_requests').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
  ]);

  // Get message counts
  const [messageTotal, messageUnread, messageToday, message7Days] = await Promise.all([
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
  ]);

  return {
    totalTalent: talentTotal.count || 0,
    newTalentToday: talentToday.count || 0,
    newTalent7Days: talent7Days.count || 0,
    newTalent30Days: talent30Days.count || 0,
    totalSponsors: sponsorTotal.count || 0,
    newSponsorsToday: sponsorToday.count || 0,
    newSponsors7Days: sponsor7Days.count || 0,
    newSponsors30Days: sponsor30Days.count || 0,
    totalRequests: requestTotal.count || 0,
    openRequests: requestOpen.count || 0,
    newRequestsToday: requestToday.count || 0,
    newRequests7Days: request7Days.count || 0,
    totalMessages: messageTotal.count || 0,
    unreadMessages: messageUnread.count || 0,
    newMessagesToday: messageToday.count || 0,
    newMessages7Days: message7Days.count || 0,
  };
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get analytics data for charts
 */
export async function getAnalyticsData(days: number = 30): Promise<AnalyticsData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateISO = startDate.toISOString();

  // Get talent trend
  const { data: talentData } = await supabase
    .from('talent_profiles')
    .select('created_at')
    .gte('created_at', startDateISO)
    .order('created_at', { ascending: true });

  // Get sponsor trend
  const { data: sponsorData } = await supabase
    .from('sponsor_profiles')
    .select('created_at')
    .gte('created_at', startDateISO)
    .order('created_at', { ascending: true });

  // Get request trend
  const { data: requestData } = await supabase
    .from('recommendation_requests')
    .select('created_at')
    .gte('created_at', startDateISO)
    .order('created_at', { ascending: true });

  // Get message trend
  const { data: messageData } = await supabase
    .from('contact_submissions')
    .select('created_at')
    .gte('created_at', startDateISO)
    .order('created_at', { ascending: true });

  // Get talent by status
  const { data: talentByStatus } = await supabase
    .from('talent_profiles')
    .select('status');

  // Get talent by industry
  const { data: talentByIndustry } = await supabase
    .from('talent_profiles')
    .select('industry');

  // Get talent by location
  const { data: talentByLocation } = await supabase
    .from('talent_profiles')
    .select('location');

  // Get requests by status
  const { data: requestsByStatus } = await supabase
    .from('recommendation_requests')
    .select('status');

  // Helper function to create time series data
  const createTimeSeries = (data: { created_at: string }[]): TimeSeriesData[] => {
    const grouped = data.reduce((acc, item) => {
      const date = item.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Helper function to create distribution data
  const createDistribution = (data: { [key: string]: string | null }[], field: string): Record<string, number> => {
    return data.reduce((acc, item) => {
      const value = item[field] || 'Unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  return {
    talentTrend: createTimeSeries(talentData || []),
    sponsorTrend: createTimeSeries(sponsorData || []),
    requestTrend: createTimeSeries(requestData || []),
    messageTrend: createTimeSeries(messageData || []),
    talentByStatus: createDistribution(talentByStatus || [], 'status'),
    talentByIndustry: createDistribution(talentByIndustry || [], 'industry'),
    talentByLocation: createDistribution(talentByLocation || [], 'location'),
    requestsByStatus: createDistribution(requestsByStatus || [], 'status'),
  };
}

// ============================================================================
// ACTIVITY LOG QUERIES
// ============================================================================

/**
 * Get recent activity logs
 */
export async function getActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      actor:profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('Error fetching activity logs:', error);
    return [];
  }

  return data.map(log => ({
    id: log.id,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    actor_name: log.actor?.full_name,
    metadata: log.metadata,
    created_at: log.created_at,
  }));
}

// ============================================================================
// SEARCH QUERIES
// ============================================================================

/**
 * Search talent by name, email, or phone
 */
export async function searchTalent(query: string): Promise<AdminTalent[]> {
  const { data, error } = await supabase
    .from('talent_profiles')
    .select(`
      *,
      profiles:profiles!left(full_name, email, phone)
    `)
    .or(`profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%,profiles.phone.ilike.%${query}%`);

  if (error || !data) {
    console.error('Error searching talent:', error);
    return [];
  }

  return data.map(item => ({
    ...item,
    profile_name: item.profiles?.full_name,
    profile_email: item.profiles?.email,
    profile_phone: item.profiles?.phone,
  }));
}

/**
 * Search sponsors by name, email, or organization
 */
export async function searchSponsors(query: string): Promise<AdminSponsor[]> {
  const { data, error } = await supabase
    .from('sponsor_profiles')
    .select(`
      *,
      profiles:profiles(full_name, email, phone)
    `)
    .or(`profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%,company_name.ilike.%${query}%`);

  if (error || !data) {
    console.error('Error searching sponsors:', error);
    return [];
  }

  return data.map(item => ({
    ...item,
    profile_name: item.profiles?.full_name,
    profile_email: item.profiles?.email,
    profile_phone: item.profiles?.phone,
  }));
}

/**
 * Search messages by sender name, email, or subject
 */
export async function searchMessages(query: string): Promise<AdminMessage[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,inquiry_type.ilike.%${query}%`);

  if (error || !data) {
    console.error('Error searching messages:', error);
    return [];
  }

  return data.map(item => ({
    ...item,
    sender_name: item.full_name,
    sender_email: item.email,
  }));
}

// ============================================================================
// EXPORT ALL QUERIES
// ============================================================================

export default {
  // Talent
  getTalentList,
  getTalentById,
  updateTalentStatus,
  deleteTalent,
  getTalentCountsByStatus,
  searchTalent,
  
  // Sponsors
  getSponsorList,
  getSponsorById,
  updateSponsorStatus,
  deleteSponsor,
  getSponsorCountsByStatus,
  searchSponsors,
  
  // Requests
  getRequestList,
  getRequestById,
  updateRequestStatus,
  getRequestCountsByStatus,
  
  // Messages
  getMessageList,
  getMessageById,
  updateMessageStatus,
  getMessageCountsByStatus,
  searchMessages,
  
  // Dashboard
  getDashboardMetrics,
  getAnalyticsData,
  getActivityLogs,
};
