-- ============================================================================
-- TESTIMONIALS FIX - Grant proper permissions for REST API access
-- ============================================================================

-- Ensure table exists with proper schema
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    quote TEXT NOT NULL,
    image_path TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous read access to active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated full access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.testimonials;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.testimonials;

-- Policy: Allow anyone to read active testimonials (for frontend)
CREATE POLICY "Allow anonymous read access to active testimonials"
ON public.testimonials FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Policy: Allow authenticated users to read all testimonials (for admin)
CREATE POLICY "Allow authenticated full access to testimonials"
ON public.testimonials FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.testimonials TO authenticated;
GRANT SELECT ON public.testimonials TO anon;

-- Grant sequence usage for inserts
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure the view exists and has proper permissions
DROP VIEW IF EXISTS public.v_active_testimonials;
CREATE OR REPLACE VIEW public.v_active_testimonials AS
SELECT 
    id,
    name,
    title,
    company,
    quote,
    image_path,
    image_url,
    is_active,
    display_order,
    featured,
    created_at,
    updated_at
FROM public.testimonials
WHERE is_active = true
ORDER BY display_order ASC, created_at DESC;

-- Grant permissions on view
GRANT SELECT ON public.v_active_testimonials TO anon, authenticated;

-- ============================================================================
-- SIMPLIFIED RPC FUNCTIONS (More reliable)
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_active_testimonials();
DROP FUNCTION IF EXISTS public.upsert_testimonial;
DROP FUNCTION IF EXISTS public.delete_testimonial;

-- Function to get active testimonials
CREATE OR REPLACE FUNCTION public.get_active_testimonials()
RETURNS TABLE (
    id UUID,
    name TEXT,
    title TEXT,
    company TEXT,
    quote TEXT,
    image_url TEXT,
    featured BOOLEAN,
    display_order INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.title,
        t.company,
        t.quote,
        t.image_url,
        t.featured,
        t.display_order
    FROM public.testimonials t
    WHERE t.is_active = true
    ORDER BY t.display_order ASC, t.created_at DESC;
END;
$$;

-- Function to upsert testimonial
CREATE OR REPLACE FUNCTION public.upsert_testimonial(
    p_id UUID DEFAULT NULL,
    p_name TEXT DEFAULT NULL,
    p_title TEXT DEFAULT NULL,
    p_company TEXT DEFAULT NULL,
    p_quote TEXT DEFAULT NULL,
    p_image_path TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT true,
    p_display_order INTEGER DEFAULT 0,
    p_featured BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_testimonial_id UUID;
BEGIN
    IF p_id IS NOT NULL THEN
        -- Update existing
        UPDATE public.testimonials
        SET 
            name = COALESCE(p_name, name),
            title = COALESCE(p_title, title),
            company = p_company,
            quote = COALESCE(p_quote, quote),
            image_path = p_image_path,
            image_url = p_image_url,
            is_active = COALESCE(p_is_active, is_active),
            display_order = COALESCE(p_display_order, display_order),
            featured = COALESCE(p_featured, featured),
            updated_at = NOW()
        WHERE id = p_id
        RETURNING id INTO v_testimonial_id;
    ELSE
        -- Insert new
        INSERT INTO public.testimonials (
            name, title, company, quote, image_path, image_url,
            is_active, display_order, featured
        ) VALUES (
            p_name, p_title, p_company, p_quote, p_image_path, p_image_url,
            p_is_active, p_display_order, p_featured
        )
        RETURNING id INTO v_testimonial_id;
    END IF;
    
    RETURN v_testimonial_id;
END;
$$;

-- Function to delete testimonial
CREATE OR REPLACE FUNCTION public.delete_testimonial(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.testimonials WHERE id = p_id;
    RETURN FOUND;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_active_testimonials() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_testimonial TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_testimonial TO authenticated;

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'testimonial-images',
    'testimonial-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read access to testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete testimonial images" ON storage.objects;

CREATE POLICY "Public read access to testimonial images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'testimonial-images');

CREATE POLICY "Authenticated users can upload testimonial images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'testimonial-images');

CREATE POLICY "Authenticated users can delete testimonial images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'testimonial-images');

-- ============================================================================
-- SEED DATA (if empty)
-- ============================================================================

INSERT INTO public.testimonials (name, title, company, quote, image_url, is_active, display_order, featured)
VALUES 
(
    'Dr. Monique Thompson',
    'VP Engineering',
    'TechCorp',
    'Recommend Her connected me with a sponsor who actively advocated for my promotion. Six months later, I landed my dream role. This platform truly changes lives.',
    '/images/testimonial-1.jpg',
    true, 0, true
),
(
    'Zahra Ibrahim',
    'Director of Operations',
    NULL,
    'As a sponsor, I''ve found exceptional talent through this network. It''s not just recruiting—it''s building the future of leadership and creating lasting impact.',
    '/images/testimonial-2.jpg',
    true, 1, false
),
(
    'Patricia Daniels',
    'CFO',
    'Global Finance',
    'The quality of candidates in this pool is outstanding. Every introduction has led to meaningful conversations and successful placements. Highly recommended.',
    '/images/testimonial-3.jpg',
    true, 2, false
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Testimonials setup complete' as status;
SELECT COUNT(*) as total_testimonials FROM public.testimonials;
