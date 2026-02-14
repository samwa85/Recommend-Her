// ============================================================================
// INSFORGE CLIENT - Database client singleton
// ============================================================================

import { createClient } from '@insforge/sdk';
import type { InsForgeClient, Database } from '@insforge/sdk';

let clientInstance: InsForgeClient | null = null;
let initError: Error | null = null;

/**
 * Get InsForge client singleton
 * @returns InsForge client instance
 */
export function getInsforgeClient(): InsForgeClient {
  if (clientInstance) return clientInstance;
  if (initError) throw initError;

  const baseUrl = import.meta.env['VITE_SUPABASE_URL'];
  const anonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'];

  console.log('[InsForge] Initializing client...', { 
    baseUrl: baseUrl ? 'set' : 'missing', 
    anonKey: anonKey ? 'set' : 'missing' 
  });

  if (!baseUrl || !anonKey) {
    initError = new Error(
      'Missing InsForge environment variables. Please check your .env file.'
    );
    throw initError;
  }

  try {
    clientInstance = createClient({
      baseUrl,
      anonKey,
    });
    console.log('[InsForge] Client initialized successfully');
    return clientInstance;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    console.error('[InsForge] Failed to initialize client:', initError);
    throw initError;
  }
}

/**
 * Get database instance lazily
 */
export function getDb(): Database {
  const client = getInsforgeClient();
  return client.database;
}

// Lazy export for insforge
export const insforge = {
  get database() {
    return getInsforgeClient().database;
  },
  get storage() {
    return getInsforgeClient().storage;
  },
  get auth() {
    return getInsforgeClient().auth;
  },
};

// Lazy export for db
export const db = {
  from(table: string) {
    return getDb().from(table);
  },
  rpc(fn: string, args?: Record<string, unknown>) {
    return getDb().rpc(fn, args);
  },
};

// Re-export types
export type { InsForgeClient, Database };

// ============================================================================
// STORAGE HELPERS
// ============================================================================

export interface UploadFileOptions {
  bucket: string;
  path: string;
  file: globalThis.File;
}

export interface UploadResult {
  key: string;
  url: string;
  error: Error | null;
}

/**
 * Upload file to InsForge Storage
 * @param options - Upload options
 * @returns Upload result with key and url
 */
export async function uploadFile(
  options: UploadFileOptions
): Promise<UploadResult> {
  const { bucket, path, file } = options;
  const client = getInsforgeClient();

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;

    return {
      key: data?.key || path,
      url: data?.url || '',
      error: null,
    };
  } catch (error) {
    return {
      key: '',
      url: '',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Upload file with auto-generated unique key
 * @param bucket - Bucket name
 * @param file - File to upload
 * @returns Upload result with key and url
 */
export async function uploadFileAuto(
  bucket: string,
  file: globalThis.File
): Promise<UploadResult> {
  const client = getInsforgeClient();

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .uploadAuto(file);

    if (error) throw error;

    return {
      key: data?.key || '',
      url: data?.url || '',
      error: null,
    };
  } catch (error) {
    return {
      key: '',
      url: '',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Delete file from storage
 * @param path - File key/path
 * @param bucket - Bucket name
 * @returns True if deleted successfully
 */
export async function deleteFile(
  path: string,
  bucket: string
): Promise<boolean> {
  const client = getInsforgeClient();

  try {
    const { error } = await client.storage.from(bucket).remove(path);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Download file from storage
 * @param path - File key/path
 * @param bucket - Bucket name
 * @returns Blob or null
 */
export async function downloadFile(
  path: string,
  bucket: string
): Promise<Blob | null> {
  const client = getInsforgeClient();

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
}

/**
 * Get public URL for a file
 * Note: InsForge storage URLs are publicly accessible
 * @param bucket - Bucket name
 * @param path - File key/path
 * @returns Public URL string
 */
export function getPublicUrl(bucket: string, path: string): string {
  const baseUrl = import.meta.env['VITE_SUPABASE_URL'];
  return `${baseUrl}/api/storage/buckets/${bucket}/objects/${encodeURIComponent(path)}`;
}