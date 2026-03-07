// ============================================================================
// TESTIMONIALS SETUP - Diagnostic and setup helper
// ============================================================================

import { supabase } from '../supabase';

/**
 * Check if testimonials table and functions exist
 */
export async function checkTestimonialsSetup(): Promise<{
  tableExists: boolean;
  rpcExists: boolean;
  bucketExists: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let tableExists = false;
  let rpcExists = false;
  let bucketExists = false;

  // Check table
  try {
    const { error } = await supabase
      .from('testimonials')
      .select('id', { count: 'exact', head: true });
    
    tableExists = !error;
    if (error) errors.push(`Table check: ${error.message}`);
  } catch (e: any) {
    errors.push(`Table check: ${e.message}`);
  }

  // Check RPC function
  try {
    const { error } = await supabase.rpc('upsert_testimonial', {
      p_id: null,
      p_name: 'test',
      p_title: 'test',
      p_quote: 'test',
    });
    // We expect this to fail with validation error, not "function doesn't exist"
    rpcExists = !error?.message?.includes('function') && error?.code !== '42883';
  } catch (e: any) {
    rpcExists = !e.message?.includes('function') && e.code !== '42883';
  }

  // Check storage bucket
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    bucketExists = buckets?.some(b => b.name === 'testimonial-images') || false;
    if (error) errors.push(`Bucket check: ${error.message}`);
  } catch (e: any) {
    errors.push(`Bucket check: ${e.message}`);
  }

  return { tableExists, rpcExists, bucketExists, errors };
}

/**
 * Create testimonials table directly (fallback if migration not run)
 */
export async function createTestimonialsTable(): Promise<boolean> {
  try {
    // Try to create the table with a simple insert
    const { error } = await supabase.from('testimonials').insert({
      name: 'Test',
      title: 'Test',
      quote: 'Test',
      is_active: false,
    }).select();

    if (error?.code === '42P01') {
      // Table doesn't exist - need to run migration
      return false;
    }

    // Clean up test record
    await supabase.from('testimonials').delete().eq('name', 'Test');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get setup instructions
 */
export function getSetupInstructions(): string {
  return `
⚠️ TESTIMONIALS NOT SETUP

The testimonials feature requires database setup. Please:

1. Go to your InsForge dashboard:
   https://aku8v88g.us-east.insforge.app

2. Open the SQL Editor

3. Copy and run the contents of:
   migrations/015_testimonials.sql

4. Refresh this page

This will create:
- testimonials table
- Storage bucket for images
- RPC functions for CRUD operations
`;
}
