// ============================================================================
// SPONSOR QUERIES - Single Source of Truth for Sponsor Operations
// ============================================================================

import { db } from '../insforge/client';
import type { SponsorProfile, SponsorProfileInput, SponsorProfileUpdate, SponsorFilters } from '../types/db';
import type { PaginatedResult, PaginationParams, QueryResult, ListResult } from '../utils/errors';
import { SponsorStatus } from '../types/enums';
import { handleQueryError, handleSingleQueryError } from '../utils/errors';

// ============================================================================
// LIST QUERIES
// ============================================================================

export interface ListSponsorsOptions {
  filters?: SponsorFilters;
  pagination?: PaginationParams;
}

/**
 * List sponsor profiles with filtering, sorting, and pagination
 * @param options - Query options
 * @returns Paginated list of sponsor profiles
 * 
 * @example
 * ```typescript
 * const { data, count, error } = await listSponsors({
 *   filters: { status: 'active' },
 *   pagination: { page: 1, perPage: 25 }
 * });
 * ```
 */
export async function listSponsors(
  options: ListSponsorsOptions = {}
): Promise<PaginatedResult<SponsorProfile> & { error: Error | null }> {
  const { filters = {}, pagination = {} } = options;
  const page = pagination.page ?? 1;
  const perPage = pagination.perPage ?? 25;
  const sortBy = pagination.sortBy ?? 'created_at';
  const sortOrder = pagination.sortOrder ?? 'desc';
  
  try {
    let query = db
      .from('sponsor_profiles')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }
    
    if (filters.company_size) {
      query = query.eq('company_size', filters.company_size);
    }
    
    if (filters.is_recruiter !== undefined) {
      query = query.eq('is_recruiter', filters.is_recruiter);
    }
    
    if (filters.sponsorship_amount) {
      query = query.eq('sponsorship_amount', filters.sponsorship_amount);
    }
    
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    
    // Search across multiple fields
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `full_name.ilike.${searchTerm},` +
        `email.ilike.${searchTerm},` +
        `company_name.ilike.${searchTerm},` +
        `phone.ilike.${searchTerm},` +
        `message.ilike.${searchTerm}`
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
      data: (data as SponsorProfile[]) || [],
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
 * Get all sponsor profiles (without pagination)
 * @param filters - Optional filters
 * @returns List of all matching sponsor profiles
 */
export async function getAllSponsors(
  filters?: Omit<SponsorFilters, 'search'>
): Promise<ListResult<SponsorProfile>> {
  try {
    let query = db.from('sponsor_profiles').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: (data as SponsorProfile[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<SponsorProfile[]>(error);
  }
}

// ============================================================================
// SINGLE RECORD QUERIES
// ============================================================================

/**
 * Get sponsor profile by ID
 * @param id - Sponsor profile ID
 * @returns Sponsor profile or null
 */
export async function getSponsorById(
  id: string
): Promise<QueryResult<SponsorProfile>> {
  try {
    const { data, error } = await db
      .from('sponsor_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as SponsorProfile, error: null };
  } catch (error) {
    return handleSingleQueryError<SponsorProfile>(error);
  }
}

/**
 * Get sponsor profile by email
 * @param email - Email address
 * @returns Sponsor profile or null
 */
export async function getSponsorByEmail(
  email: string
): Promise<QueryResult<SponsorProfile>> {
  try {
    const { data, error } = await db
      .from('sponsor_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;

    return { data: data as SponsorProfile, error: null };
  } catch (error) {
    return handleSingleQueryError<SponsorProfile>(error);
  }
}

// ============================================================================
// MUTATION QUERIES
// ============================================================================

/**
 * Create sponsor profile
 * @param input - Sponsor profile data
 * @returns Created sponsor profile
 */
export async function createSponsor(
  input: SponsorProfileInput
): Promise<QueryResult<SponsorProfile>> {
  try {
    const { data, error } = await db
      .from('sponsor_profiles')
      .insert(input)
      .select()
      .single();

    if (error) throw error;

    return { data: data as SponsorProfile, error: null };
  } catch (error) {
    return handleSingleQueryError<SponsorProfile>(error);
  }
}

/**
 * Update sponsor profile
 * @param id - Sponsor profile ID
 * @param updates - Fields to update
 * @returns Updated sponsor profile
 */
export async function updateSponsor(
  id: string,
  updates: SponsorProfileUpdate
): Promise<QueryResult<SponsorProfile>> {
  try {
    const { data, error } = await db
      .from('sponsor_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as SponsorProfile, error: null };
  } catch (error) {
    return handleSingleQueryError<SponsorProfile>(error);
  }
}

/**
 * Update sponsor status
 * @param id - Sponsor profile ID
 * @param status - New status
 * @param notes - Optional admin notes
 * @returns Updated sponsor profile
 */
export async function updateSponsorStatus(
  id: string,
  status: SponsorStatus,
  notes?: string
): Promise<QueryResult<SponsorProfile>> {
  const updates: SponsorProfileUpdate = { 
    status,
    updated_at: new Date().toISOString()
  };
  
  if (notes) {
    updates.internal_notes = notes;
  }
  
  return updateSponsor(id, updates);
}

/**
 * Activate sponsor profile
 * @param id - Sponsor profile ID
 * @returns Updated sponsor profile
 */
export async function activateSponsor(
  id: string
): Promise<QueryResult<SponsorProfile>> {
  return updateSponsorStatus(id, SponsorStatus.ACTIVE);
}

/**
 * Deactivate sponsor profile
 * @param id - Sponsor profile ID
 * @param notes - Optional admin notes
 * @returns Updated sponsor profile
 */
export async function deactivateSponsor(
  id: string,
  notes?: string
): Promise<QueryResult<SponsorProfile>> {
  return updateSponsorStatus(id, SponsorStatus.INACTIVE, notes);
}

/**
 * Archive sponsor profile
 * @param id - Sponsor profile ID
 * @returns Updated sponsor profile
 */
export async function archiveSponsor(
  id: string
): Promise<QueryResult<SponsorProfile>> {
  return updateSponsorStatus(id, SponsorStatus.ARCHIVED);
}

/**
 * Delete sponsor profile
 * @param id - Sponsor profile ID
 * @returns True if deleted
 */
export async function deleteSponsor(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await db
      .from('sponsor_profiles')
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
 * Get sponsor status counts for dashboard
 * @returns Counts by status
 */
export async function getSponsorStatusCounts(): Promise<
  QueryResult<Array<{ status: string; count: number }>>
> {
  try {
    const { data, error } = await db
      .from('sponsor_profiles')
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
 * Get active sponsor count
 * @returns Number of active sponsors
 */
export async function getActiveSponsorCount(): Promise<number> {
  try {
    const { count, error } = await db
      .from('sponsor_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', SponsorStatus.ACTIVE);

    if (error) throw error;

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get recent sponsor submissions
 * @param limit - Number of records
 * @returns Recent sponsor profiles
 */
export async function getRecentSponsors(
  limit: number = 10
): Promise<ListResult<SponsorProfile>> {
  try {
    const { data, error } = await db
      .from('sponsor_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: (data as SponsorProfile[]) || [], count: data?.length || 0, error: null };
  } catch (error) {
    return handleQueryError<SponsorProfile[]>(error);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  listSponsors,
  getAllSponsors,
  getSponsorById,
  getSponsorByEmail,
  createSponsor,
  updateSponsor,
  updateSponsorStatus,
  activateSponsor,
  deactivateSponsor,
  archiveSponsor,
  deleteSponsor,
  getSponsorStatusCounts,
  getActiveSponsorCount,
  getRecentSponsors,
};
