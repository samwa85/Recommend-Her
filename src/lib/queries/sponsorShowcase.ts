// ============================================================================
// SPONSOR SHOWCASE QUERIES - CRUD operations for sponsor showcase
// ============================================================================

import { db } from '../insforge/client';
import type { SponsorShowcase, SponsorShowcaseInput } from '../types/db';

// ============================================================================
// LIST QUERIES
// ============================================================================

export async function listSponsorShowcase(
  options: { activeOnly?: boolean } = {}
): Promise<{ data: SponsorShowcase[]; error: Error | null }> {
  try {
    let query = db
      .from('sponsor_showcase')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (options.activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[SponsorShowcase] listSponsorShowcase error:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

export async function getActiveSponsorShowcase(): Promise<{ data: SponsorShowcase[]; error: Error | null }> {
  try {
    const { data, error } = await db
      .from('sponsor_showcase')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[SponsorShowcase] getActiveSponsorShowcase error:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

// ============================================================================
// SINGLE RECORD QUERIES
// ============================================================================

export async function getSponsorShowcaseById(
  id: string
): Promise<{ data: SponsorShowcase | null; error: Error | null }> {
  try {
    const { data, error } = await db
      .from('sponsor_showcase')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('[SponsorShowcase] getSponsorShowcaseById error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

// ============================================================================
// MUTATION QUERIES
// ============================================================================

export async function createSponsorShowcase(
  input: SponsorShowcaseInput
): Promise<{ data: SponsorShowcase | null; error: Error | null }> {
  try {
    const { data, error } = await db
      .from('sponsor_showcase')
      .insert({
        name: input.name,
        title: input.title,
        company: input.company || null,
        bio: input.bio,
        image_path: input.image_path || null,
        image_url: input.image_url || null,
        linkedin_url: input.linkedin_url || null,
        is_active: input.is_active ?? true,
        display_order: input.display_order ?? 0,
        featured: input.featured ?? false,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('[SponsorShowcase] createSponsorShowcase error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

export async function updateSponsorShowcase(
  id: string,
  input: Partial<SponsorShowcaseInput>
): Promise<{ data: SponsorShowcase | null; error: Error | null }> {
  try {
    const { data, error } = await db
      .from('sponsor_showcase')
      .update({
        name: input.name,
        title: input.title,
        company: input.company,
        bio: input.bio,
        image_path: input.image_path,
        image_url: input.image_url,
        linkedin_url: input.linkedin_url,
        is_active: input.is_active,
        display_order: input.display_order,
        featured: input.featured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('[SponsorShowcase] updateSponsorShowcase error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

export async function deleteSponsorShowcase(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await db
      .from('sponsor_showcase')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('[SponsorShowcase] deleteSponsorShowcase error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

// ============================================================================
// REORDER
// ============================================================================

export async function reorderSponsorShowcase(
  ids: string[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Update each sponsor's display_order based on position in array
    for (let i = 0; i < ids.length; i++) {
      const { error } = await db
        .from('sponsor_showcase')
        .update({ display_order: i })
        .eq('id', ids[i]);
      
      if (error) throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('[SponsorShowcase] reorderSponsorShowcase error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

// ============================================================================
// STATUS TOGGLES
// ============================================================================

export async function toggleSponsorShowcaseActive(
  id: string,
  is_active: boolean
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await db
      .from('sponsor_showcase')
      .update({ is_active })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('[SponsorShowcase] toggleSponsorShowcaseActive error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

export async function toggleSponsorShowcaseFeatured(
  id: string,
  featured: boolean
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await db
      .from('sponsor_showcase')
      .update({ featured })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('[SponsorShowcase] toggleSponsorShowcaseFeatured error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

// ============================================================================
// STATS
// ============================================================================

export async function getSponsorShowcaseStats(): Promise<{ 
  total: number; 
  active: number; 
  inactive: number; 
  featured: number;
  error: Error | null;
}> {
  try {
    const { data, error } = await db
      .from('sponsor_showcase')
      .select('is_active, featured');
    
    if (error) throw error;
    
    const total = data?.length || 0;
    const active = data?.filter(s => s.is_active).length || 0;
    const inactive = total - active;
    const featured = data?.filter(s => s.featured).length || 0;
    
    return { total, active, inactive, featured, error: null };
  } catch (error) {
    console.error('[SponsorShowcase] getSponsorShowcaseStats error:', error);
    return { total: 0, active: 0, inactive: 0, featured: 0, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
