// ============================================================================
// INSFORGE CLIENT - Database client singleton
// Provides Supabase-compatible API using InsForge SDK
// ============================================================================

import { createClient } from '@insforge/sdk';
import type { InsForgeClient, Database, Auth, Storage } from '@insforge/sdk';

let clientInstance: InsForgeClient | null = null;
let initError: Error | null = null;

/**
 * Get InsForge client singleton
 * @returns InsForge client instance
 */
export function getInsforgeClient(): InsForgeClient {
  if (clientInstance) return clientInstance;
  if (initError) throw initError;

  const baseUrl = import.meta.env['VITE_INSFORGE_URL'] || import.meta.env['VITE_SUPABASE_URL'];
  const anonKey = import.meta.env['VITE_INSFORGE_ANON_KEY'] || import.meta.env['VITE_SUPABASE_ANON_KEY'];

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
 * Database helper - direct access to database
 */
export const db = {
  from(table: string) {
    return getDb().from(table);
  },
  rpc(fn: string, args?: Record<string, unknown>) {
    return getDb().rpc(fn, args);
  },
};

/**
 * Get database instance lazily
 */
export function getDb(): Database {
  const client = getInsforgeClient();
  return client.database;
}

/**
 * Get auth instance lazily
 */
export function getAuth(): Auth {
  const client = getInsforgeClient();
  return client.auth;
}

/**
 * Get storage instance lazily
 */
export function getStorage(): Storage {
  const client = getInsforgeClient();
  return client.storage;
}

/**
 * Supabase-compatible client API
 * This provides a backward-compatible interface that matches Supabase client
 */
export const insforge = {
  // Database operations - direct access to database
  get database() {
    return getInsforgeClient().database;
  },
  
  // Storage operations
  get storage() {
    return getInsforgeClient().storage;
  },
  
  // Auth operations
  get auth() {
    return getInsforgeClient().auth;
  },
  
  // Direct from() method for backward compatibility
  from(table: string) {
    return getDb().from(table);
  },
  
  // Direct rpc() method for backward compatibility
  rpc(fn: string, args?: Record<string, unknown>) {
    return getDb().rpc(fn, args);
  },
  
  // Realtime channel (if supported by InsForge)
  channel(_name: string) {
    const client = getInsforgeClient();
    if ('realtime' in client && client.realtime && typeof (client.realtime as unknown as { channel?: (name: string) => unknown }).channel === 'function') {
      return (client.realtime as unknown as { channel: (name: string) => unknown }).channel(_name);
    }
    // Return a mock channel if realtime is not available
    return {
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    };
  },
};

// Re-export types
export type { InsForgeClient, Database, Auth, Storage };

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
  const baseUrl = import.meta.env['VITE_INSFORGE_URL'] || import.meta.env['VITE_SUPABASE_URL'];
  return `${baseUrl}/api/storage/buckets/${bucket}/objects/${encodeURIComponent(path)}`;
}
