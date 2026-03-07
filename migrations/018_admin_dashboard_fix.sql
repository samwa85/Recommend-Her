-- ============================================================================
-- ADMIN DASHBOARD FIX - Create missing tables and functions
-- ============================================================================

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

CREATE POLICY "Allow authenticated full access" 
    ON public.audit_logs FOR ALL TO authenticated 
    USING (true) WITH CHECK (true);

GRANT ALL ON public.audit_logs TO authenticated;

-- ============================================================================
-- ACTIVITY LOGS TABLE (simplified version)
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

CREATE POLICY "Allow authenticated full access" 
    ON public.activity_logs FOR ALL TO authenticated 
    USING (true) WITH CHECK (true);

GRANT ALL ON public.activity_logs TO authenticated;

-- ============================================================================
-- TREND FUNCTIONS
-- ============================================================================

-- Function to get submissions trend
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
        )::date AS date
    ),
    talent_counts AS (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM talent_profiles
        WHERE created_at >= CURRENT_DATE - (days - 1)
        GROUP BY DATE(created_at)
    ),
    sponsor_counts AS (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM sponsor_profiles
        WHERE created_at >= CURRENT_DATE - (days - 1)
        GROUP BY DATE(created_at)
    )
    SELECT 
        d.date,
        COALESCE(t.count, 0) as talent_count,
        COALESCE(s.count, 0) as sponsor_count,
        COALESCE(t.count, 0) + COALESCE(s.count, 0) as total_count
    FROM date_series d
    LEFT JOIN talent_counts t ON d.date = t.date
    LEFT JOIN sponsor_counts s ON d.date = s.date
    ORDER BY d.date ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_submissions_trend(INTEGER) TO authenticated;

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get dashboard metrics
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
        (SELECT COUNT(*) FROM talent_profiles) as total_talent,
        (SELECT COUNT(*) FROM sponsor_profiles) as total_sponsors,
        (SELECT COUNT(*) FROM talent_profiles WHERE status = 'pending') as pending_talent,
        (SELECT COUNT(*) FROM sponsor_profiles WHERE status = 'pending') as pending_sponsors,
        (SELECT COUNT(*) FROM contact_submissions) as total_messages,
        (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new') as unread_messages,
        (SELECT COUNT(*) FROM talent_profiles WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week_talent,
        (SELECT COUNT(*) FROM sponsor_profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month_sponsors;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics() TO authenticated;

-- ============================================================================
-- SEED ACTIVITY LOGS
-- ============================================================================

INSERT INTO public.activity_logs (user_name, action, entity_type, entity_name, details)
VALUES 
    ('System', 'setup', 'database', 'testimonials', '{"message": "Testimonials table created"}'::jsonb),
    ('System', 'setup', 'database', 'admin_dashboard', '{"message": "Admin dashboard functions created"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT 'Admin dashboard setup complete' as status;
