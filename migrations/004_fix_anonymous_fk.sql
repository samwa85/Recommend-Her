-- ============================================================================
-- FIX: Remove foreign key constraint for anonymous submissions
-- The profiles table had an FK to auth.users which prevents anonymous inserts
-- ============================================================================

-- First, check if the constraint exists and drop it
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add a comment explaining the change
COMMENT ON TABLE public.profiles IS 'User profiles. ID can reference auth.users OR be a standalone UUID for anonymous submissions';

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update the anonymous insert policy to be more permissive
DROP POLICY IF EXISTS "Profiles: Allow anonymous insert" ON public.profiles;
CREATE POLICY "Profiles: Allow anonymous insert" ON public.profiles
    FOR INSERT TO anon
    WITH CHECK (true);

-- Add policy for service role to manage all profiles
DROP POLICY IF EXISTS "Profiles: Service role can manage all" ON public.profiles;
CREATE POLICY "Profiles: Service role can manage all" ON public.profiles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- VERIFY THE FIX
-- ============================================================================

-- Check constraints on profiles table
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'profiles'
AND tc.table_schema = 'public'
AND tc.constraint_type = 'FOREIGN KEY';
