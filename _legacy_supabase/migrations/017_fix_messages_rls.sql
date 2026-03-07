-- ============================================================================
-- FIX MESSAGES RLS POLICIES
-- Allows admin dashboard to UPDATE and DELETE messages via anon key
-- ============================================================================

-- Drop existing restrictive policies on messages table
DROP POLICY IF EXISTS "Public can insert messages" ON messages;
DROP POLICY IF EXISTS "Admin full access on messages" ON messages;

-- Enable RLS (if not already enabled)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for contact forms)
CREATE POLICY "Public can insert messages"
    ON messages
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

-- Policy: Allow anyone to select (for admin dashboard read)
-- This is needed because the admin dashboard uses the anon key
CREATE POLICY "Public can view messages"
    ON messages
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Policy: Allow anyone to update (for admin dashboard status updates)
-- This enables mark as read, archive, etc.
CREATE POLICY "Public can update messages"
    ON messages
    FOR UPDATE
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Policy: Allow anyone to delete (for admin dashboard delete)
CREATE POLICY "Public can delete messages"
    ON messages
    FOR DELETE
    TO PUBLIC
    USING (true);

-- Alternative: If you want to restrict to authenticated users only,
-- comment out the PUBLIC policies above and use these instead:

-- CREATE POLICY "Authenticated can view all messages"
--     ON messages
--     FOR SELECT
--     TO authenticated
--     USING (true);

-- CREATE POLICY "Authenticated can update messages"
--     ON messages
--     FOR UPDATE
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- CREATE POLICY "Authenticated can delete messages"
--     ON messages
--     FOR DELETE
--     TO authenticated
--     USING (true);

-- ============================================================================
-- CONTACT_SUBMISSIONS TABLE (if it exists separately)
-- Apply same RLS fixes
-- ============================================================================

-- Check if contact_submissions table exists and apply same policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_submissions') THEN
        -- Enable RLS
        ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Public can insert contact_submissions" ON contact_submissions;
        DROP POLICY IF EXISTS "Admin full access on contact_submissions" ON contact_submissions;
        DROP POLICY IF EXISTS "Public can view contact_submissions" ON contact_submissions;
        DROP POLICY IF EXISTS "Public can update contact_submissions" ON contact_submissions;
        DROP POLICY IF EXISTS "Public can delete contact_submissions" ON contact_submissions;
        
        -- Create permissive policies for admin dashboard
        CREATE POLICY "Public can insert contact_submissions"
            ON contact_submissions
            FOR INSERT
            TO PUBLIC
            WITH CHECK (true);
        
        CREATE POLICY "Public can view contact_submissions"
            ON contact_submissions
            FOR SELECT
            TO PUBLIC
            USING (true);
        
        CREATE POLICY "Public can update contact_submissions"
            ON contact_submissions
            FOR UPDATE
            TO PUBLIC
            USING (true)
            WITH CHECK (true);
        
        CREATE POLICY "Public can delete contact_submissions"
            ON contact_submissions
            FOR DELETE
            TO PUBLIC
            USING (true);
    END IF;
END
$$;

-- ============================================================================
-- VERIFY POLICIES
-- ============================================================================

-- List all policies on messages table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages';
