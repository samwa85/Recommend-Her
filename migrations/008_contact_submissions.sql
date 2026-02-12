-- ============================================================================
-- CONTACT SUBMISSIONS TABLE
-- Store contact form submissions
-- ============================================================================

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text NOT NULL,
    inquiry_type text NOT NULL,
    organization text,
    message text NOT NULL,
    status text NOT NULL CHECK (status IN ('new', 'read', 'replied', 'archived')) DEFAULT 'new',
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
DROP POLICY IF EXISTS "Contact: Allow anonymous insert" ON public.contact_submissions;
CREATE POLICY "Contact: Allow anonymous insert" ON public.contact_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow admin full access
DROP POLICY IF EXISTS "Contact: Admin full access" ON public.contact_submissions;
CREATE POLICY "Contact: Admin full access" ON public.contact_submissions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================================
-- FUNCTION TO SUBMIT CONTACT FORM
-- ============================================================================

DROP FUNCTION IF EXISTS public.submit_contact_form CASCADE;

CREATE OR REPLACE FUNCTION public.submit_contact_form(
    p_full_name text,
    p_email text,
    p_inquiry_type text,
    p_organization text DEFAULT '',
    p_message text DEFAULT ''
)
RETURNS uuid 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_submission_id uuid;
BEGIN
    INSERT INTO public.contact_submissions (
        full_name,
        email,
        inquiry_type,
        organization,
        message,
        status
    ) VALUES (
        p_full_name,
        p_email,
        p_inquiry_type,
        p_organization,
        p_message,
        'new'
    )
    RETURNING id INTO v_submission_id;
    
    -- Write audit log
    INSERT INTO public.audit_logs (
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        'CONTACT_FORM_SUBMIT',
        'contact_submission',
        v_submission_id,
        jsonb_build_object(
            'email', p_email, 
            'name', p_full_name,
            'inquiry_type', p_inquiry_type
        )
    );
    
    RETURN v_submission_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.submit_contact_form TO anon;
GRANT EXECUTE ON FUNCTION public.submit_contact_form TO authenticated;

-- ============================================================================
-- VIEW FOR ADMIN DASHBOARD
-- ============================================================================

DROP VIEW IF EXISTS public.v_contact_submissions;
CREATE OR REPLACE VIEW public.v_contact_submissions AS
SELECT 
    id,
    full_name,
    email,
    inquiry_type,
    organization,
    message,
    status,
    created_at,
    updated_at
FROM public.contact_submissions
ORDER BY created_at DESC;

-- Grant select to authenticated users
GRANT SELECT ON public.v_contact_submissions TO authenticated;

-- ============================================================================
-- VERIFY
-- ============================================================================

-- Check table and function exist
SELECT 'contact_submissions table exists' as check_result
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'contact_submissions'
);

SELECT 'submit_contact_form function exists' as check_result
WHERE EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'submit_contact_form'
);
