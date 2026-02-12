-- ============================================================================
-- ADD EMAIL NOTIFICATION SUPPORT TO CONTACT SUBMISSIONS
-- ============================================================================

-- Add notified_at column to track email notifications
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS notified_at timestamptz;

-- Create index for efficient querying of unnotified submissions
CREATE INDEX IF NOT EXISTS idx_contact_submissions_notified 
ON public.contact_submissions(notified_at) 
WHERE notified_at IS NULL;

-- Create a view for unnotified submissions
DROP VIEW IF EXISTS public.v_unnotified_contact_submissions;
CREATE OR REPLACE VIEW public.v_unnotified_contact_submissions AS
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
WHERE notified_at IS NULL
ORDER BY created_at ASC;

-- Grant select to authenticated users (for admin dashboard)
GRANT SELECT ON public.v_unnotified_contact_submissions TO authenticated;

-- Create function to mark submissions as notified
DROP FUNCTION IF EXISTS public.mark_contact_submissions_notified CASCADE;

CREATE OR REPLACE FUNCTION public.mark_contact_submissions_notified(
    p_submission_ids uuid[]
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count integer;
BEGIN
    UPDATE public.contact_submissions
    SET notified_at = NOW()
    WHERE id = ANY(p_submission_ids)
      AND notified_at IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$;

-- Grant execute permission to service role (for notification script)
GRANT EXECUTE ON FUNCTION public.mark_contact_submissions_notified TO service_role;

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT 'notified_at column added' as check_result
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'contact_submissions' 
      AND column_name = 'notified_at'
);

SELECT 'mark_contact_submissions_notified function exists' as check_result
WHERE EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'mark_contact_submissions_notified'
);
