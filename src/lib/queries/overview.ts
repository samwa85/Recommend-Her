// ============================================================================
// OVERVIEW QUERIES - Dashboard and Analytics
// ============================================================================

import { supabase } from '../supabase/client';
import { getDaysAgo } from '../format/date';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';
import type { QueryResult, ListResult } from '../utils/errors';

// ============================================================================
// DASHBOARD METRICS
// ============================================================================

export interface DashboardMetrics {
  talent: {
    total: number;
    pending: number;
    approved: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  sponsors: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  requests: {
    total: number;
    open: number;
    inReview: number;
    urgent: number;
  };
  messages: {
    total: number;
    unread: number;
    replied: number;
    newToday: number;
  };
}

/**
 * Get comprehensive dashboard metrics
 * @returns DashboardMetrics or null on error
 */
export async function getDashboardMetrics(): Promise<
  QueryResult<DashboardMetrics>
> {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = getDaysAgo(7);
  const monthAgo = getDaysAgo(30);

  console.log('[getDashboardMetrics] Fetching metrics...', { today, weekAgo, monthAgo });

  try {
    // Talent counts
    const [
      talentTotal,
      talentPending,
      talentApproved,
      talentToday,
      talentWeek,
      talentMonth,
    ] = await Promise.all([
      supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today),
      supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo),
      supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo),
    ]);

    // Sponsor counts
    const [sponsorTotal, sponsorActive, sponsorInactive, sponsorMonth] =
      await Promise.all([
        supabase
          .from('sponsor_profiles')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('sponsor_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('sponsor_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'inactive'),
        supabase
          .from('sponsor_profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthAgo),
      ]);

    // Request counts
    const [requestTotal, requestOpen, requestInReview, requestUrgent] =
      await Promise.all([
        supabase.from('requests').select('*', { count: 'exact', head: true }),
        supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open'),
        supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_review'),
        supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('priority', 'urgent'),
      ]);

    // Message counts
    const [messageTotal, messageUnread, messageReplied, messageToday] =
      await Promise.all([
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'unread'),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'replied'),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today),
      ]);

    const metrics: DashboardMetrics = {
      talent: {
        total: talentTotal.count || 0,
        pending: talentPending.count || 0,
        approved: talentApproved.count || 0,
        newToday: talentToday.count || 0,
        newThisWeek: talentWeek.count || 0,
        newThisMonth: talentMonth.count || 0,
      },
      sponsors: {
        total: sponsorTotal.count || 0,
        active: sponsorActive.count || 0,
        inactive: sponsorInactive.count || 0,
        newThisMonth: sponsorMonth.count || 0,
      },
      requests: {
        total: requestTotal.count || 0,
        open: requestOpen.count || 0,
        inReview: requestInReview.count || 0,
        urgent: requestUrgent.count || 0,
      },
      messages: {
        total: messageTotal.count || 0,
        unread: messageUnread.count || 0,
        replied: messageReplied.count || 0,
        newToday: messageToday.count || 0,
      },
    };

    console.log('[getDashboardMetrics] Metrics fetched:', metrics);
    return { data: metrics, error: null };
  } catch (error) {
    console.error('[getDashboardMetrics] Error:', error);
    return handleSingleQueryError<DashboardMetrics>(error);
  }
}

// ============================================================================
// TREND ANALYTICS
// ============================================================================

export interface SubmissionTrend {
  date: string;
  talent_count: number;
  sponsor_count: number;
}

/**
 * Get submission trend data for charts
 * Uses the get_submissions_trend database function
 * @param days - Number of days to look back (1, 7, 30, 90)
 * @returns Trend data array
 */
export async function getSubmissionsTrend(
  days: number = 30
): Promise<ListResult<SubmissionTrend>> {
  try {
    // Try to use the RPC function first
    const { data, error } = await supabase.rpc('get_submissions_trend', {
      days,
    });

    if (!error && data) {
      const trends = Array.isArray(data) ? data : [];
      return { data: trends as SubmissionTrend[], count: trends.length, error: null };
    }

    // Fallback: Query data manually if RPC doesn't exist
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    const [talentResult, sponsorResult] = await Promise.all([
      supabase
        .from('talent_profiles')
        .select('created_at')
        .gte('created_at', startDateStr),
      supabase
        .from('sponsor_profiles')
        .select('created_at')
        .gte('created_at', startDateStr),
    ]);

    if (talentResult.error) throw talentResult.error;
    if (sponsorResult.error) throw sponsorResult.error;

    // Group by date
    const dateMap = new Map<string, { talent: number; sponsors: number }>();

    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { talent: 0, sponsors: 0 });
    }

    // Count talent by date
    talentResult.data?.forEach((item) => {
      const dateStr = new Date(item.created_at).toISOString().split('T')[0];
      const current = dateMap.get(dateStr);
      if (current) {
        current.talent++;
      }
    });

    // Count sponsors by date
    sponsorResult.data?.forEach((item) => {
      const dateStr = new Date(item.created_at).toISOString().split('T')[0];
      const current = dateMap.get(dateStr);
      if (current) {
        current.sponsors++;
      }
    });

    // Convert to array and sort by date
    const trends: SubmissionTrend[] = Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        talent_count: counts.talent,
        sponsor_count: counts.sponsors,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { data: trends, count: trends.length, error: null };
  } catch (error) {
    return handleQueryError<SubmissionTrend[]>(error);
  }
}

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

export interface RecentActivity {
  id: string;
  type: 'talent' | 'sponsor' | 'message' | 'request';
  title: string;
  description: string;
  status: string;
  created_at: string;
}

/**
 * Get recent activity from all tables combined
 * @param limit - Number of items to return
 * @returns Combined recent activity
 */
export async function getRecentActivity(
  limit: number = 10
): Promise<ListResult<RecentActivity>> {
  try {
    // Fetch recent items from each table
    const [talentRes, sponsorRes, messageRes, requestRes] = await Promise.all([
      supabase
        .from('talent_profiles')
        .select('id, full_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('sponsor_profiles')
        .select('id, full_name, company_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('messages')
        .select('id, sender_name, subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('requests')
        .select('id, request_type, status, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    // Combine and format results
    const activities: RecentActivity[] = [];

    talentRes.data?.forEach((item) => {
      activities.push({
        id: `talent-${item.id}`,
        type: 'talent',
        title: (item as any).full_name,
        description: 'New talent profile submitted',
        status: (item as any).status,
        created_at: (item as any).created_at,
      });
    });

    sponsorRes.data?.forEach((item) => {
      activities.push({
        id: `sponsor-${item.id}`,
        type: 'sponsor',
        title: (item as any).full_name,
        description: `From ${(item as any).company_name}`,
        status: (item as any).status,
        created_at: (item as any).created_at,
      });
    });

    messageRes.data?.forEach((item) => {
      activities.push({
        id: `message-${item.id}`,
        type: 'message',
        title: (item as any).sender_name,
        description: (item as any).subject || 'New message',
        status: (item as any).status,
        created_at: (item as any).created_at,
      });
    });

    requestRes.data?.forEach((item) => {
      activities.push({
        id: `request-${item.id}`,
        type: 'request',
        title: 'New Request',
        description: (item as any).request_type.replace('_', ' '),
        status: (item as any).status,
        created_at: (item as any).created_at,
      });
    });

    // Sort by date and limit
    activities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const limited = activities.slice(0, limit);

    return { data: limited, count: limited.length, error: null };
  } catch (error) {
    return handleQueryError<RecentActivity[]>(error);
  }
}

// ============================================================================
// STATUS DISTRIBUTION
// ============================================================================

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Get status distribution for a given entity type
 * @param table - Table name (talent_profiles, sponsor_profiles, etc.)
 * @returns Status distribution with percentages
 */
export async function getStatusDistribution(
  table: 'talent_profiles' | 'sponsor_profiles' | 'requests' | 'messages'
): Promise<ListResult<StatusDistribution>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('status');

    if (error) throw error;

    // Count by status
    const counts: Record<string, number> = {};
    const total = data?.length || 0;

    data?.forEach((item) => {
      counts[(item as any).status] = (counts[(item as any).status] || 0) + 1;
    });

    // Calculate distribution
    const distribution: StatusDistribution[] = Object.entries(counts).map(
      ([status, count]) => ({
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      })
    );

    // Sort by count desc
    distribution.sort((a, b) => b.count - a.count);

    return { data: distribution, count: distribution.length, error: null };
  } catch (error) {
    return handleQueryError<StatusDistribution[]>(error);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  getDashboardMetrics,
  getSubmissionsTrend,
  getRecentActivity,
  getStatusDistribution,
};
