-- ============================================================================
-- RECOMMENDHER DATABASE SETUP
-- Run this in your InsForge/Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: CORE TABLES
-- ============================================================================

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL DEFAULT 'talent',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create talent_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.talent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    headline TEXT,
    bio TEXT,
    years_experience INTEGER DEFAULT 0,
    industry TEXT,
    seniority_level TEXT,
    functions TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    linkedin_url TEXT,
    portfolio_url TEXT,
    cv_file_path TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sponsor_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.sponsor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    org_name TEXT NOT NULL,
    title TEXT,
    linkedin_url TEXT,
    industry TEXT,
    sponsor_type TEXT DEFAULT 'connector',
    commitment_note TEXT,
    wants_talent_pool_access BOOLEAN DEFAULT FALSE,
    wants_onboarding_call BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 2: ANONYMOUS SUBMISSION FUNCTION
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.submit_talent_profile_anon CASCADE;

-- Create function for anonymous talent submission
CREATE OR REPLACE FUNCTION public.submit_talent_profile_anon(
    p_full_name TEXT,
    p_email TEXT,
    p_headline TEXT,
    p_bio TEXT DEFAULT '',
    p_years_experience INTEGER DEFAULT 0,
    p_industry TEXT DEFAULT '',
    p_seniority_level TEXT DEFAULT '',
    p_functions TEXT[] DEFAULT '{}',
    p_skills TEXT[] DEFAULT '{}',
    p_languages TEXT[] DEFAULT '{}',
    p_linkedin_url TEXT DEFAULT '',
    p_portfolio_url TEXT DEFAULT '',
    p_cv_file_path TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
    v_talent_id UUID;
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

-- ============================================================================
-- PART 3: SPONSOR ANONYMOUS SUBMISSION FUNCTION
-- ============================================================================

DROP FUNCTION IF EXISTS public.submit_sponsor_profile_anon CASCADE;

CREATE OR REPLACE FUNCTION public.submit_sponsor_profile_anon(
    p_full_name TEXT,
    p_email TEXT,
    p_title TEXT,
    p_phone TEXT DEFAULT '',
    p_org_name TEXT,
    p_linkedin_url TEXT DEFAULT '',
    p_industry TEXT,
    p_sponsor_type TEXT DEFAULT 'connector',
    p_commitment_note TEXT DEFAULT '',
    p_wants_talent_pool_access BOOLEAN DEFAULT FALSE,
    p_wants_onboarding_call BOOLEAN DEFAULT FALSE
)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sponsor_id UUID;
BEGIN
    INSERT INTO public.sponsor_profiles (
        full_name,
        email,
        phone,
        org_name,
        title,
        linkedin_url,
        industry,
        sponsor_type,
        commitment_note,
        wants_talent_pool_access,
        wants_onboarding_call,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_full_name,
        p_email,
        p_phone,
        p_org_name,
        p_title,
        p_linkedin_url,
        p_industry,
        p_sponsor_type,
        p_commitment_note,
        p_wants_talent_pool_access,
        p_wants_onboarding_call,
        'pending',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_sponsor_id;
    
    -- Write audit log
    INSERT INTO public.audit_logs (
        action,
        entity_type,
        entity_id,
        metadata,
        created_at
    ) VALUES (
        'SPONSOR_SUBMIT_ANON',
        'sponsor_profile',
        v_sponsor_id,
        jsonb_build_object('email', p_email, 'name', p_full_name, 'org', p_org_name),
        NOW()
    );
    
    RETURN v_sponsor_id;
END;
$$;

-- ============================================================================
-- PART 4: ADMIN VIEWS
-- ============================================================================

-- View for pending talent reviews
DROP VIEW IF EXISTS public.v_pending_talent_reviews;
CREATE OR REPLACE VIEW public.v_pending_talent_reviews AS
SELECT 
    tp.id, 
    tp.user_id, 
    p.full_name, 
    p.email, 
    tp.headline, 
    tp.industry,
    tp.seniority_level, 
    tp.years_experience, 
    tp.submitted_at, 
    tp.cv_file_path,
    tp.linkedin_url, 
    tp.status,
    tp.functions,
    tp.skills,
    tp.languages
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.status = 'submitted' 
ORDER BY tp.submitted_at ASC;

-- View for admin dashboard metrics
DROP VIEW IF EXISTS public.v_admin_dashboard_metrics;
CREATE OR REPLACE VIEW public.v_admin_dashboard_metrics AS
SELECT
    (SELECT COUNT(*) FROM public.talent_profiles WHERE status = 'submitted') as pending_reviews,
    (SELECT COUNT(*) FROM public.talent_profiles WHERE status = 'approved') as approved_talent,
    (SELECT COUNT(*) FROM public.sponsor_profiles WHERE status = 'pending') as pending_sponsors,
    (SELECT COUNT(*) FROM public.sponsor_profiles WHERE status = 'active') as active_sponsors,
    (SELECT COUNT(*) FROM public.talent_profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_talent_7d,
    (SELECT COUNT(*) FROM public.sponsor_profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_sponsors_7d;

-- View for pending sponsor approvals
DROP VIEW IF EXISTS public.v_pending_sponsor_approvals;
CREATE OR REPLACE VIEW public.v_pending_sponsor_approvals AS
SELECT 
    sp.*
FROM public.sponsor_profiles sp
WHERE sp.status = 'pending'
ORDER BY sp.created_at ASC;

-- ============================================================================
-- PART 5: GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO anon;
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_sponsor_profile_anon TO anon;
GRANT EXECUTE ON FUNCTION public.submit_sponsor_profile_anon TO authenticated;

-- Grant select on views
GRANT SELECT ON public.v_pending_talent_reviews TO anon;
GRANT SELECT ON public.v_pending_talent_reviews TO authenticated;
GRANT SELECT ON public.v_admin_dashboard_metrics TO authenticated;
GRANT SELECT ON public.v_pending_sponsor_approvals TO authenticated;

-- Grant access to tables
GRANT INSERT ON public.profiles TO anon;
GRANT INSERT ON public.talent_profiles TO anon;
GRANT INSERT ON public.sponsor_profiles TO anon;
GRANT INSERT ON public.audit_logs TO anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.talent_profiles TO authenticated;
GRANT SELECT ON public.sponsor_profiles TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- ============================================================================
-- PART 6: VERIFY SETUP
-- ============================================================================

-- Check if function exists
SELECT 
    'Anonymous submission function exists: ' || proname as status
FROM pg_proc 
WHERE proname = 'submit_talent_profile_anon'
UNION ALL
SELECT 
    'Sponsor submission function exists: ' || proname as status
FROM pg_proc 
WHERE proname = 'submit_sponsor_profile_anon';
