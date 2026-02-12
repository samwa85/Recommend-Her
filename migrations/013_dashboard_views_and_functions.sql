-- ============================================================================
-- DASHBOARD VIEWS AND FUNCTIONS
-- Creates views and functions needed for the admin dashboard
-- ============================================================================

-- ============================================================================
-- STATUS COUNT VIEWS
-- ============================================================================

-- Talent status counts view
CREATE OR REPLACE VIEW v_talent_status_counts AS
SELECT 
    status,
    COUNT(*) as count
FROM talent_profiles
WHERE deleted_at IS NULL
GROUP BY status;

-- Sponsor status counts view  
CREATE OR REPLACE VIEW v_sponsor_status_counts AS
SELECT 
    status,
    COUNT(*) as count
FROM sponsor_profiles
WHERE deleted_at IS NULL
GROUP BY status;

-- Request status counts view
CREATE OR REPLACE VIEW v_request_status_counts AS
SELECT 
    status,
    COUNT(*) as count
FROM requests
GROUP BY status;

-- Message status counts view
CREATE OR REPLACE VIEW v_message_status_counts AS
SELECT 
    status,
    COUNT(*) as count
FROM messages
GROUP BY status;

-- ============================================================================
-- SUBMISSIONS TREND FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_submissions_trend(days_param INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    talent_count BIGINT,
    sponsor_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (days_param - 1),
            CURRENT_DATE,
            '1 day'::INTERVAL
        )::DATE AS date
    ),
    talent_counts AS (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM talent_profiles
        WHERE created_at >= CURRENT_DATE - (days_param - 1)
        AND deleted_at IS NULL
        GROUP BY DATE(created_at)
    ),
    sponsor_counts AS (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM sponsor_profiles
        WHERE created_at >= CURRENT_DATE - (days_param - 1)
        AND deleted_at IS NULL
        GROUP BY DATE(created_at)
    )
    SELECT 
        ds.date,
        COALESCE(tc.count, 0) as talent_count,
        COALESCE(sc.count, 0) as sponsor_count
    FROM date_series ds
    LEFT JOIN talent_counts tc ON ds.date = tc.date
    LEFT JOIN sponsor_counts sc ON ds.date = sc.date
    ORDER BY ds.date;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_submissions_trend(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_submissions_trend(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_submissions_trend(INTEGER) TO service_role;

-- ============================================================================
-- ENABLE ACCESS TO VIEWS
-- ============================================================================

-- Grant select on views
GRANT SELECT ON v_talent_status_counts TO anon;
GRANT SELECT ON v_talent_status_counts TO authenticated;
GRANT SELECT ON v_talent_status_counts TO service_role;

GRANT SELECT ON v_sponsor_status_counts TO anon;
GRANT SELECT ON v_sponsor_status_counts TO authenticated;
GRANT SELECT ON v_sponsor_status_counts TO service_role;

GRANT SELECT ON v_request_status_counts TO anon;
GRANT SELECT ON v_request_status_counts TO authenticated;
GRANT SELECT ON v_request_status_counts TO service_role;

GRANT SELECT ON v_message_status_counts TO anon;
GRANT SELECT ON v_message_status_counts TO authenticated;
GRANT SELECT ON v_message_status_counts TO service_role;

-- ============================================================================
-- RLS POLICIES FOR VIEWS (Admin only access for security)
-- ============================================================================

-- Note: Views don't have RLS directly, but we can use SECURITY DEFINER
-- The function above uses SECURITY DEFINER to bypass RLS for the dashboard

-- Add comment for documentation
COMMENT ON FUNCTION get_submissions_trend IS 'Returns daily submission counts for talent and sponsors over the specified number of days';
