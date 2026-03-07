-- ============================================================================
-- FIX: Update RLS Policy for Messages Module
-- Allows authenticated users to perform updates on contact_submissions
-- ============================================================================

-- Drop the restrictive admin-only policy
DROP POLICY IF EXISTS "Contact: Admin full access" ON public.contact_submissions;

-- Create a more permissive policy for authenticated users
-- This allows any authenticated user to read/update contact submissions
CREATE POLICY "Contact: Authenticated full access" 
    ON public.contact_submissions
    FOR ALL 
    TO authenticated
    USING (true) 
    WITH CHECK (true);

-- Keep anonymous insert for contact form
DROP POLICY IF EXISTS "Contact: Allow anonymous insert" ON public.contact_submissions;
CREATE POLICY "Contact: Allow anonymous insert" 
    ON public.contact_submissions
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- ============================================================================
-- VERIFY THE FIX
-- ============================================================================
SELECT 'RLS policies updated for contact_submissions' as result;

-- Show current policies
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
WHERE tablename = 'contact_submissions';
