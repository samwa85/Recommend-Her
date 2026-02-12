-- ============================================================================
-- ANONYMOUS TALENT SUBMISSIONS
-- Allow anyone to submit a profile without authentication
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.submit_talent_profile_anon CASCADE;

-- Create function for anonymous talent submission
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
        email
    ) VALUES (
        v_profile_id,
        'talent',
        p_full_name,
        p_email
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
        submitted_at
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
        NOW()
    )
    RETURNING id INTO v_talent_id;
    
    -- Write audit log
    INSERT INTO public.audit_logs (
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        'TALENT_SUBMIT_ANON',
        'talent_profile',
        v_talent_id,
        jsonb_build_object('email', p_email, 'name', p_full_name)
    );
    
    RETURN v_talent_id;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO anon;
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO authenticated;

-- ============================================================================
-- UPDATE RLS POLICIES FOR ANONYMOUS ACCESS
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

-- Allow anonymous inserts to audit_logs (via the function)
DROP POLICY IF EXISTS "Audit: Allow service insert" ON public.audit_logs;
CREATE POLICY "Audit: Allow service insert" ON public.audit_logs
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- ============================================================================
-- VERIFY
-- ============================================================================

-- Check function exists
SELECT 
    proname as function_name,
    proargnames as arguments,
    prosrc IS NOT NULL as has_body
FROM pg_proc 
WHERE proname = 'submit_talent_profile_anon';
