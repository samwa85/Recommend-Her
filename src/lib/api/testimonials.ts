// ============================================================================
// TESTIMONIALS API - Database operations for managing testimonials
// ============================================================================

import { getInsforgeClient } from '@/lib/insforge/client';
import type { Testimonial, TestimonialInput, ActiveTestimonial } from '../database.types';

const TESTIMONIALS_BUCKET = 'testimonial-images';

// ============================================================================
// PUBLIC API (for frontend)
// ============================================================================

/**
 * Get all active testimonials for the homepage
 * @returns Array of active testimonials ordered by display_order
 */
export async function getActiveTestimonials(): Promise<ActiveTestimonial[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching active testimonials:', error);
      return [];
    }

    return (data || []) as ActiveTestimonial[];
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    return [];
  }
}

/**
 * Get active testimonials from view (alternative method)
 * @returns Array of active testimonials
 */
export async function getActiveTestimonialsFromView(): Promise<Testimonial[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching testimonials from view:', error);
      return [];
    }

    return (data || []) as Testimonial[];
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    return [];
  }
}

// ============================================================================
// ADMIN API (requires authentication)
// ============================================================================

/**
 * Get all testimonials (including inactive) for admin management
 * @returns Array of all testimonials
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  console.log('🔍 [API] Fetching all testimonials...');
  
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [API] Error fetching testimonials:', error);
      
      // Check if it's a connection/config issue
      if (error.message?.includes('Cannot GET') || error.message?.includes('404')) {
        throw new Error('Database table not accessible. The migration may need to be run again or there may be a schema issue.');
      }
      if (error.code === '42P01') {
        throw new Error('Table not found. Please run the testimonials migration.');
      }
      if (error.code === '42501' || error.message?.includes('permission')) {
        throw new Error('Permission denied. Check database permissions.');
      }
      throw error;
    }

    console.log('✅ [API] Fetched', data?.length || 0, 'testimonials');
    return (data || []) as Testimonial[];
  } catch (err) {
    console.error('❌ [API] Exception:', err);
    throw err;
  }
}

/**
 * Get a single testimonial by ID
 * @param id - Testimonial ID
 * @returns Testimonial or null
 */
export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching testimonial:', error);
      return null;
    }

    return data as Testimonial;
  } catch (err) {
    console.error('Error fetching testimonial:', err);
    return null;
  }
}

/**
 * Create or update a testimonial
 * @param input - Testimonial data
 * @param id - Optional ID for updating existing testimonial
 * @returns Created/updated testimonial ID
 */
export async function upsertTestimonial(
  input: TestimonialInput,
  id?: string
): Promise<string> {
  console.log('📝 [API] Upserting testimonial:', { id, name: input.name });
  
  try {
    const client = getInsforgeClient();
    
    if (id) {
      // Update existing
      const { error } = await client.database
        .from('testimonials')
        .update({
          name: input.name,
          title: input.title,
          company: input.company || null,
          quote: input.quote,
          image_path: input.image_path || null,
          image_url: input.image_url || null,
          is_active: input.is_active ?? true,
          display_order: input.display_order ?? 0,
          featured: input.featured ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      console.log('✅ [API] Testimonial updated:', id);
      return id;
    } else {
      // Insert new
      const { data, error } = await client.database
        .from('testimonials')
        .insert({
          name: input.name,
          title: input.title,
          company: input.company || null,
          quote: input.quote,
          image_path: input.image_path || null,
          image_url: input.image_url || null,
          is_active: input.is_active ?? true,
          display_order: input.display_order ?? 0,
          featured: input.featured ?? false,
        })
        .select('id')
        .single();

      if (error) throw error;
      console.log('✅ [API] Testimonial created:', data?.id);
      return data?.id || '';
    }
  } catch (err) {
    console.error('❌ [API] Error saving testimonial:', err);
    throw err;
  }
}

/**
 * Delete a testimonial
 * @param id - Testimonial ID to delete
 * @returns True if deleted successfully
 */
export async function deleteTestimonial(id: string): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    return false;
  }
}

/**
 * Toggle testimonial active status
 * @param id - Testimonial ID
 * @param isActive - New active status
 * @returns True if updated successfully
 */
export async function toggleTestimonialStatus(
  id: string,
  isActive: boolean
): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database
      .from('testimonials')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling testimonial status:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error toggling testimonial status:', err);
    return false;
  }
}

/**
 * Set testimonial as featured
 * @param id - Testimonial ID
 * @param featured - Whether to feature this testimonial
 * @returns True if updated successfully
 */
export async function setTestimonialFeatured(
  id: string,
  featured: boolean
): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database
      .from('testimonials')
      .update({ featured })
      .eq('id', id);

    if (error) {
      console.error('Error setting testimonial featured status:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error setting testimonial featured status:', err);
    return false;
  }
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

/**
 * Upload testimonial image to storage
 * @param file - Image file to upload
 * @param testimonialId - Testimonial ID for naming
 * @returns Object with path and publicUrl
 */
export async function uploadTestimonialImage(
  file: File,
  testimonialId?: string
): Promise<{ path: string; publicUrl: string }> {
  // Generate unique filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = testimonialId 
    ? `${testimonialId}-${timestamp}.${fileExt}`
    : `testimonial-${timestamp}.${fileExt}`;
  const filePath = `testimonials/${fileName}`;

  try {
    const client = getInsforgeClient();
    
    // Upload to storage
    const { data, error: uploadError } = await client.storage
      .from(TESTIMONIALS_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const publicUrl = client.storage
      .from(TESTIMONIALS_BUCKET)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: publicUrl || '',
    };
  } catch (err) {
    console.error('Error uploading image:', err);
    throw err;
  }
}

/**
 * Delete testimonial image from storage
 * @param path - Image path in storage
 * @returns True if deleted successfully
 */
export async function deleteTestimonialImage(path: string): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.storage
      .from(TESTIMONIALS_BUCKET)
      .remove(path);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting image:', err);
    return false;
  }
}

/**
 * Reorder testimonials
 * @param orderedIds - Array of testimonial IDs in desired order
 * @returns True if reordered successfully
 */
export async function reorderTestimonials(orderedIds: string[]): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    
    // Update each testimonial's display_order
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await client.database
        .from('testimonials')
        .update({ display_order: i })
        .eq('id', orderedIds[i]);
      
      if (error) throw error;
    }
    
    return true;
  } catch (err) {
    console.error('Error reordering testimonials:', err);
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { TESTIMONIALS_BUCKET };
