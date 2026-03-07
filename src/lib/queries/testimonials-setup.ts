// ============================================================================
// TESTIMONIALS TABLE SETUP - Run this to create the testimonials table
// ============================================================================

import { getInsforgeClient } from '@/lib/insforge/client';

export async function setupTestimonialsTable(): Promise<{ success: boolean; message: string }> {
  try {
    const client = getInsforgeClient();
    const db = client.database;

    // Try to query the testimonials table to see if it exists
    const { data, error } = await db
      .from('testimonials')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Testimonials table error:', error);
      return { 
        success: false, 
        message: `Table not accessible: ${error.message}. Please run the SQL migration manually in your InsForge dashboard.` 
      };
    }

    return { success: true, message: 'Testimonials table is ready!' };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { 
      success: false, 
      message: `Setup failed: ${error.message}` 
    };
  }
}

// SQL to run manually in InsForge dashboard:
export const TESTIMONIALS_SQL = `
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  quote TEXT NOT NULL,
  image_path TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access" 
  ON public.testimonials 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

GRANT ALL ON public.testimonials TO authenticated;
`;
