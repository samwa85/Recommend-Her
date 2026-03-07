-- ============================================================================
-- SUPABASE STORAGE SETUP
-- Run this via Supabase Dashboard SQL Editor or after storage bucket creation
-- ============================================================================

-- ============================================================================
-- STORAGE BUCKET CREATION
-- ============================================================================

-- NOTE: Create the bucket via Supabase Dashboard or use the Supabase CLI:
-- supabase storage create recommendher-files

-- After bucket creation, run these policies:

-- Allow public uploads (for form submissions)
CREATE POLICY "Public can upload files"
ON storage.objects
FOR INSERT
TO PUBLIC
WITH CHECK (
    bucket_id = 'recommendher-files' AND
    (storage.foldername(name))[1] IN ('talent', 'sponsor', 'request', 'message')
);

-- Allow admin full access
CREATE POLICY "Admin full access on storage"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'recommendher-files')
WITH CHECK (bucket_id = 'recommendher-files');

-- Allow public to read their own uploads (by path pattern)
CREATE POLICY "Public can read talent CVs"
ON storage.objects
FOR SELECT
TO PUBLIC
USING (
    bucket_id = 'recommendher-files' AND
    (storage.foldername(name))[1] = 'talent'
);

-- ============================================================================
-- HELPER FUNCTION FOR FILE URL GENERATION
-- ============================================================================

-- Function to generate public URL for a file
CREATE OR REPLACE FUNCTION get_file_public_url(file_id UUID)
RETURNS TEXT AS $$
DECLARE
    file_record RECORD;
    supabase_url TEXT;
BEGIN
    -- Get the file record
    SELECT * INTO file_record FROM files WHERE id = file_id;
    
    IF file_record IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Construct public URL (you'll need to set this in your app config)
    -- This returns the path; your app will construct the full URL
    RETURN file_record.path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER TO AUTO-UPDATE FILE PUBLIC URL
-- ============================================================================

-- Function to update file public_url after insert
CREATE OR REPLACE FUNCTION update_file_public_url()
RETURNS TRIGGER AS $$
DECLARE
    supabase_project_url TEXT := 'https://your-project.supabase.co'; -- Update this
BEGIN
    NEW.public_url := supabase_project_url || '/storage/v1/object/public/' || NEW.bucket || '/' || NEW.path;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: You can also set this in application code
-- The public_url is optional; recommended to construct URLs in your app

-- ============================================================================
-- FILE CLEANUP TRIGGER
-- Delete file metadata when storage object is deleted
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_file_metadata()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM files WHERE path = OLD.name AND bucket = OLD.bucket_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- This trigger would need to be created on storage.objects
-- But that requires service role, so handle in app logic instead

-- ============================================================================
-- END OF STORAGE SETUP
-- ============================================================================
