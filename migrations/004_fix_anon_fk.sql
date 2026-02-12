-- ============================================================================
-- FIX ANONYMOUS SUBMISSIONS: Remove FK constraint blocking anonymous users
-- ============================================================================

-- First, let's see what constraints exist on profiles
-- Run this to verify: 
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'profiles'::regclass;

-- Drop the foreign key constraint that requires auth.users entry
-- This allows anonymous profiles without auth.users records
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add a comment explaining this is intentional for anonymous submissions
COMMENT ON TABLE public.profiles IS 'User profiles. ID can be auth.users UUID (for registered users) or random UUID (for anonymous submissions)';

-- Make sure the function still works
DROP FUNCTION IF EXISTS public.submit_talent_profile_anon CASCADE;

CREATE OR REPLACE FUNCTION public.submit_talent_profile_anon(
    p_full_name text,
    p_email text,
    p_headline text,
    p_bio text DEFAULT '',
    p_years_experience int DEFAULT 0,
    p_industry text DEFAULT '',
    p_seniority_level text DEFAULT '',
    p_functions text[] DEFAULT '{}',
    p_skills text[] DEFAULT '{}',
    p_languages text[] DEFAULT '{}',
    p_linkedin_url text DEFAULT '',
    p_portfolio_url text DEFAULT '',
    p_cv_file_path text DEFAULT NULL
)
RETURNS uuid 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id uuid;
    v_talent_id uuid;
BEGIN
    -- Generate a new UUID for this anonymous user
    v_profile_id := gen_random_uuid();
    
    -- Create profile (anonymous user, no auth.users entry)
    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        email,
        created_at,
        updated_at
    ) VALUES (
        v_profile_id,
        'talent',
        p_full_name,
        p_email,
        NOW(),
        NOW()
    );
    
    -- Create talent profile
    INSERT INTO public.talent_profiles (
        user_id,
        headline,
        bio,
        years_experience,
        industry,
        seniority_level,
        functions,
        skills,
        languages,
        linkedin_url,
        portfolio_url,
        cv_file_path,
        status,
        submitted_at,
        created_at,
        updated_at
    ) VALUES (
        v_profile_id,
        p_headline,
        p_bio,
        p_years_experience,
        p_industry,
        p_seniority_level,
        p_functions,
        p_skills,
        p_languages,
        p_linkedin_url,
        p_portfolio_url,
        p_cv_file_path,
        'submitted',
        NOW(),
        NOW(),
        NOW()
    )
    RETURNING id INTO v_talent_id;
    
    -- Write audit log
    INSERT INTO public.audit_logs (
        action,
        entity_type,
        entity_id,
        metadata,
        created_at
    ) VALUES (
        'TALENT_SUBMIT_ANON',
        'talent_profile',
        v_talent_id,
        jsonb_build_object('email', p_email, 'name', p_full_name),
        NOW()
    );
    
    RETURN v_talent_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO anon;
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO authenticated;

-- ============================================================================
-- UPDATE RLS POLICIES
-- ============================================================================

-- Allow anonymous inserts to profiles
DROP POLICY IF EXISTS "Profiles: Allow anonymous insert" ON public.profiles;
CREATE POLICY "Profiles: Allow anonymous insert" ON public.profiles
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow anonymous inserts to talent_profiles
DROP POLICY IF EXISTS "Talent: Allow anonymous insert" ON public.talent_profiles;
CREATE POLICY "Talent: Allow anonymous insert" ON public.talent_profiles
    FOR INSERT TO anon
    WITH CHECK (true);

-- ============================================================================
-- VERIFY FK WAS REMOVED
-- ============================================================================

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';
-- Should return empty if FK was successfully removed
