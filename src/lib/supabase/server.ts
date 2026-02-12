// ============================================================================
// SUPABASE SERVER CLIENT
// Note: This file is for server-side usage only (e.g., in API routes)
// For browser usage, use client.ts instead
// ============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare const process: {
  env: {
    SUPABASE_URL?: string;
    VITE_SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
  };
};

/**
 * Create a server-side Supabase client
 * Use this in server contexts (API routes, serverless functions)
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 * 
 * Note: This is a factory function - create a new instance per request
 * to avoid sharing state between requests.
 */
export function createServerClient(): SupabaseClient {
  // In a real server environment, these would be process.env
  // For client-side builds, this function should not be called
  const url = process.env['SUPABASE_URL'] || process.env['VITE_SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !key) {
    throw new Error(
      'Missing Supabase server environment variables. This function should only be called in server contexts.'
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Execute a function with server-side admin privileges
 * @param fn - Function to execute with admin client
 * @returns Result of the function
 */
export async function withAdminClient<T>(
  fn: (client: SupabaseClient) => Promise<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const client = createServerClient();
    const data = await fn(client);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
