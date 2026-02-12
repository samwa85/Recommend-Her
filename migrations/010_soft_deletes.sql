-- ============================================================================
-- SOFT DELETES & DATA RECOVERY
-- Never permanently delete data, just mark as deleted
-- ============================================================================

-- Add deleted_at column to talent_profiles
ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.profiles(id);

-- Add deleted_at column to sponsor_profiles
ALTER TABLE public.sponsor_profiles 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.profiles(id);

-- Add deleted_at column to contact_submissions
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.profiles(id);

-- Create view for active (non-deleted) talent
CREATE OR REPLACE VIEW public.v_active_talent AS
SELECT * FROM public.talent_profiles
WHERE deleted_at IS NULL;

-- Create view for active sponsors
CREATE OR REPLACE VIEW public.v_active_sponsors AS
SELECT * FROM public.sponsor_profiles
WHERE deleted_at IS NULL;

-- Function for soft delete talent
CREATE OR REPLACE FUNCTION public.soft_delete_talent(
    p_talent_id uuid,
    p_deleted_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.talent_profiles
    SET 
        deleted_at = NOW(),
        deleted_by = p_deleted_by,
        status = 'rejected'
    WHERE id = p_talent_id AND deleted_at IS NULL;
    
    -- Log the action
    INSERT INTO public.audit_logs (action, entity_type, entity_id, metadata)
    VALUES (
        'TALENT_SOFT_DELETE',
        'talent_profile',
        p_talent_id,
        jsonb_build_object('deleted_by', p_deleted_by)
    );
    
    RETURN FOUND;
END;
$$;

-- Function for soft delete sponsor
CREATE OR REPLACE FUNCTION public.soft_delete_sponsor(
    p_sponsor_id uuid,
    p_deleted_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.sponsor_profiles
    SET 
        deleted_at = NOW(),
        deleted_by = p_deleted_by,
        status = 'rejected'
    WHERE id = p_sponsor_id AND deleted_at IS NULL;
    
    INSERT INTO public.audit_logs (action, entity_type, entity_id, metadata)
    VALUES (
        'SPONSOR_SOFT_DELETE',
        'sponsor_profile',
        p_sponsor_id,
        jsonb_build_object('deleted_by', p_deleted_by)
    );
    
    RETURN FOUND;
END;
$$;

-- Function to restore soft-deleted record
CREATE OR REPLACE FUNCTION public.restore_deleted_record(
    p_table_name text,
    p_record_id uuid,
    p_restored_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    CASE p_table_name
        WHEN 'talent_profiles' THEN
            UPDATE public.talent_profiles
            SET deleted_at = NULL, deleted_by = NULL, status = 'submitted'
            WHERE id = p_record_id;
        WHEN 'sponsor_profiles' THEN
            UPDATE public.sponsor_profiles
            SET deleted_at = NULL, deleted_by = NULL, status = 'pending'
            WHERE id = p_record_id;
        WHEN 'contact_submissions' THEN
            UPDATE public.contact_submissions
            SET deleted_at = NULL, deleted_by = NULL
            WHERE id = p_record_id;
        ELSE
            RAISE EXCEPTION 'Unknown table: %', p_table_name;
    END CASE;
    
    INSERT INTO public.audit_logs (action, entity_type, entity_id, metadata)
    VALUES (
        'RECORD_RESTORE',
        p_table_name,
        p_record_id,
        jsonb_build_object('restored_by', p_restored_by)
    );
    
    RETURN FOUND;
END;
$$;

-- View for deleted records (for admin recovery)
CREATE OR REPLACE VIEW public.v_deleted_records AS
SELECT 
    'talent' as record_type,
    id,
    deleted_at,
    deleted_by,
    profiles.full_name as deleted_by_name
FROM public.talent_profiles
LEFT JOIN public.profiles ON talent_profiles.deleted_by = profiles.id
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
    'sponsor' as record_type,
    id,
    deleted_at,
    deleted_by,
    profiles.full_name as deleted_by_name
FROM public.sponsor_profiles
LEFT JOIN public.profiles ON sponsor_profiles.deleted_by = profiles.id
WHERE deleted_at IS NOT NULL

ORDER BY deleted_at DESC;

-- Grant permissions
GRANT SELECT ON public.v_deleted_records TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_talent TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_sponsor TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_deleted_record TO authenticated;

-- Update RLS policies to exclude deleted records
DROP POLICY IF EXISTS "Talent: Read own" ON public.talent_profiles;
CREATE POLICY "Talent: Read own" ON public.talent_profiles FOR SELECT
    USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Talent: Sponsors read approved only" ON public.talent_profiles;
CREATE POLICY "Talent: Sponsors read approved only" ON public.talent_profiles FOR SELECT
    USING (
        status = 'approved' 
        AND deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.sponsor_profiles sp
            WHERE sp.user_id = auth.uid() AND sp.status = 'approved'
        )
    );

DROP POLICY IF EXISTS "Talent: Admin full access" ON public.talent_profiles;
CREATE POLICY "Talent: Admin full access" ON public.talent_profiles FOR ALL
    USING (public.is_admin(auth.uid()));
