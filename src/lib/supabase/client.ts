// ============================================================================
// SUPABASE CLIENT - Browser-side client singleton
// ============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let clientInstance: SupabaseClient | null = null;

/**
 * Get Supabase client singleton
 * @returns Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  const url = import.meta.env['VITE_SUPABASE_URL'];
  const key = import.meta.env['VITE_SUPABASE_ANON_KEY'];

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file.'
    );
  }

  clientInstance = createClient(url, key);
  return clientInstance;
}

/**
 * Supabase client singleton
 * Use this for all Supabase operations in the browser
 */
export const supabase = getSupabaseClient();

// ============================================================================
// STORAGE HELPERS
// ============================================================================

export interface UploadFileOptions {
  bucket: string;
  path: string;
  file: globalThis.File;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  path: string;
  publicUrl: string | null;
  error: Error | null;
}

/**
 * Upload file to Supabase Storage
 * @param options - Upload options
 * @returns Upload result
 */
export async function uploadFile(
  options: UploadFileOptions
): Promise<UploadResult> {
  const { bucket, path, file, metadata } = options;

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
        ...(metadata && { cacheControl: '3600' }),
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      path,
      publicUrl: publicUrlData?.publicUrl || null,
      error: null,
    };
  } catch (error) {
    return {
      path: '',
      publicUrl: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get signed URL for file (for private buckets)
 * @param path - File path
 * @param bucket - Bucket name
 * @param expiresIn - Expiration in seconds (default: 3600)
 * @returns Signed URL string
 */
export async function getSignedUrl(
  path: string,
  bucket: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
}

/**
 * Delete file from storage
 * @param path - File path
 * @param bucket - Bucket name
 * @returns True if deleted successfully
 */
export async function deleteFile(
  path: string,
  bucket: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Download file from storage
 * @param path - File path
 * @param bucket - Bucket name
 * @returns Blob or null
 */
export async function downloadFile(
  path: string,
  bucket: string
): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
}
