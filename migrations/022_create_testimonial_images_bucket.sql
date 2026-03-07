-- ============================================================================
-- CREATE TESTIMONIAL IMAGES BUCKET
-- ============================================================================

-- Create the bucket for testimonial images
INSERT INTO storage.buckets (name, public)
VALUES ('testimonial-images', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- RLS POLICIES FOR TESTIMONIAL IMAGES
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated uploads testimonial" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates testimonial" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes testimonial" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read testimonial" ON storage.objects;

-- Allow authenticated users to upload images (using 'bucket' column)
CREATE POLICY "Allow authenticated uploads testimonial" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket = 'testimonial-images');

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated updates testimonial" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket = 'testimonial-images');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes testimonial" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket = 'testimonial-images');

-- Allow public read access to testimonial images
CREATE POLICY "Allow public read testimonial" 
ON storage.objects FOR SELECT 
TO anon 
USING (bucket = 'testimonial-images');

-- ============================================================================
-- VERIFY
-- ============================================================================
SELECT name, public FROM storage.buckets WHERE name = 'testimonial-images';
