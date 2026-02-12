-- ============================================================================
-- ANONYMOUS SPONSOR SUBMISSIONS
-- Allow anyone to submit a sponsor application without authentication
-- ============================================================================

-- First, add missing columns to sponsor_profiles if they don't exist
DO $$
BEGIN
    -- Add company_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'sponsor_profiles' AND column_name = 'company_name'
    ) THEN
        ALTER TABLE public.sponsor_profiles ADD COLUMN company_name text;
    END IF;
    
    -- Add contact_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'sponsor_profiles' AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE public.sponsor_profiles ADD COLUMN contact_email text;
    END IF;
    
    -- Add company_size column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'sponsor_profiles' AND column_name = 'company_size'
    ) THEN
        ALTER TABLE public.sponsor_profiles ADD COLUMN company_size text;
    END IF;
END
$$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.submit_sponsor_profile_anon CASCADE;

-- Create function for anonymous sponsor submission
CREATE OR REPLACE FUNCTION public.submit_sponsor_profile_anon(
    p_full_name text,
    p_email text,
    p_title text,
    p_phone text DEFAULT '',
    p_org_name text DEFAULT '',
    p_linkedin_url text DEFAULT '',
    p_industry text DEFAULT '',
    p_sponsor_type text DEFAULT 'connector',
    p_commitment_note text DEFAULT '',
    p_wants_talent_pool_access boolean DEFAULT false,
    p_wants_onboarding_call boolean DEFAULT false
)
RETURNS uuid 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id uuid;
    v_sponsor_id uuid;
BEGIN
    -- Generate a new UUID for this anonymous user
    v_profile_id := gen_random_uuid();
    
    -- Create profile (anonymous user, no auth.users entry)
    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        email,
        phone
    ) VALUES (
        v_profile_id,
        'sponsor',
        p_full_name,
        p_email,
        p_phone
    );
    
    -- Create sponsor profile
    INSERT INTO public.sponsor_profiles (
        user_id,
        title,
        org_name,
        company_name,
        contact_email,
        linkedin_url,
        industry,
        sponsor_type,
        commitment_note,
        verified,
        status,
        created_at
    ) VALUES (
        v_profile_id,
        p_title,
        p_org_name,
        p_org_name,
        p_email,
        p_linkedin_url,
        p_industry,
        p_sponsor_type,
        p_commitment_note,
        false,
        'pending',
        NOW()
    )
    RETURNING id INTO v_sponsor_id;
    
    -- Write audit log
    INSERT INTO public.audit_logs (
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        'SPONSOR_SUBMIT_ANON',
        'sponsor_profile',
        v_sponsor_id,
        jsonb_build_object(
            'email', p_email, 
            'name', p_full_name,
            'org', p_org_name,
            'wants_talent_pool', p_wants_talent_pool_access,
            'wants_onboarding', p_wants_onboarding_call
        )
    );
    
    RETURN v_sponsor_id;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.submit_sponsor_profile_anon TO anon;
GRANT EXECUTE ON FUNCTION public.submit_sponsor_profile_anon TO authenticated;

-- ============================================================================
-- UPDATE RLS POLICIES FOR ANONYMOUS SPONSOR ACCESS
-- ============================================================================

-- Allow anonymous inserts to sponsor_profiles
DROP POLICY IF EXISTS "Sponsor: Allow anonymous insert" ON public.sponsor_profiles;
CREATE POLICY "Sponsor: Allow anonymous insert" ON public.sponsor_profiles
    FOR INSERT TO anon
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
WHERE proname = 'submit_sponsor_profile_anon';
