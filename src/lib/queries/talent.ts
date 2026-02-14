// ============================================================================
// TALENT QUERIES - Single Source of Truth for Talent Operations
// ============================================================================

import { db } from '../insforge/client';
import type { TalentProfile, TalentProfileInput, TalentProfileUpdate, TalentFilters } from '../types/db';
import type { PaginatedResult, PaginationParams, QueryResult, ListResult } from '../utils/errors';
import { TalentStatus } from '../types/enums';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';
import { subDays } from 'date-fns';

// ============================================================================
// LIST QUERIES
// ============================================================================

export interface ListTalentOptions {
  filters?: TalentFilters;
  pagination?: PaginationParams;
  withCV?: boolean;
}

/**
 * List talent profiles with filtering, sorting, and pagination
 * @param options - Query options
 * @returns Paginated list of talent profiles
 * 
 * @example
 * ```typescript
 * const { data, count, error } = await listTalent({
 *   filters: { status: 'pending', search: 'john' },
 *   pagination: { page: 1, perPage: 25 }
 * });
 * ```
 */
export async function listTalent(
  options: ListTalentOptions = {}
): Promise<PaginatedResult<TalentProfile> & { error: Error | null }> {
  const { filters = {}, pagination = {}, withCV = false } = options;
  const page = pagination.page ?? 1;
  const perPage = pagination.perPage ?? 25;
  const sortBy = pagination.sortBy ?? 'created_at';
  const sortOrder = pagination.sortOrder ?? 'desc';
  
  try {
    let query = db
      .from('talent_profiles')
      .select(withCV ? '*, cv_file:files(*)' : '*', { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }
    
    if (filters.role_category) {
      query = query.eq('role_category', filters.role_category);
    }
    
    if (filters.country) {
      query = query.eq('country', filters.country);
    }
    
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    
    if (filters.education_level) {
      query = query.eq('education_level', filters.education_level);
    }
    
    if (filters.years_of_experience) {
      query = query.eq('years_of_experience', filters.years_of_experience);
    }
    
    if (filters.has_cv === 'yes') {
      query = query.not('cv_file_id', 'is', null);
    } else if (filters.has_cv === 'no') {
      query = query.is('cv_file_id', null);
    }
    
    // Search across multiple fields
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `full_name.ilike.${searchTerm},` +
        `email.ilike.${searchTerm},` +
        `headline.ilike.${searchTerm},` +
        `phone.ilike.${searchTerm},` +
        `bio.ilike.${searchTerm}`
      );
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: (data as unknown as TalentProfile[]) || [],
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
      page,
      perPage,
      totalPages: 0,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get all talent profiles (without pagination)
 * @param filters - Optional filters
 * @returns List of all matching talent profiles
 */
export async function getAllTalent(
  filters?: Omit<TalentFilters, 'search'>
): Promise<ListResult<TalentProfile>> {
  try {
    let query = db.from('talent_profiles').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: (data as TalentProfile[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<TalentProfile[]>(error);
  }
}

// ============================================================================
// SINGLE RECORD QUERIES
// ============================================================================

/**
 * Get talent profile by ID
 * @param id - Talent profile ID
 * @returns Talent profile or null
 */
export async function getTalentById(
  id: string
): Promise<QueryResult<TalentProfile>> {
  try {
    const { data, error } = await db
      .from('talent_profiles')
      .select('*, cv_file:files(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as TalentProfile, error: null };
  } catch (error) {
    return handleSingleQueryError<TalentProfile>(error);
  }
}

/**
 * Get talent profile by email
 * @param email - Email address
 * @returns Talent profile or null
 */
export async function getTalentByEmail(
  email: string
): Promise<QueryResult<TalentProfile>> {
  try {
    const { data, error } = await db
      .from('talent_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;

    return { data: data as TalentProfile, error: null };
  } catch (error) {
    return handleSingleQueryError<TalentProfile>(error);
  }
}

// ============================================================================
// MUTATION QUERIES
// ============================================================================

/**
 * Create talent profile
 * @param input - Talent profile data
 * @returns Created talent profile
 */
export async function createTalent(
  input: TalentProfileInput
): Promise<QueryResult<TalentProfile>> {
  try {
    const { data, error } = await db
      .from('talent_profiles')
      .insert(input)
      .select()
      .single();

    if (error) throw error;

    return { data: data as TalentProfile, error: null };
  } catch (error) {
    return handleSingleQueryError<TalentProfile>(error);
  }
}

/**
 * Update talent profile
 * @param id - Talent profile ID
 * @param updates - Fields to update
 * @returns Updated talent profile
 */
export async function updateTalent(
  id: string,
  updates: TalentProfileUpdate
): Promise<QueryResult<TalentProfile>> {
  try {
    const { data, error } = await db
      .from('talent_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as TalentProfile, error: null };
  } catch (error) {
    return handleSingleQueryError<TalentProfile>(error);
  }
}

/**
 * Update talent status
 * @param id - Talent profile ID
 * @param status - New status
 * @param notes - Optional admin notes
 * @returns Updated talent profile
 */
export async function updateTalentStatus(
  id: string,
  status: TalentStatus,
  notes?: string
): Promise<QueryResult<TalentProfile>> {
  const updates: TalentProfileUpdate = { 
    status,
    updated_at: new Date().toISOString()
  };
  
  if (notes) {
    updates.internal_notes = notes;
  }
  
  if (status === TalentStatus.APPROVED || status === TalentStatus.REJECTED) {
    updates.reviewed_at = new Date().toISOString();
  }
  
  return updateTalent(id, updates);
}

/**
 * Approve talent profile
 * @param id - Talent profile ID
 * @param notes - Optional admin notes
 * @returns Updated talent profile
 */
export async function approveTalent(
  id: string,
  notes?: string
): Promise<QueryResult<TalentProfile>> {
  return updateTalentStatus(id, TalentStatus.APPROVED, notes);
}

/**
 * Reject talent profile
 * @param id - Talent profile ID
 * @param notes - Optional admin notes (required for rejection)
 * @returns Updated talent profile
 */
export async function rejectTalent(
  id: string,
  notes?: string
): Promise<QueryResult<TalentProfile>> {
  return updateTalentStatus(id, TalentStatus.REJECTED, notes);
}

/**
 * Archive talent profile
 * @param id - Talent profile ID
 * @returns Updated talent profile
 */
export async function archiveTalent(
  id: string
): Promise<QueryResult<TalentProfile>> {
  return updateTalentStatus(id, TalentStatus.ARCHIVED);
}

/**
 * Delete talent profile
 * @param id - Talent profile ID
 * @returns True if deleted
 */
export async function deleteTalent(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await db
      .from('talent_profiles')
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
 * Get talent status counts for dashboard
 * @returns Counts by status
 */
export async function getTalentStatusCounts(): Promise<
  QueryResult<Array<{ status: string; count: number }>>
> {
  try {
    const { data, error } = await db
      .from('talent_profiles')
      .select('status');

    if (error) throw error;

    // Count by status
    const counts: Record<string, number> = {};
    data?.forEach((item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });

    const result = Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));

    return { data: result, error: null };
  } catch (error) {
    return handleSingleQueryError<Array<{ status: string; count: number }>>(error);
  }
}

/**
 * Get pending talent count
 * @returns Number of pending talent profiles
 */
export async function getPendingTalentCount(): Promise<number> {
  try {
    const { count, error } = await db
      .from('talent_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', TalentStatus.PENDING);

    if (error) throw error;

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get new talent count for last N days
 * @param days - Number of days
 * @returns Count of new talent profiles
 */
export async function getNewTalentCount(days: number = 7): Promise<number> {
  try {
    const since = subDays(new Date(), days).toISOString();
    const { count, error } = await db
      .from('talent_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since);

    if (error) throw error;

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get recent talent submissions
 * @param limit - Number of records
 * @returns Recent talent profiles
 */
export async function getRecentTalent(
  limit: number = 10
): Promise<ListResult<TalentProfile>> {
  try {
    const { data, error } = await db
      .from('talent_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: (data as TalentProfile[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<TalentProfile[]>(error);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  listTalent,
  getAllTalent,
  getTalentById,
  getTalentByEmail,
  createTalent,
  updateTalent,
  updateTalentStatus,
  approveTalent,
  rejectTalent,
  archiveTalent,
  deleteTalent,
  getTalentStatusCounts,
  getPendingTalentCount,
  getNewTalentCount,
  getRecentTalent,
};
