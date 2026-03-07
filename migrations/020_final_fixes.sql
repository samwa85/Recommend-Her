-- ============================================================================
-- FINAL FIXES - Fix parameter names and column references
-- ============================================================================

-- ============================================================================
-- FIX 1: Drop and recreate get_submissions_trend with 'days' parameter name
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_submissions_trend(INTEGER);

CREATE OR REPLACE FUNCTION public.get_submissions_trend(days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    talent_count BIGINT,
    sponsor_count BIGINT,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (days - 1),
            CURRENT_DATE,
            '1 day'::interval
        )::date AS dt
    ),
    talent_counts AS (
        SELECT 
            DATE(created_at) as dt,
            COUNT(*) as cnt
        FROM talent_profiles
        WHERE created_at >= CURRENT_DATE - (days - 1)
        GROUP BY DATE(created_at)
    ),
    sponsor_counts AS (
        SELECT 
            DATE(created_at) as dt,
            COUNT(*) as cnt
        FROM sponsor_profiles
        WHERE created_at >= CURRENT_DATE - (days - 1)
        GROUP BY DATE(created_at)
    )
    SELECT 
        ds.dt as date,
        COALESCE(tc.cnt, 0) as talent_count,
        COALESCE(sc.cnt, 0) as sponsor_count,
        COALESCE(tc.cnt, 0) + COALESCE(sc.cnt, 0) as total_count
    FROM date_series ds
    LEFT JOIN talent_counts tc ON ds.dt = tc.dt
    LEFT JOIN sponsor_counts sc ON ds.dt = sc.dt
    ORDER BY ds.dt ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_submissions_trend(INTEGER) TO authenticated;

-- ============================================================================
-- FIX 2: Add company_name column to sponsor_profiles (or create a view)
-- ============================================================================

-- Option A: Add company_name column if it doesn't exist
ALTER TABLE public.sponsor_profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT 
GENERATED ALWAYS AS (COALESCE(organization, full_name)) STORED;

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT 'Final fixes applied' as status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'sponsor_profiles' AND table_schema = 'public';
