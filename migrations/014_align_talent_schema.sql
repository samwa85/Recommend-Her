-- ============================================================================
-- MIGRATION: Align talent_profiles schema with admin expectations
-- Strategy: Add new columns alongside old ones, use triggers to sync
-- This allows both old and new code to work during transition
-- ============================================================================

-- ============================================================================
-- PART 1: ADD NEW COLUMNS (if they don't exist)
-- ============================================================================

-- Add new columns first (keep old columns for backward compatibility)
ALTER TABLE public.talent_profiles 
    ADD COLUMN IF NOT EXISTS years_of_experience text,
    ADD COLUMN IF NOT EXISTS current_role_title text,
    ADD COLUMN IF NOT EXISTS role_category text,
    ADD COLUMN IF NOT EXISTS seeking_roles text[],
    ADD COLUMN IF NOT EXISTS website_url text,
    ADD COLUMN IF NOT EXISTS cv_file_id text,
    ADD COLUMN IF NOT EXISTS internal_notes text,
    ADD COLUMN IF NOT EXISTS gdpr_consent boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- ============================================================================
-- PART 2: CREATE TRIGGERS TO SYNC OLD AND NEW COLUMNS
-- ============================================================================

-- Function to sync old -> new columns on insert/update
CREATE OR REPLACE FUNCTION sync_talent_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync from old columns to new columns (if new are null)
    IF NEW.years_of_experience IS NULL AND NEW.years_experience IS NOT NULL THEN
        NEW.years_of_experience := NEW.years_experience::text;
    END IF;
    
    IF NEW.current_role_title IS NULL AND NEW.seniority_level IS NOT NULL THEN
        NEW.current_role_title := NEW.seniority_level;
    END IF;
    
    IF NEW.seeking_roles IS NULL AND NEW.functions IS NOT NULL THEN
        NEW.seeking_roles := NEW.functions;
    END IF;
    
    IF NEW.role_category IS NULL AND NEW.functions IS NOT NULL AND array_length(NEW.functions, 1) > 0 THEN
        NEW.role_category := NEW.functions[1];
    END IF;
    
    IF NEW.website_url IS NULL AND NEW.portfolio_url IS NOT NULL THEN
        NEW.website_url := NEW.portfolio_url;
    END IF;
    
    IF NEW.cv_file_id IS NULL AND NEW.cv_file_path IS NOT NULL THEN
        NEW.cv_file_id := NEW.cv_file_path;
    END IF;
    
    IF NEW.internal_notes IS NULL AND NEW.admin_private_notes IS NOT NULL THEN
        NEW.internal_notes := NEW.admin_private_notes;
    END IF;
    
    -- Also sync in reverse: new columns -> old columns (if old are null)
    IF NEW.years_experience IS NULL AND NEW.years_of_experience IS NOT NULL THEN
        NEW.years_experience := NEW.years_of_experience::int;
    END IF;
    
    IF NEW.seniority_level IS NULL AND NEW.current_role_title IS NOT NULL THEN
        NEW.seniority_level := NEW.current_role_title;
    END IF;
    
    IF NEW.functions IS NULL AND NEW.seeking_roles IS NOT NULL THEN
        NEW.functions := NEW.seeking_roles;
    END IF;
    
    IF NEW.portfolio_url IS NULL AND NEW.website_url IS NOT NULL THEN
        NEW.portfolio_url := NEW.website_url;
    END IF;
    
    IF NEW.cv_file_path IS NULL AND NEW.cv_file_id IS NOT NULL THEN
        NEW.cv_file_path := NEW.cv_file_id;
    END IF;
    
    IF NEW.admin_private_notes IS NULL AND NEW.internal_notes IS NOT NULL THEN
        NEW.admin_private_notes := NEW.internal_notes;
    END IF;
    
    -- Sync status values
    IF NEW.status = 'submitted' THEN
        NEW.status := 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS sync_talent_columns_trigger ON public.talent_profiles;

-- Create trigger to sync columns
CREATE TRIGGER sync_talent_columns_trigger
    BEFORE INSERT OR UPDATE ON public.talent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_talent_columns();

-- ============================================================================
-- PART 3: MIGRATE EXISTING DATA
-- ============================================================================

-- Migrate years_experience (int) to years_of_experience (text)
UPDATE public.talent_profiles 
SET years_of_experience = years_experience::text
WHERE years_of_experience IS NULL AND years_experience IS NOT NULL;

-- Migrate seniority_level to current_role_title
UPDATE public.talent_profiles 
SET current_role_title = seniority_level
WHERE current_role_title IS NULL AND seniority_level IS NOT NULL;

-- Migrate functions to seeking_roles
UPDATE public.talent_profiles 
SET seeking_roles = functions
WHERE seeking_roles IS NULL AND functions IS NOT NULL;

-- Set role_category from first function
UPDATE public.talent_profiles 
SET role_category = functions[1]
WHERE role_category IS NULL AND functions IS NOT NULL AND array_length(functions, 1) > 0;

-- Migrate portfolio_url to website_url
UPDATE public.talent_profiles 
SET website_url = portfolio_url
WHERE website_url IS NULL AND portfolio_url IS NOT NULL;

-- Migrate cv_file_path to cv_file_id
UPDATE public.talent_profiles 
SET cv_file_id = cv_file_path
WHERE cv_file_id IS NULL AND cv_file_path IS NOT NULL;

-- Migrate admin_private_notes to internal_notes
UPDATE public.talent_profiles 
SET internal_notes = admin_private_notes
WHERE internal_notes IS NULL AND admin_private_notes IS NOT NULL;

-- Update 'submitted' status to 'pending'
UPDATE public.talent_profiles 
SET status = 'pending'
WHERE status = 'submitted';

-- ============================================================================
-- PART 4: UPDATE STATUS CHECK CONSTRAINT
-- ============================================================================

-- Drop existing status constraint
ALTER TABLE public.talent_profiles 
    DROP CONSTRAINT IF EXISTS talent_profiles_status_check;

-- Add new status constraint with 'pending' and 'archived' values
ALTER TABLE public.talent_profiles 
    ADD CONSTRAINT talent_profiles_status_check 
    CHECK (status IN ('draft', 'pending', 'vetted', 'approved', 'rejected', 'archived'));

-- ============================================================================
-- PART 5: UPDATE VIEWS TO USE NEW COLUMN NAMES
-- ============================================================================

-- Update v_pending_talent_reviews view
DROP VIEW IF EXISTS public.v_pending_talent_reviews;
CREATE OR REPLACE VIEW public.v_pending_talent_reviews AS
SELECT tp.id, tp.user_id, p.full_name, p.email, tp.headline, tp.industry,
    tp.current_role_title, tp.years_of_experience, tp.submitted_at, tp.cv_file_id,
    tp.linkedin_url, tp.status
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.status = 'pending' 
ORDER BY tp.submitted_at ASC;

-- Update v_public_talent_profiles view
DROP VIEW IF EXISTS public.v_public_talent_profiles;
CREATE OR REPLACE VIEW public.v_public_talent_profiles AS
SELECT tp.id, tp.headline, tp.bio, tp.years_of_experience, tp.industry,
    tp.current_role_title, tp.seeking_roles, tp.role_category, tp.skills, tp.languages,
    tp.linkedin_url, tp.website_url, p.full_name, tp.approved_at
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.status = 'approved';

-- ============================================================================
-- PART 6: GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.v_pending_talent_reviews TO authenticated;
GRANT SELECT ON public.v_public_talent_profiles TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if migration was successful
SELECT 
    COUNT(*) as total_profiles,
    COUNT(years_of_experience) as with_new_years_exp,
    COUNT(current_role_title) as with_new_role_title,
    COUNT(role_category) as with_new_role_category
FROM public.talent_profiles;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- NOTE: After all code is updated to use new columns, we can drop old columns:
--   ALTER TABLE public.talent_profiles 
--       DROP COLUMN years_experience,
--       DROP COLUMN seniority_level,
--       DROP COLUMN functions,
--       DROP COLUMN portfolio_url,
--       DROP COLUMN cv_file_path,
--       DROP COLUMN admin_private_notes;
-- ============================================================================
