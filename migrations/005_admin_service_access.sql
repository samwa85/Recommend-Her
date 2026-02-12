-- ============================================================================
-- ADMIN SERVICE ACCESS
-- Add policies to allow admin to read all data including anonymous profiles
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE - Admin can read all (including anonymous)
-- Uses direct role check for better performance
-- ============================================================================

DROP POLICY IF EXISTS "Profiles: Admin read all" ON public.profiles;
CREATE POLICY "Profiles: Admin read all" ON public.profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================================
-- TALENT_PROFILES TABLE - Ensure admin can read all
-- ============================================================================

DROP POLICY IF EXISTS "Talent: Admin read all" ON public.talent_profiles;
CREATE POLICY "Talent: Admin read all" ON public.talent_profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================================
-- SPONSOR_PROFILES TABLE - Ensure admin can read all
-- ============================================================================

DROP POLICY IF EXISTS "Sponsor: Admin read all" ON public.sponsor_profiles;
CREATE POLICY "Sponsor: Admin read all" ON public.sponsor_profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================================
-- UPDATE ANONYMOUS SUBMISSION FUNCTION
-- Ensure it properly inserts profiles without auth.users requirement
-- ============================================================================

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

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO anon;
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO authenticated;

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================

-- Check if is_admin function exists and is working
SELECT 
    proname,
    prosrc IS NOT NULL as has_body,
    prosecdef as is_security_definer
FROM pg_proc 
WHERE proname = 'is_admin';

-- Check RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'talent_profiles', 'sponsor_profiles')
AND schemaname = 'public';
