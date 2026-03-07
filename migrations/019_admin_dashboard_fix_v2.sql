-- ============================================================================
-- ADMIN DASHBOARD FIX V2 - Drop and recreate functions with correct types
-- ============================================================================

-- ============================================================================
-- DROP EXISTING FUNCTIONS FIRST (to avoid return type conflicts)
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_submissions_trend(INTEGER);
DROP FUNCTION IF EXISTS public.get_dashboard_metrics();

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access" ON public.audit_logs;
CREATE POLICY "Allow full access" 
    ON public.audit_logs FOR ALL TO authenticated 
    USING (true) WITH CHECK (true);

GRANT ALL ON public.audit_logs TO authenticated;

-- ============================================================================
-- ACTIVITY LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    entity_name TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access" ON public.activity_logs;
CREATE POLICY "Allow full access" 
    ON public.activity_logs FOR ALL TO authenticated 
    USING (true) WITH CHECK (true);

GRANT ALL ON public.activity_logs TO authenticated;

-- ============================================================================
-- TREND FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_submissions_trend(p_days INTEGER DEFAULT 30)
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
            CURRENT_DATE - (p_days - 1),
            CURRENT_DATE,
            '1 day'::interval
        )::date AS dt
    ),
    talent_counts AS (
        SELECT 
            DATE(created_at) as dt,
            COUNT(*) as cnt
        FROM talent_profiles
        WHERE created_at >= CURRENT_DATE - (p_days - 1)
        GROUP BY DATE(created_at)
    ),
    sponsor_counts AS (
        SELECT 
            DATE(created_at) as dt,
            COUNT(*) as cnt
        FROM sponsor_profiles
        WHERE created_at >= CURRENT_DATE - (p_days - 1)
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
-- DASHBOARD METRICS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS TABLE (
    total_talent BIGINT,
    total_sponsors BIGINT,
    pending_talent BIGINT,
    pending_sponsors BIGINT,
    total_messages BIGINT,
    unread_messages BIGINT,
    new_this_week_talent BIGINT,
    new_this_month_sponsors BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM talent_profiles),
        (SELECT COUNT(*) FROM sponsor_profiles),
        (SELECT COUNT(*) FROM talent_profiles WHERE status = 'pending'),
        (SELECT COUNT(*) FROM sponsor_profiles WHERE status = 'pending'),
        (SELECT COUNT(*) FROM contact_submissions),
        (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new'),
        (SELECT COUNT(*) FROM talent_profiles WHERE created_at >= NOW() - INTERVAL '7 days'),
        (SELECT COUNT(*) FROM sponsor_profiles WHERE created_at >= NOW() - INTERVAL '30 days');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics() TO authenticated;

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT 'Admin dashboard fix v2 complete' as status;
