// ============================================================================
// ADMIN DATA HOOKS - Using Shared Data Layer
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
// Imports from @/lib/insforge/client removed - not used
import type { 
  TalentProfile,
  SponsorProfile,
  Request,
  Message,
  TalentFilters,
  SponsorFilters,
  RequestFilters,
  MessageFilters,
} from '@/lib/types/db';
import type { PaginationParams, PaginatedResult } from '@/lib/utils/errors';
import {
  listTalent,
  getTalentById,
  updateTalentStatus,
  deleteTalent,
  getTalentStatusCounts,
  listSponsors,
  getSponsorById,
  updateSponsorStatus,
  deleteSponsor,
  getSponsorStatusCounts,
  listRequests,
  getRequestById,
  updateRequestStatus,
  listMessages,
  getMessageById,
  updateMessageStatus,
  getMessageStatusCounts,
  getUnreadMessagesCount,
  getDashboardMetrics,
  getSubmissionsTrend,
  getRecentActivity,
  addMessageReply,
  getMessageReplies,
  type DashboardMetrics,
} from '@/lib/queries';

// ============================================================================
// TALENT HOOKS
// ============================================================================

interface UseTalentListOptions {
  filters?: TalentFilters;
  pagination?: PaginationParams;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useTalentList(options: UseTalentListOptions = {}) {
  const {
    filters = {},
    pagination = { page: 1, perPage: 10 },
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [data, setData] = useState<PaginatedResult<TalentProfile>>({
    data: [],
    count: 0,
    page: 1,
    perPage: 10,
    totalPages: 0,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track last fetch time to prevent rapid re-fetches
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 500; // Minimum 500ms between fetches

  const fetchData = useCallback(async (force = false) => {
    // Rate limiting protection - prevent fetches within 500ms of each other
    const now = Date.now();
    if (!force && now - lastFetchTime.current < minFetchInterval) {
      console.log('[useTalentList] Skipping fetch - too soon');
      return;
    }
    lastFetchTime.current = now;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await listTalent({ filters, pagination });
      if (result.error) throw result.error;
      setData(result);
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Failed to fetch talent';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Handle API error objects
        const errRecord = err as Record<string, unknown>;
        if (errRecord['message']) errorMessage = String(errRecord['message']);
        else if (errRecord['error']) errorMessage = String(errRecord['error']);
        else errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for rate limiting
      if (errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      console.error('[useTalentList] Error:', err);
      setError(errorMessage);
      // Keep previous data on error
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: () => fetchData(true),
  };
}

export function useTalentDetail(id: string | null) {
  const [data, setData] = useState<TalentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getTalentById(id);
        if (result.error) throw result.error;
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch talent');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const updateStatus = useCallback(async (status: 'pending' | 'approved' | 'rejected' | 'archived', notes?: string) => {
    if (!id) return { success: false, error: new Error('No talent ID') };
    try {
      const result = await updateTalentStatus(id, status, notes);
      if (result.error) throw result.error;
      const updated = await getTalentById(id);
      setData(updated.data);
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return { success: false, error: new Error('No talent ID') };
    return deleteTalent(id);
  }, [id]);

  return {
    data,
    isLoading,
    error,
    updateStatus,
    remove,
    refresh: async () => {
      if (id) {
        const result = await getTalentById(id);
        setData(result.data);
      }
    },
  };
}

// ============================================================================
// SPONSOR HOOKS
// ============================================================================

interface UseSponsorListOptions {
  filters?: SponsorFilters;
  pagination?: PaginationParams;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useSponsorList(options: UseSponsorListOptions = {}) {
  const {
    filters = {},
    pagination = { page: 1, perPage: 10 },
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [data, setData] = useState<PaginatedResult<SponsorProfile>>({
    data: [],
    count: 0,
    page: 1,
    perPage: 10,
    totalPages: 0,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track last fetch time to prevent rapid re-fetches
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 500; // Minimum 500ms between fetches

  const fetchData = useCallback(async (force = false) => {
    // Rate limiting protection - prevent fetches within 500ms of each other
    const now = Date.now();
    if (!force && now - lastFetchTime.current < minFetchInterval) {
      console.log('[useSponsorList] Skipping fetch - too soon');
      return;
    }
    lastFetchTime.current = now;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await listSponsors({ filters, pagination });
      if (result.error) throw result.error;
      setData(result);
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Failed to fetch sponsors';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const errObj = err as Record<string, unknown>;
        if (errObj['message']) errorMessage = String(errObj['message']);
        else if (errObj['error']) errorMessage = String(errObj['error']);
        else errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for rate limiting
      if (errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      console.error('[useSponsorList] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: () => fetchData(true),
  };
}

export function useSponsorDetail(id: string | null) {
  const [data, setData] = useState<SponsorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getSponsorById(id);
        if (result.error) throw result.error;
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sponsor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const updateStatus = useCallback(async (status: 'active' | 'inactive' | 'archived') => {
    if (!id) return { success: false, error: new Error('No sponsor ID') };
    try {
      const result = await updateSponsorStatus(id, status);
      if (result.error) throw result.error;
      const updated = await getSponsorById(id);
      setData(updated.data);
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return { success: false, error: new Error('No sponsor ID') };
    return deleteSponsor(id);
  }, [id]);

  return {
    data,
    isLoading,
    error,
    updateStatus,
    remove,
    refresh: async () => {
      if (id) {
        const result = await getSponsorById(id);
        setData(result.data);
      }
    },
  };
}

// ============================================================================
// REQUEST HOOKS
// ============================================================================

interface UseRequestListOptions {
  filters?: RequestFilters;
  pagination?: PaginationParams;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRequestList(options: UseRequestListOptions = {}) {
  const {
    filters = {},
    pagination = { page: 1, perPage: 10 },
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [data, setData] = useState<PaginatedResult<Request>>({
    data: [],
    count: 0,
    page: 1,
    perPage: 10,
    totalPages: 0,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track last fetch time to prevent rapid re-fetches
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 500; // Minimum 500ms between fetches

  const fetchData = useCallback(async (force = false) => {
    // Rate limiting protection - prevent fetches within 500ms of each other
    const now = Date.now();
    if (!force && now - lastFetchTime.current < minFetchInterval) {
      console.log('[useRequestList] Skipping fetch - too soon');
      return;
    }
    lastFetchTime.current = now;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await listRequests({ filters, pagination, withRelations: true });
      if (result.error) throw result.error;
      setData(result);
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Failed to fetch requests';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const errRecord = err as Record<string, unknown>;
        if (errRecord['message']) errorMessage = String(errRecord['message']);
        else if (errRecord['error']) errorMessage = String(errRecord['error']);
        else errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for rate limiting
      if (errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      console.error('[useRequestList] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: () => fetchData(true),
  };
}

export function useRequestDetail(id: string | null) {
  const [data, setData] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const result = await getRequestById(id);
      setData(result.data);
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const updateStatus = useCallback(async (status: 'open' | 'in_review' | 'approved' | 'rejected' | 'closed') => {
    if (!id) return { success: false, error: new Error('No request ID') };
    try {
      const result = await updateRequestStatus(id, status);
      if (result.error) throw result.error;
      const updated = await getRequestById(id);
      setData(updated.data);
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, [id]);

  return {
    data,
    isLoading,
    updateStatus,
    refresh: async () => {
      if (id) {
        const result = await getRequestById(id);
        setData(result.data);
      }
    },
  };
}

// ============================================================================
// MESSAGE HOOKS
// ============================================================================

interface UseMessageListOptions {
  filters?: MessageFilters;
  pagination?: PaginationParams;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useMessageList(options: UseMessageListOptions = {}) {
  const {
    filters = {},
    pagination = { page: 1, perPage: 10 },
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [data, setData] = useState<PaginatedResult<Message>>({
    data: [],
    count: 0,
    page: 1,
    perPage: 10,
    totalPages: 0,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track last fetch time to prevent rapid re-fetches
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 500; // Minimum 500ms between fetches

  const fetchData = useCallback(async (force = false) => {
    // Rate limiting protection - prevent fetches within 500ms of each other
    const now = Date.now();
    if (!force && now - lastFetchTime.current < minFetchInterval) {
      console.log('[useMessageList] Skipping fetch - too soon');
      return;
    }
    lastFetchTime.current = now;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await listMessages({ filters, pagination });
      if (result.error) throw result.error;
      setData(result);
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Failed to fetch messages';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const errRecord = err as Record<string, unknown>;
        if (errRecord['message']) errorMessage = String(errRecord['message']);
        else if (errRecord['error']) errorMessage = String(errRecord['error']);
        else errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for rate limiting
      if (errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      console.error('[useMessageList] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: () => fetchData(true),
  };
}

export function useMessageDetail(id: string | null) {
  const [data, setData] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState<Array<{ id: string; reply_text: string; created_at: string; admin_name?: string }>>([]);

  useEffect(() => {
    if (!id) {
      setData(null);
      setReplies([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const [msgResult, repliesResult] = await Promise.all([
        getMessageById(id),
        getMessageReplies(id),
      ]);
      setData(msgResult.data);
      setReplies(repliesResult.data || []);
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const updateStatus = useCallback(async (status: 'unread' | 'read' | 'replied' | 'archived' | 'spam') => {
    if (!id) return { success: false, error: new Error('No message ID') };
    try {
      const result = await updateMessageStatus(id, status);
      if (result.error) throw result.error;
      const updated = await getMessageById(id);
      setData(updated.data);
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, [id]);

  const addReply = useCallback(async (replyText: string) => {
    if (!id) return { success: false, error: new Error('No message ID') };
    try {
      const result = await addMessageReply(id, replyText);
      if (!result.success) throw result.error || new Error('Failed to save reply');
      
      // Refresh data
      const [updated, repliesResult] = await Promise.all([
        getMessageById(id),
        getMessageReplies(id),
      ]);
      setData(updated.data);
      setReplies(repliesResult.data || []);
      
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, [id]);

  return {
    data,
    isLoading,
    replies,
    updateStatus,
    addReply,
    refresh: async () => {
      if (id) {
        const [msgResult, repliesResult] = await Promise.all([
          getMessageById(id),
          getMessageReplies(id),
        ]);
        setData(msgResult.data);
        setReplies(repliesResult.data || []);
      }
    },
  };
}

// ============================================================================
// DASHBOARD METRICS HOOK
// ============================================================================

interface UseDashboardMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useDashboardMetrics(options: UseDashboardMetricsOptions = {}) {
  const { autoRefresh = true, refreshInterval = 60000 } = options;

  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Track last fetch time to prevent rapid re-fetches
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 500; // Minimum 500ms between fetches

  const fetchData = useCallback(async (force = false) => {
    // Rate limiting protection - prevent fetches within 500ms of each other
    const now = Date.now();
    if (!force && now - lastFetchTime.current < minFetchInterval) {
      console.log('[useDashboardMetrics] Skipping fetch - too soon');
      return;
    }
    lastFetchTime.current = now;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Dashboard] Fetching metrics...');
      const result = await getDashboardMetrics();
      console.log('[Dashboard] Metrics result:', result);
      if (result.error) throw result.error;
      setData(result.data);
      setLastUpdated(new Date());
      console.log('[Dashboard] Metrics loaded:', result.data);
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Failed to fetch metrics';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const errRecord = err as Record<string, unknown>;
        if (errRecord['message']) errorMessage = String(errRecord['message']);
        else if (errRecord['error']) errorMessage = String(errRecord['error']);
        else errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for rate limiting
      if (errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      console.error('[Dashboard] Error fetching metrics:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh: () => fetchData(true),
  };
}

// ============================================================================
// ANALYTICS HOOK
// ============================================================================

interface UseAnalyticsOptions {
  days?: number;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { days = 30 } = options;

  const [data, setData] = useState<{
    trend: { date: string; talent_count: number; sponsor_count: number }[];
    isLoading: boolean;
    error: string | null;
  }>({ trend: [], isLoading: true, error: null });

  useEffect(() => {
    const fetchData = async () => {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await getSubmissionsTrend(days);
        if (result.error) throw result.error;
        setData({ trend: result.data || [], isLoading: false, error: null });
      } catch (err) {
        setData({
          trend: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch analytics',
        });
      }
    };

    fetchData();
  }, [days]);

  return data;
}

// ============================================================================
// ACTIVITY LOGS HOOK
// ============================================================================

interface UseActivityLogsOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useActivityLogs(options: UseActivityLogsOptions = {}) {
  const { limit = 10, autoRefresh = false, refreshInterval = 60000 } = options;

  const [data, setData] = useState<Awaited<ReturnType<typeof getRecentActivity>>['data']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track last fetch time to prevent rapid re-fetches
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 500; // Minimum 500ms between fetches

  const fetchData = useCallback(async (force = false) => {
    // Rate limiting protection - prevent fetches within 500ms of each other
    const now = Date.now();
    if (!force && now - lastFetchTime.current < minFetchInterval) {
      console.log('[useActivityLogs] Skipping fetch - too soon');
      return;
    }
    lastFetchTime.current = now;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await getRecentActivity(limit);
      if (result.error) throw result.error;
      setData(result.data);
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Failed to fetch activity';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const errRecord = err as Record<string, unknown>;
        if (errRecord['message']) errorMessage = String(errRecord['message']);
        else if (errRecord['error']) errorMessage = String(errRecord['error']);
        else errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for rate limiting
      if (errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      console.error('[useActivityLogs] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: () => fetchData(true),
  };
}

// ============================================================================
// STATUS COUNTS HOOK
// ============================================================================

export function useStatusCounts(type: 'talent' | 'sponsor' | 'request' | 'message') {
  const [counts, setCounts] = useState<{ status: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        let result;
        switch (type) {
          case 'talent':
            result = await getTalentStatusCounts();
            break;
          case 'sponsor':
            result = await getSponsorStatusCounts();
            break;
          case 'message':
            result = await getMessageStatusCounts();
            break;
          default:
            result = { data: [], error: null };
        }
        if (result.data) setCounts(result.data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [type]);

  return { counts, isLoading };
}

// ============================================================================
// UNREAD MESSAGES COUNT HOOK
// ============================================================================

export function useUnreadMessagesCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const result = await getUnreadMessagesCount();
      setCount(result);
    };

    fetchCount();

    // Polling for updates (InsForge doesn't use websockets)
    const interval = setInterval(fetchCount, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return count;
}
