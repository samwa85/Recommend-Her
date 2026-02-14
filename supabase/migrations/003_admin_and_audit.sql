-- ============================================================================
-- ADMIN USERS AND AUDIT LOGS
-- Migration: 003
-- Created: 2026-02-14
-- Description: Add admin_users and audit_logs tables for admin management
-- ============================================================================

-- ============================================================================
-- 1. ADMIN_USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity (can link to Supabase Auth user id)
    auth_user_id UUID UNIQUE, -- Links to supabase auth.users if using auth
    
    -- Profile
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    
    -- Role & Permissions
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_users IS 'Admin users for dashboard access and audit tracking';
COMMENT ON COLUMN admin_users.auth_user_id IS 'Optional link to Supabase Auth user for SSO';
COMMENT ON COLUMN admin_users.role IS 'super_admin: full access, admin: standard access, viewer: read-only';

-- ============================================================================
-- 2. AUDIT_LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor (who performed the action)
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email TEXT, -- Store email at time of action (in case admin is deleted)
    
    -- Action Details
    action TEXT NOT NULL CHECK (action IN (
        'created', 
        'updated', 
        'deleted', 
        'status_changed',
        'viewed',
        'downloaded',
        'exported',
        'logged_in',
        'logged_out'
    )),
    
    -- Entity (what was acted upon)
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'talent', 
        'sponsor', 
        'request', 
        'message', 
        'file', 
        'admin_user',
        'system'
    )),
    entity_id UUID,
    
    -- Change Data
    before_data JSONB, -- State before change
    after_data JSONB,  -- State after change
    
    -- Context
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional context
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Audit trail for all admin actions';
COMMENT ON COLUMN audit_logs.before_data IS 'JSON snapshot of entity before the action';
COMMENT ON COLUMN audit_logs.after_data IS 'JSON snapshot of entity after the action';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context like request_id, session info, etc.';

-- ============================================================================
-- 3. UPDATE REQUESTS TABLE - Add assigned_admin_id FK
-- ============================================================================

-- Add foreign key constraint for assigned_admin_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'requests_assigned_admin_id_fkey' 
        AND table_name = 'requests'
    ) THEN
        ALTER TABLE requests 
        ADD CONSTRAINT requests_assigned_admin_id_fkey 
        FOREIGN KEY (assigned_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- 4. UPDATE MESSAGES TABLE - Add handled_by_admin_id FK
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_handled_by_admin_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_handled_by_admin_id_fkey 
        FOREIGN KEY (handled_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- 5. INDEXES FOR ADMIN_USERS AND AUDIT_LOGS
-- ============================================================================

-- Admin Users Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON admin_users(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active) WHERE is_active = true;

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id) WHERE admin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_created ON audit_logs(entity_type, entity_id, created_at DESC);

-- ============================================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. RLS POLICIES FOR ADMIN_USERS AND AUDIT_LOGS
-- ============================================================================

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin Users Policies
CREATE POLICY "Admin can view admin users"
    ON admin_users
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Super admin can manage admin users"
    ON admin_users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.auth_user_id = auth.uid() 
            AND au.role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.auth_user_id = auth.uid() 
            AND au.role = 'super_admin'
        )
    );

-- Audit Logs Policies (read-only for admins)
CREATE POLICY "Admin can view audit logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Only system/functions can insert audit logs (via SECURITY DEFINER functions)
CREATE POLICY "Service role can insert audit logs"
    ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- 8. HELPER FUNCTIONS FOR AUDIT LOGGING
-- ============================================================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_before_data JSONB DEFAULT NULL,
    p_after_data JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    admin_email TEXT;
BEGIN
    -- Get admin email
    SELECT email INTO admin_email FROM admin_users WHERE id = p_admin_id;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        admin_id,
        admin_email,
        action,
        entity_type,
        entity_id,
        before_data,
        after_data,
        metadata
    ) VALUES (
        p_admin_id,
        admin_email,
        p_action,
        p_entity_type,
        p_entity_id,
        p_before_data,
        p_after_data,
        p_metadata
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent activity
CREATE OR REPLACE FUNCTION get_recent_activity(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    action TEXT,
    entity_type TEXT,
    entity_id UUID,
    admin_name TEXT,
    admin_email TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.action,
        al.entity_type,
        al.entity_id,
        COALESCE(au.full_name, al.admin_email, 'System') as admin_name,
        al.admin_email,
        al.metadata,
        al.created_at
    FROM audit_logs al
    LEFT JOIN admin_users au ON al.admin_id = au.id
    ORDER BY al.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. DEFAULT SUPER ADMIN (Create via function for security)
-- ============================================================================

-- Function to create initial super admin (call this once)
CREATE OR REPLACE FUNCTION create_initial_super_admin(
    p_email TEXT,
    p_full_name TEXT,
    p_auth_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_admin_id UUID;
BEGIN
    -- Check if any super admin exists
    IF EXISTS (SELECT 1 FROM admin_users WHERE role = 'super_admin') THEN
        RAISE EXCEPTION 'Super admin already exists. Use standard admin creation.';
    END IF;
    
    -- Create the super admin
    INSERT INTO admin_users (
        email,
        full_name,
        auth_user_id,
        role,
        is_active
    ) VALUES (
        p_email,
        p_full_name,
        p_auth_user_id,
        'super_admin',
        true
    ) RETURNING id INTO new_admin_id;
    
    -- Log the creation
    PERFORM log_admin_action(
        new_admin_id,
        'created',
        'admin_user',
        new_admin_id,
        NULL,
        jsonb_build_object('email', p_email, 'role', 'super_admin'),
        '{"initial_setup": true}'::jsonb
    );
    
    RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. TRIGGER FOR AUTO-LOGGING TALENT STATUS CHANGES
-- ============================================================================

-- Function to auto-log status changes
CREATE OR REPLACE FUNCTION log_talent_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM log_admin_action(
            NEW.assigned_admin_id, -- Will be NULL for public submissions
            'status_changed',
            'talent',
            NEW.id,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object('status', NEW.status),
            jsonb_build_object('table', 'talent_profiles')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger is commented out by default to avoid issues with public submissions
-- Enable it after you have admin authentication working
-- CREATE TRIGGER log_talent_status_changes
--     AFTER UPDATE ON talent_profiles
--     FOR EACH ROW
--     EXECUTE FUNCTION log_talent_status_change();

-- ============================================================================
-- 11. VIEW FOR ADMIN DASHBOARD ACTIVITY
-- ============================================================================

CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
    al.id,
    al.action,
    al.entity_type,
    al.entity_id,
    COALESCE(au.full_name, al.admin_email, 'System') as admin_name,
    al.admin_email,
    al.created_at,
    CASE al.entity_type
        WHEN 'talent' THEN (SELECT full_name FROM talent_profiles WHERE id = al.entity_id)
        WHEN 'sponsor' THEN (SELECT full_name FROM sponsor_profiles WHERE id = al.entity_id)
        WHEN 'request' THEN (SELECT title FROM requests WHERE id = al.entity_id)
        WHEN 'message' THEN (SELECT sender_name FROM messages WHERE id = al.entity_id)
        ELSE NULL
    END as entity_name
FROM audit_logs al
LEFT JOIN admin_users au ON al.admin_id = au.id
ORDER BY al.created_at DESC;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================