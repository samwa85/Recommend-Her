// ============================================================================
// REQUEST QUERIES - Single Source of Truth for Request Operations
// ============================================================================

import { supabase } from '../supabase/client';
import type { Request, RequestInput, RequestUpdate, RequestFilters } from '../types/db';
import type { PaginatedResult, PaginationParams, QueryResult, ListResult } from '../utils/errors';
import { RequestStatus, RequestPriority } from '../types/enums';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';

// ============================================================================
// LIST QUERIES
// ============================================================================

export interface ListRequestsOptions {
  filters?: RequestFilters;
  pagination?: PaginationParams;
  withRelations?: boolean;
}

/**
 * List requests with filtering, sorting, and pagination
 * @param options - Query options
 * @returns Paginated list of requests
 * 
 * @example
 * ```typescript
 * const { data, count, error } = await listRequests({
 *   filters: { status: 'open' },
 *   pagination: { page: 1, perPage: 25 }
 * });
 * ```
 */
export async function listRequests(
  options: ListRequestsOptions = {}
): Promise<PaginatedResult<Request> & { error: Error | null }> {
  const { filters = {}, pagination = {}, withRelations = false } = options;
  const page = pagination.page ?? 1;
  const perPage = pagination.perPage ?? 25;
  const sortBy = pagination.sortBy ?? 'created_at';
  const sortOrder = pagination.sortOrder ?? 'desc';
  
  try {
    let selectQuery = withRelations
      ? '*, talent:talent_profiles(*), sponsor:sponsor_profiles(*)' 
      : '*';
    
    let query = supabase
      .from('requests')
      .select(selectQuery, { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.request_type) {
      query = query.eq('request_type', filters.request_type);
    }
    
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    
    if (filters.talent_id) {
      query = query.eq('talent_id', filters.talent_id);
    }
    
    if (filters.sponsor_id) {
      query = query.eq('sponsor_id', filters.sponsor_id);
    }
    
    if (filters.handled_by_admin_id) {
      query = query.eq('handled_by_admin_id', filters.handled_by_admin_id);
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    
    // Search
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `description.ilike.${searchTerm},` +
        `admin_notes.ilike.${searchTerm}`
      );
    }
    
    // Apply sorting - urgent priority first, then by date
    if (sortBy === 'priority') {
      query = query.order('priority', { ascending: sortOrder === 'asc' });
    }
    query = query.order('created_at', { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: (data as unknown as Request[]) || [],
      count: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      count: 0,
      page: pagination.page ?? 1,
      perPage: pagination.perPage ?? 25,
      totalPages: 0,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get all requests (without pagination)
 * @param filters - Optional filters
 * @returns List of all matching requests
 */
export async function getAllRequests(
  filters?: Omit<RequestFilters, 'search'>
): Promise<ListResult<Request>> {
  try {
    let query = supabase.from('requests').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.request_type) {
      query = query.eq('request_type', filters.request_type);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: (data as Request[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<Request[]>(error);
  }
}

// ============================================================================
// SINGLE RECORD QUERIES
// ============================================================================

/**
 * Get request by ID
 * @param id - Request ID
 * @returns Request or null
 */
export async function getRequestById(
  id: string
): Promise<QueryResult<Request>> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*, talent:talent_profiles(*), sponsor:sponsor_profiles(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as Request, error: null };
  } catch (error) {
    return handleSingleQueryError<Request>(error);
  }
}

// ============================================================================
// MUTATION QUERIES
// ============================================================================

/**
 * Create new request
 * @param input - Request data
 * @returns Created request
 */
export async function createRequest(
  input: RequestInput
): Promise<QueryResult<Request>> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert(input)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Request, error: null };
  } catch (error) {
    return handleSingleQueryError<Request>(error);
  }
}

/**
 * Update request
 * @param id - Request ID
 * @param updates - Fields to update
 * @returns Updated request
 */
export async function updateRequest(
  id: string,
  updates: RequestUpdate
): Promise<QueryResult<Request>> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Request, error: null };
  } catch (error) {
    return handleSingleQueryError<Request>(error);
  }
}

/**
 * Update request status
 * @param id - Request ID
 * @param status - New status
 * @param adminId - Admin making the change
 * @returns Updated request
 */
export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  adminId?: string
): Promise<QueryResult<Request>> {
  const updates: RequestUpdate = { 
    status,
    updated_at: new Date().toISOString()
  };
  
  if (adminId) {
    updates.handled_by_admin_id = adminId;
  }
  
  if (status === RequestStatus.CLOSED || status === RequestStatus.APPROVED) {
    updates.resolved_at = new Date().toISOString();
  }
  
  return updateRequest(id, updates);
}

/**
 * Approve request
 * @param id - Request ID
 * @param adminId - Admin approving
 * @returns Updated request
 */
export async function approveRequest(
  id: string,
  adminId?: string
): Promise<QueryResult<Request>> {
  return updateRequestStatus(id, RequestStatus.APPROVED, adminId);
}

/**
 * Reject request
 * @param id - Request ID
 * @param adminId - Admin rejecting
 * @returns Updated request
 */
export async function rejectRequest(
  id: string,
  adminId?: string
): Promise<QueryResult<Request>> {
  return updateRequestStatus(id, RequestStatus.REJECTED, adminId);
}

/**
 * Close request
 * @param id - Request ID
 * @param adminId - Admin closing
 * @returns Updated request
 */
export async function closeRequest(
  id: string,
  adminId?: string
): Promise<QueryResult<Request>> {
  return updateRequestStatus(id, RequestStatus.CLOSED, adminId);
}

/**
 * Assign request to admin
 * @param id - Request ID
 * @param adminId - Admin ID to assign
 * @returns Updated request
 */
export async function assignRequest(
  id: string,
  adminId: string
): Promise<QueryResult<Request>> {
  return updateRequest(id, {
    handled_by_admin_id: adminId,
    updated_at: new Date().toISOString(),
  });
}

/**
 * Delete request
 * @param id - Request ID
 * @returns True if deleted
 */
export async function deleteRequest(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get request status counts for dashboard
 * @returns Counts by status
 */
export async function getRequestStatusCounts(): Promise<
  QueryResult<Array<{ status: string; count: number }>>
> {
  try {
    const { data, error } = await supabase
      .from('v_request_status_counts')
      .select('status, count');

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return handleSingleQueryError<Array<{ status: string; count: number }>>(error);
  }
}

/**
 * Get open requests count
 * @returns Number of open requests
 */
export async function getOpenRequestsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', RequestStatus.OPEN);

    if (error) throw error;

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get urgent requests count
 * @returns Number of urgent requests
 */
export async function getUrgentRequestsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('priority', RequestPriority.URGENT)
      .in('status', [RequestStatus.OPEN, RequestStatus.IN_REVIEW]);

    if (error) throw error;

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get recent requests
 * @param limit - Number of records
 * @returns Recent requests
 */
export async function getRecentRequests(
  limit: number = 10
): Promise<ListResult<Request>> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: (data as Request[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<Request[]>(error);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  listRequests,
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  updateRequestStatus,
  approveRequest,
  rejectRequest,
  closeRequest,
  assignRequest,
  deleteRequest,
  getRequestStatusCounts,
  getOpenRequestsCount,
  getUrgentRequestsCount,
  getRecentRequests,
};
