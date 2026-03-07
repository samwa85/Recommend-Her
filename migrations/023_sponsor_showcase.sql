-- ============================================================================
-- SPONSOR SHOWCASE TABLE - For displaying sponsor bios on /for-sponsors page
-- ============================================================================

-- Create sponsor_showcase table
CREATE TABLE IF NOT EXISTS public.sponsor_showcase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    bio TEXT NOT NULL,
    image_path TEXT,
    image_url TEXT,
    linkedin_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.sponsor_showcase IS 'Sponsor bios displayed on /for-sponsors page';
COMMENT ON COLUMN public.sponsor_showcase.name IS 'Full name of the sponsor';
COMMENT ON COLUMN public.sponsor_showcase.title IS 'Job title';
COMMENT ON COLUMN public.sponsor_showcase.company IS 'Company name';
COMMENT ON COLUMN public.sponsor_showcase.bio IS 'Sponsor biography/text';
COMMENT ON COLUMN public.sponsor_showcase.image_path IS 'Storage path to the image file';
COMMENT ON COLUMN public.sponsor_showcase.image_url IS 'Public URL to the image';
COMMENT ON COLUMN public.sponsor_showcase.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.sponsor_showcase.is_active IS 'Whether to show this sponsor';
COMMENT ON COLUMN public.sponsor_showcase.display_order IS 'Sort order (lower = first)';
COMMENT ON COLUMN public.sponsor_showcase.featured IS 'Highlight this sponsor';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_showcase_active_order 
ON public.sponsor_showcase(is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_sponsor_showcase_featured 
ON public.sponsor_showcase(featured) WHERE featured = true;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_sponsor_showcase_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS sponsor_showcase_updated_at ON public.sponsor_showcase;
CREATE TRIGGER sponsor_showcase_updated_at
    BEFORE UPDATE ON public.sponsor_showcase
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sponsor_showcase_updated_at();

-- ============================================================================
-- VIEW: Active sponsors for frontend
-- ============================================================================

DROP VIEW IF EXISTS public.v_active_sponsor_showcase;
CREATE OR REPLACE VIEW public.v_active_sponsor_showcase AS
SELECT 
    id,
    name,
    title,
    company,
    bio,
    image_path,
    image_url,
    linkedin_url,
    is_active,
    display_order,
    featured,
    created_at,
    updated_at
FROM public.sponsor_showcase
WHERE is_active = true
ORDER BY display_order ASC, created_at DESC;

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Function to get active sponsors (for frontend)
DROP FUNCTION IF EXISTS public.get_active_sponsor_showcase();
CREATE OR REPLACE FUNCTION public.get_active_sponsor_showcase()
RETURNS TABLE (
    id UUID,
    name TEXT,
    title TEXT,
    company TEXT,
    bio TEXT,
    image_url TEXT,
    linkedin_url TEXT,
    featured BOOLEAN,
    display_order INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.title,
        s.company,
        s.bio,
        s.image_url,
        s.linkedin_url,
        s.featured,
        s.display_order
    FROM public.sponsor_showcase s
    WHERE s.is_active = true
    ORDER BY s.display_order ASC, s.created_at DESC;
END;
$$;

-- Function to add/update sponsor showcase (for admin)
DROP FUNCTION IF EXISTS public.upsert_sponsor_showcase;
CREATE OR REPLACE FUNCTION public.upsert_sponsor_showcase(
    p_name TEXT,
    p_title TEXT,
    p_bio TEXT,
    p_id UUID DEFAULT NULL,
    p_company TEXT DEFAULT NULL,
    p_image_path TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_linkedin_url TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT true,
    p_display_order INTEGER DEFAULT 0,
    p_featured BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sponsor_id UUID;
BEGIN
    IF p_id IS NOT NULL THEN
        -- Update existing
        UPDATE public.sponsor_showcase
        SET 
            name = p_name,
            title = p_title,
            company = p_company,
            bio = p_bio,
            image_path = p_image_path,
            image_url = p_image_url,
            linkedin_url = p_linkedin_url,
            is_active = p_is_active,
            display_order = p_display_order,
            featured = p_featured,
            updated_at = NOW()
        WHERE id = p_id
        RETURNING id INTO v_sponsor_id;
    ELSE
        -- Insert new
        INSERT INTO public.sponsor_showcase (
            name, title, company, bio, image_path, image_url, linkedin_url,
            is_active, display_order, featured
        ) VALUES (
            p_name, p_title, p_company, p_bio, p_image_path, p_image_url, p_linkedin_url,
            p_is_active, p_display_order, p_featured
        )
        RETURNING id INTO v_sponsor_id;
    END IF;
    
    RETURN v_sponsor_id;
END;
$$;

-- Function to delete sponsor showcase
DROP FUNCTION IF EXISTS public.delete_sponsor_showcase;
CREATE OR REPLACE FUNCTION public.delete_sponsor_showcase(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_image_path TEXT;
BEGIN
    -- Get image path for cleanup
    SELECT image_path INTO v_image_path
    FROM public.sponsor_showcase
    WHERE id = p_id;
    
    -- Delete sponsor
    DELETE FROM public.sponsor_showcase WHERE id = p_id;
    
    RETURN FOUND;
END;
$$;

-- Function to reorder sponsors
DROP FUNCTION IF EXISTS public.reorder_sponsor_showcase;
CREATE OR REPLACE FUNCTION public.reorder_sponsor_showcase(p_orders UUID[])
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
        UPDATE public.sponsor_showcase
        SET display_order = v_order - 1
        WHERE id = v_id;
    END LOOP;
    
    RETURN true;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Allow public to read active sponsors
GRANT SELECT ON public.v_active_sponsor_showcase TO anon;
GRANT SELECT ON public.v_active_sponsor_showcase TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_sponsor_showcase() TO anon;
GRANT EXECUTE ON FUNCTION public.get_active_sponsor_showcase() TO authenticated;

-- Allow admin operations
GRANT EXECUTE ON FUNCTION public.upsert_sponsor_showcase TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_sponsor_showcase TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_sponsor_showcase TO authenticated;

-- Allow reading all sponsors for admin
GRANT SELECT ON public.sponsor_showcase TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sponsor_showcase TO authenticated;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.sponsor_showcase ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active sponsors
DROP POLICY IF EXISTS "Public can view active sponsors" ON public.sponsor_showcase;
CREATE POLICY "Public can view active sponsors"
ON public.sponsor_showcase FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated users full access (admin)
DROP POLICY IF EXISTS "Authenticated full access" ON public.sponsor_showcase;
CREATE POLICY "Authenticated full access"
ON public.sponsor_showcase FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- SEED DATA: Sample sponsors
-- ============================================================================

INSERT INTO public.sponsor_showcase (name, title, company, bio, image_url, is_active, display_order, featured)
VALUES 
(
    'Michael Chen',
    'Chief Technology Officer',
    'InnovateTech Solutions',
    'You''ve received this playbook because you''ve taken the first step toward something powerful: becoming an active sponsor for women''s leadership. Perhaps you''ve already mentored brilliant women. You''ve given advice, shared insights, and watched them grow. But you''ve also noticed something: even the most talented women often wait too long to be invited, while others—less qualified but more visible—step into opportunities they deserve.',
    '/images/sponsor-1.jpg',
    true,
    0,
    true
),
(
    'Sarah Williams',
    'VP of Engineering',
    'Global Finance Corp',
    'I believe sponsorship is the accelerator that turns potential into leadership. Through Recommend Her, I''ve had the privilege of recommending exceptional women who are now leading engineering teams and driving innovation across our industry.',
    '/images/sponsor-2.jpg',
    true,
    1,
    false
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for sponsor images
INSERT INTO storage.buckets (name, public, file_size_limit, allowed_mime_types)
VALUES (
    'sponsor-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (name) DO NOTHING;

-- Policy: Allow public read access to sponsor images
DROP POLICY IF EXISTS "Public can view sponsor images" ON storage.objects;
CREATE POLICY "Public can view sponsor images"
ON storage.objects FOR SELECT
TO public
USING (bucket = 'sponsor-images');

-- Policy: Allow authenticated users to upload sponsor images
DROP POLICY IF EXISTS "Authenticated can upload sponsor images" ON storage.objects;
CREATE POLICY "Authenticated can upload sponsor images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket = 'sponsor-images');

-- Policy: Allow authenticated users to update sponsor images
DROP POLICY IF EXISTS "Authenticated can update sponsor images" ON storage.objects;
CREATE POLICY "Authenticated can update sponsor images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket = 'sponsor-images');

-- Policy: Allow authenticated users to delete sponsor images
DROP POLICY IF EXISTS "Authenticated can delete sponsor images" ON storage.objects;
CREATE POLICY "Authenticated can delete sponsor images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket = 'sponsor-images');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Sponsor showcase table created' as status;
SELECT count(*) as total_sponsors FROM public.sponsor_showcase;
