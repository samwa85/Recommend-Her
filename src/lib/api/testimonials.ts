// ============================================================================
// TESTIMONIALS API - Database operations for managing testimonials
// ============================================================================

import { supabase } from '../supabase';
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
  const { data, error } = await supabase
    .rpc('get_active_testimonials');

  if (error) {
    console.error('Error fetching active testimonials:', error);
    return [];
  }

  return data || [];
}

/**
 * Get active testimonials from view (alternative method)
 * @returns Array of active testimonials
 */
export async function getActiveTestimonialsFromView(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('v_active_testimonials')
    .select('*');

  if (error) {
    console.error('Error fetching testimonials from view:', error);
    return [];
  }

  return data || [];
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
  
  // Try using the RPC function first (more reliable)
  try {
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_all_testimonials_admin');
    
    if (!rpcError && rpcData) {
      console.log('✅ [API] Fetched via RPC:', rpcData.length);
      return rpcData;
    }
  } catch (e) {
    console.log('⚠️ [API] RPC failed, trying direct query...');
  }
  
  // Fallback to direct query
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [API] Error fetching testimonials:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    
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
  return data || [];
}

/**
 * Get a single testimonial by ID
 * @param id - Testimonial ID
 * @returns Testimonial or null
 */
export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching testimonial:', error);
    return null;
  }

  return data;
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
  
  // Try RPC function first
  const { data, error } = await supabase
    .rpc('upsert_testimonial', {
      p_id: id || null,
      p_name: input.name,
      p_title: input.title,
      p_company: input.company || null,
      p_quote: input.quote,
      p_image_path: input.image_path || null,
      p_image_url: input.image_url || null,
      p_is_active: input.is_active ?? true,
      p_display_order: input.display_order ?? 0,
      p_featured: input.featured ?? false,
    });

  if (error) {
    console.error('❌ [API] RPC error:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    
    // Fallback: Direct insert/update if RPC doesn't exist
    if (error.message?.includes('function') || error.code === '42883') {
      console.log('🔄 [API] Falling back to direct insert...');
      return upsertTestimonialDirect(input, id);
    }
    
    throw new Error(`Database error: ${error.message}`);
  }

  console.log('✅ [API] Testimonial saved via RPC:', data);
  return data;
}

/**
 * Fallback: Direct insert/update without RPC
 */
async function upsertTestimonialDirect(
  input: TestimonialInput,
  id?: string
): Promise<string> {
  if (id) {
    // Update existing
    const { error } = await supabase
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
    return id;
  } else {
    // Insert new
    const { data, error } = await supabase
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
    return data.id;
  }
}

/**
 * Delete a testimonial
 * @param id - Testimonial ID to delete
 * @returns True if deleted successfully
 */
export async function deleteTestimonial(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('delete_testimonial', { p_id: id });

  if (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }

  return data || false;
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
  const { error } = await supabase
    .from('testimonials')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    console.error('Error toggling testimonial status:', error);
    throw error;
  }

  return true;
}

/**
 * Reorder testimonials
 * @param orderedIds - Array of testimonial IDs in desired order
 * @returns True if reordered successfully
 */
export async function reorderTestimonials(orderedIds: string[]): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('reorder_testimonials', { p_orders: orderedIds });

  if (error) {
    console.error('Error reordering testimonials:', error);
    throw error;
  }

  return data || false;
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
  const { error } = await supabase
    .from('testimonials')
    .update({ featured })
    .eq('id', id);

  if (error) {
    console.error('Error setting testimonial featured status:', error);
    throw error;
  }

  return true;
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

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(TESTIMONIALS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(TESTIMONIALS_BUCKET)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Delete testimonial image from storage
 * @param path - Image path in storage
 * @returns True if deleted successfully
 */
export async function deleteTestimonialImage(path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(TESTIMONIALS_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
}

/**
 * Ensure testimonial images bucket exists
 * Call this on app initialization
 */
export async function ensureTestimonialsBucket(): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === TESTIMONIALS_BUCKET);

    if (!bucketExists) {
      // Create bucket
      const { error } = await supabase.storage.createBucket(TESTIMONIALS_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880, // 5MB
      });

      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Testimonials bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { TESTIMONIALS_BUCKET };
