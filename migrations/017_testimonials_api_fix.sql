-- ============================================================================
-- TESTIMONIALS API FIX - Ensures table is accessible via REST API
-- ============================================================================

-- Step 1: Ensure schema exists
CREATE SCHEMA IF NOT EXISTS public;

-- Step 2: Create table with explicit public schema
DROP TABLE IF EXISTS public.testimonials CASCADE;
CREATE TABLE public.testimonials (
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

-- Step 3: Add comments for API documentation
COMMENT ON TABLE public.testimonials IS 'Homepage testimonials - accessible via API';

-- Step 4: Disable RLS completely for now (we can enable later)
ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY;

-- Step 5: Grant broad permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Step 6: Specific table grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

-- Step 7: Create the admin view function
CREATE OR REPLACE FUNCTION public.get_all_testimonials_admin()
RETURNS SETOF public.testimonials
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT * FROM public.testimonials 
    ORDER BY display_order ASC, created_at DESC;
$$;

-- Step 8: Create get_active_testimonials function
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
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
$$;

-- Step 9: Grant function permissions
GRANT EXECUTE ON FUNCTION public.get_all_testimonials_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_testimonials() TO anon, authenticated;

-- Step 10: Create upsert function
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
    v_id UUID;
BEGIN
    IF p_id IS NOT NULL THEN
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
        RETURNING id INTO v_id;
    ELSE
        INSERT INTO public.testimonials (
            name, title, company, quote, image_path, image_url,
            is_active, display_order, featured
        ) VALUES (
            p_name, p_title, p_company, p_quote, p_image_path, p_image_url,
            p_is_active, p_display_order, p_featured
        )
        RETURNING id INTO v_id;
    END IF;
    
    RETURN v_id;
END;
$$;

-- Step 11: Create delete function
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

-- Step 12: Grant RPC permissions
GRANT EXECUTE ON FUNCTION public.upsert_testimonial TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_testimonial TO anon, authenticated;

-- Step 13: Seed with sample data
INSERT INTO public.testimonials (name, title, company, quote, image_url, is_active, display_order, featured)
VALUES 
('Dr. Monique Thompson', 'VP Engineering', 'TechCorp', 
 'Recommend Her connected me with a sponsor who actively advocated for my promotion. Six months later, I landed my dream role.', 
 '/images/testimonial-1.jpg', true, 0, true),
('Zahra Ibrahim', 'Director of Operations', NULL, 
 'As a sponsor, I''ve found exceptional talent through this network. It''s building the future of leadership.', 
 '/images/testimonial-2.jpg', true, 1, false),
('Patricia Daniels', 'CFO', 'Global Finance', 
 'The quality of candidates in this pool is outstanding. Every introduction has led to successful placements.', 
 '/images/testimonial-3.jpg', true, 2, false)
ON CONFLICT DO NOTHING;

-- Step 14: Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('testimonial-images', 'testimonial-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Step 15: Storage permissions
CREATE POLICY IF NOT EXISTS "public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'testimonial-images');
CREATE POLICY IF NOT EXISTS "auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'testimonial-images');
CREATE POLICY IF NOT EXISTS "auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'testimonial-images');

-- Step 16: Verify setup
SELECT 
    'Table exists' as check_item,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') as status
UNION ALL
SELECT 
    'Has data',
    EXISTS (SELECT 1 FROM public.testimonials LIMIT 1)
UNION ALL
SELECT 
    'Functions exist',
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'upsert_testimonial');
