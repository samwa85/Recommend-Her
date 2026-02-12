-- ============================================================================
-- FIX DATA FLOW ISSUES
-- 1. Fix views to use LEFT JOIN for anonymous profiles
-- 2. Add diagnostic function for status counts
-- 3. Ensure admin can access all data including anonymous
-- ============================================================================

-- ============================================================================
-- PART 1: FIX ADMIN VIEWS TO USE LEFT JOIN
-- Anonymous submissions may not have matching profiles records
-- ============================================================================

-- Fix pending talent reviews view
DROP VIEW IF EXISTS public.v_pending_talent_reviews;
CREATE OR REPLACE VIEW public.v_pending_talent_reviews AS
SELECT tp.id, tp.user_id, p.full_name, p.email, tp.headline, tp.industry,
    tp.seniority_level, tp.years_experience, tp.submitted_at, tp.cv_file_path,
    tp.linkedin_url, tp.status
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.status = 'submitted' 
ORDER BY tp.submitted_at ASC;

-- Fix public talent profiles view
DROP VIEW IF EXISTS public.v_public_talent_profiles;
CREATE OR REPLACE VIEW public.v_public_talent_profiles AS
SELECT tp.id, tp.headline, tp.bio, tp.years_experience, tp.industry,
    tp.seniority_level, tp.functions, tp.skills, tp.languages,
    tp.linkedin_url, tp.portfolio_url, p.full_name, tp.approved_at
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.status = 'approved';

-- Fix recommendation requests detail view
DROP VIEW IF EXISTS public.v_recommendation_requests_detail;
CREATE OR REPLACE VIEW public.v_recommendation_requests_detail AS
SELECT rr.id, rr.status, rr.message, rr.created_at, rr.updated_at,
    sp.id as sponsor_id, sp_sponsor.full_name as sponsor_name, sp.org_name as sponsor_org,
    tp.id as talent_id, tp_talent.full_name as talent_name, tp.headline as talent_headline
FROM public.recommendation_requests rr
JOIN public.sponsor_profiles sp ON rr.sponsor_id = sp.id
LEFT JOIN public.profiles sp_sponsor ON sp.user_id = sp_sponsor.id
JOIN public.talent_profiles tp ON rr.talent_id = tp.id
LEFT JOIN public.profiles tp_talent ON tp.user_id = tp_talent.id;

-- ============================================================================
-- PART 2: ADD DIAGNOSTIC FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_talent_status_counts()
RETURNS TABLE (status text, count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT tp.status::text, COUNT(*)::bigint
    FROM public.talent_profiles tp
    GROUP BY tp.status
    ORDER BY tp.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users (admin will use this)
GRANT EXECUTE ON FUNCTION public.get_talent_status_counts() TO authenticated;

-- ============================================================================
-- PART 3: ENSURE ADMIN POLICIES ARE CORRECT
-- Replace is_admin check with EXISTS for better performance
-- ============================================================================

-- Drop and recreate admin policies for talent_profiles
DROP POLICY IF EXISTS "Talent: Admin full access" ON public.talent_profiles;
DROP POLICY IF EXISTS "Talent: Admin read all" ON public.talent_profiles;
DROP POLICY IF EXISTS "Talent: Admin read all via role" ON public.talent_profiles;

-- Use EXISTS pattern for better performance
CREATE POLICY "Talent: Admin read all" ON public.talent_profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Keep the ALL policy for admin modifications
CREATE POLICY "Talent: Admin full access" ON public.talent_profiles FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================================
-- PART 4: GRANT PERMISSIONS
-- ============================================================================

-- Grant select on new views
GRANT SELECT ON public.v_pending_talent_reviews TO authenticated;
GRANT SELECT ON public.v_public_talent_profiles TO authenticated;
GRANT SELECT ON public.v_recommendation_requests_detail TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (run manually to verify)
-- ============================================================================

-- Check talent counts by status
-- SELECT * FROM public.get_talent_status_counts();

-- Check pending reviews view includes all
-- SELECT COUNT(*) FROM public.v_pending_talent_reviews;

-- Check approved talent view
-- SELECT COUNT(*) FROM public.v_public_talent_profiles;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
