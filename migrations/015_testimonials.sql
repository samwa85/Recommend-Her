-- ============================================================================
-- TESTIMONIALS TABLE - For managing homepage testimonials via admin dashboard
-- ============================================================================

-- Create testimonials table
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

-- Add comments for documentation
COMMENT ON TABLE public.testimonials IS 'Homepage testimonials managed via admin dashboard';
COMMENT ON COLUMN public.testimonials.name IS 'Full name of the person giving testimonial';
COMMENT ON COLUMN public.testimonials.title IS 'Job title of the person';
COMMENT ON COLUMN public.testimonials.company IS 'Company/organization name';
COMMENT ON COLUMN public.testimonials.quote IS 'The testimonial text';
COMMENT ON COLUMN public.testimonials.image_path IS 'Storage path to the image file';
COMMENT ON COLUMN public.testimonials.image_url IS 'Public URL to the image (cached)';
COMMENT ON COLUMN public.testimonials.is_active IS 'Whether to show this testimonial';
COMMENT ON COLUMN public.testimonials.display_order IS 'Sort order (lower = first)';
COMMENT ON COLUMN public.testimonials.featured IS 'Highlight this testimonial';

-- Create index for active testimonials ordered by display_order
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order 
ON public.testimonials(is_active, display_order);

-- Create index for featured testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_featured 
ON public.testimonials(featured) WHERE featured = true;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS testimonials_updated_at ON public.testimonials;
CREATE TRIGGER testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_testimonials_updated_at();

-- ============================================================================
-- VIEW: Active testimonials for frontend
-- ============================================================================

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

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Function to get active testimonials (for frontend)
DROP FUNCTION IF EXISTS public.get_active_testimonials();
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

-- Function to add/update testimonial (for admin)
DROP FUNCTION IF EXISTS public.upsert_testimonial;
CREATE OR REPLACE FUNCTION public.upsert_testimonial(
    p_id UUID DEFAULT NULL,
    p_name TEXT,
    p_title TEXT,
    p_company TEXT DEFAULT NULL,
    p_quote TEXT,
    p_image_path TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT true,
    p_display_order INTEGER DEFAULT 0,
    p_featured BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_testimonial_id UUID;
BEGIN
    IF p_id IS NOT NULL THEN
        -- Update existing
        UPDATE public.testimonials
        SET 
            name = p_name,
            title = p_title,
            company = p_company,
            quote = p_quote,
            image_path = p_image_path,
            image_url = p_image_url,
            is_active = p_is_active,
            display_order = p_display_order,
            featured = p_featured,
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
    
    -- Log audit
    INSERT INTO public.audit_logs (
        action,
        entity_type,
        entity_id,
        metadata,
        created_at
    ) VALUES (
        CASE WHEN p_id IS NOT NULL THEN 'updated' ELSE 'created' END,
        'testimonial',
        v_testimonial_id,
        jsonb_build_object('name', p_name, 'is_active', p_is_active),
        NOW()
    );
    
    RETURN v_testimonial_id;
END;
$$;

-- Function to delete testimonial
DROP FUNCTION IF EXISTS public.delete_testimonial;
CREATE OR REPLACE FUNCTION public.delete_testimonial(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_image_path TEXT;
BEGIN
    -- Get image path for cleanup
    SELECT image_path INTO v_image_path
    FROM public.testimonials
    WHERE id = p_id;
    
    -- Delete testimonial
    DELETE FROM public.testimonials WHERE id = p_id;
    
    -- Log audit
    INSERT INTO public.audit_logs (
        action,
        entity_type,
        entity_id,
        metadata,
        created_at
    ) VALUES (
        'deleted',
        'testimonial',
        p_id,
        jsonb_build_object('image_path', v_image_path),
        NOW()
    );
    
    RETURN FOUND;
END;
$$;

-- Function to reorder testimonials
DROP FUNCTION IF EXISTS public.reorder_testimonials;
CREATE OR REPLACE FUNCTION public.reorder_testimonials(p_orders UUID[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
    v_order INTEGER;
BEGIN
    FOR v_order IN 1..array_length(p_orders, 1) LOOP
        v_id := p_orders[v_order];
        UPDATE public.testimonials
        SET display_order = v_order - 1
        WHERE id = v_id;
    END LOOP;
    
    RETURN true;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Allow public to read active testimonials
GRANT SELECT ON public.v_active_testimonials TO anon;
GRANT SELECT ON public.v_active_testimonials TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_testimonials() TO anon;
GRANT EXECUTE ON FUNCTION public.get_active_testimonials() TO authenticated;

-- Allow admin operations (authenticated users only)
GRANT EXECUTE ON FUNCTION public.upsert_testimonial TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_testimonial TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_testimonials TO authenticated;

-- Allow reading all testimonials for admin
GRANT SELECT ON public.testimonials TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;

-- ============================================================================
-- SEED DATA: Add existing testimonials to database
-- ============================================================================

INSERT INTO public.testimonials (name, title, company, quote, image_url, is_active, display_order, featured)
VALUES 
(
    'Dr. Monique Thompson',
    'VP Engineering',
    'TechCorp',
    'Recommend Her connected me with a sponsor who actively advocated for my promotion. Six months later, I landed my dream role. This platform truly changes lives.',
    '/images/testimonial-1.jpg',
    true,
    0,
    true
),
(
    'Zahra Ibrahim',
    'Director of Operations',
    NULL,
    'As a sponsor, I''ve found exceptional talent through this network. It''s not just recruiting—it''s building the future of leadership and creating lasting impact.',
    '/images/testimonial-2.jpg',
    true,
    1,
    false
),
(
    'Patricia Daniels',
    'CFO',
    'Global Finance',
    'The quality of candidates in this pool is outstanding. Every introduction has led to meaningful conversations and successful placements. Highly recommended.',
    '/images/testimonial-3.jpg',
    true,
    2,
    false
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for testimonial images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'testimonial-images',
    'testimonial-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to testimonial images
DROP POLICY IF EXISTS "Public can view testimonial images" ON storage.objects;
CREATE POLICY "Public can view testimonial images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'testimonial-images');

-- Policy: Allow authenticated users to upload testimonial images
DROP POLICY IF EXISTS "Authenticated can upload testimonial images" ON storage.objects;
CREATE POLICY "Authenticated can upload testimonial images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'testimonial-images');

-- Policy: Allow authenticated users to update testimonial images
DROP POLICY IF EXISTS "Authenticated can update testimonial images" ON storage.objects;
CREATE POLICY "Authenticated can update testimonial images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'testimonial-images');

-- Policy: Allow authenticated users to delete testimonial images
DROP POLICY IF EXISTS "Authenticated can delete testimonial images" ON storage.objects;
CREATE POLICY "Authenticated can delete testimonial images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'testimonial-images');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Testimonials table created' as status;
SELECT count(*) as total_testimonials FROM public.testimonials;
SELECT 'Storage bucket created: testimonial-images' as status;
