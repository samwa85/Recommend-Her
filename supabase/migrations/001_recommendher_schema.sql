-- ============================================================================
-- RECOMMENDHER SCHEMA - Single Source of Truth
-- Created: 2026-02-12
-- Description: Complete database schema for RecommendHer Admin
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. FILES TABLE (must be created first for FK references)
-- ============================================================================

CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type TEXT NOT NULL CHECK (owner_type IN ('talent', 'sponsor', 'request', 'message')),
    owner_id UUID NOT NULL,
    bucket TEXT NOT NULL DEFAULT 'recommendher-files',
    path TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    public_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE files IS 'File metadata for CVs and attachments stored in Supabase Storage';

-- ============================================================================
-- 2. TALENT_PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS talent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    country TEXT DEFAULT 'Tanzania',
    
    -- Professional Information
    headline TEXT,
    bio TEXT,
    current_company TEXT,
    current_title TEXT,
    years_experience INTEGER,
    industry TEXT,
    role_category TEXT,
    
    -- Skills (using jsonb for flexibility, can query with JSON operators)
    skills JSONB DEFAULT '[]'::jsonb,
    
    -- Links
    linkedin_url TEXT,
    portfolio_url TEXT,
    website_url TEXT,
    
    -- CV File Reference
    cv_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    
    -- Status & Admin
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    source_page TEXT,
    notes_admin TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE talent_profiles IS 'Talent/Candidate profiles with professional information';
COMMENT ON COLUMN talent_profiles.skills IS 'JSON array of skills, e.g., ["React", "TypeScript", "Node.js"]';

-- ============================================================================
-- 3. SPONSOR_PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    
    -- Organization Information
    organization TEXT,
    job_title TEXT,
    industry TEXT,
    linkedin_url TEXT,
    
    -- Sponsor Classification
    sponsor_type TEXT DEFAULT 'individual' CHECK (sponsor_type IN ('individual', 'company', 'community')),
    commitment_level TEXT,
    
    -- Focus Areas (JSON array for flexibility)
    focus_areas JSONB DEFAULT '[]'::jsonb,
    
    -- Status & Admin
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    notes_admin TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sponsor_profiles IS 'Sponsor/Mentor/Recruiter profiles';

-- ============================================================================
-- 4. REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Request Details
    request_type TEXT NOT NULL CHECK (request_type IN ('recommendation', 'sponsorship_intro', 'talent_match', 'general')),
    title TEXT,
    description TEXT NOT NULL,
    
    -- Relationships
    talent_id UUID REFERENCES talent_profiles(id) ON DELETE SET NULL,
    sponsor_id UUID REFERENCES sponsor_profiles(id) ON DELETE SET NULL,
    
    -- Workflow
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'approved', 'rejected', 'closed')),
    assigned_admin_id UUID, -- nullable, for future admin_users table
    due_date DATE,
    resolution_notes TEXT,
    source_page TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE requests IS 'Recommendation requests and sponsorship introductions';

-- ============================================================================
-- 5. MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Sender Information
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    
    -- Message Content
    subject TEXT,
    message TEXT NOT NULL,
    page_source TEXT,
    
    -- Status & Handling
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived', 'spam')),
    handled_by_admin_id UUID, -- nullable, for future admin_users table
    replied_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE messages IS 'Contact form submissions and inquiries';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Talent Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_talent_profiles_status ON talent_profiles(status);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_created_at ON talent_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_status_created ON talent_profiles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_email ON talent_profiles(email);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_phone ON talent_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_industry ON talent_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_cv_file ON talent_profiles(cv_file_id) WHERE cv_file_id IS NOT NULL;

-- Sponsor Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_status ON sponsor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_created_at ON sponsor_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_status_created ON sponsor_profiles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_email ON sponsor_profiles(email);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_organization ON sponsor_profiles(organization);

-- Requests Indexes
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_status_priority ON requests(status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_talent_id ON requests(talent_id) WHERE talent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_sponsor_id ON requests(sponsor_id) WHERE sponsor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_assigned ON requests(assigned_admin_id) WHERE assigned_admin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_due_date ON requests(due_date) WHERE due_date IS NOT NULL;

-- Messages Indexes
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status_created ON messages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_email ON messages(sender_email);
CREATE INDEX IF NOT EXISTS idx_messages_handled_by ON messages(handled_by_admin_id) WHERE handled_by_admin_id IS NOT NULL;

-- Files Indexes
CREATE INDEX IF NOT EXISTS idx_files_owner ON files(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_owner_primary ON files(owner_type, owner_id, is_primary) WHERE is_primary = true;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_talent_profiles_updated_at
    BEFORE UPDATE ON talent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_profiles_updated_at
    BEFORE UPDATE ON sponsor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Note: messages and files don't have updated_at columns per spec

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Talent status counts for dashboard
CREATE OR REPLACE VIEW v_talent_status_counts AS
SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30_days
FROM talent_profiles
GROUP BY status;

-- Sponsor status counts
CREATE OR REPLACE VIEW v_sponsor_status_counts AS
SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days
FROM sponsor_profiles
GROUP BY status;

-- Request status counts
CREATE OR REPLACE VIEW v_request_status_counts AS
SELECT 
    status,
    priority,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days
FROM requests
GROUP BY status, priority;

-- Message status counts
CREATE OR REPLACE VIEW v_message_status_counts AS
SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as last_24_hours
FROM messages
GROUP BY status;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Note: These policies assume you have an "is_admin()" function or similar
-- For now, we'll use a simple approach: public can INSERT, authenticated can SELECT/UPDATE

-- TALENT_PROFILES POLICIES
-- Public can insert (for signup forms)
CREATE POLICY "Public can insert talent profiles"
    ON talent_profiles
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

-- Public can view approved talent (for public talent pool)
CREATE POLICY "Public can view approved talent"
    ON talent_profiles
    FOR SELECT
    TO PUBLIC
    USING (status = 'approved');

-- Admin full access (using authenticated role as proxy for admin)
CREATE POLICY "Admin full access on talent profiles"
    ON talent_profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- SPONSOR_PROFILES POLICIES
CREATE POLICY "Public can insert sponsor profiles"
    ON sponsor_profiles
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Admin full access on sponsor profiles"
    ON sponsor_profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- REQUESTS POLICIES
CREATE POLICY "Public can insert requests"
    ON requests
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Admin full access on requests"
    ON requests
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- MESSAGES POLICIES
CREATE POLICY "Public can insert messages"
    ON messages
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Admin full access on messages"
    ON messages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- FILES POLICIES
CREATE POLICY "Public can insert files"
    ON files
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Admin full access on files"
    ON files
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS TABLE (
    total_talent BIGINT,
    pending_talent BIGINT,
    approved_talent BIGINT,
    rejected_talent BIGINT,
    total_sponsors BIGINT,
    active_sponsors BIGINT,
    total_requests BIGINT,
    open_requests BIGINT,
    total_messages BIGINT,
    unread_messages BIGINT,
    new_talent_7d BIGINT,
    new_sponsors_7d BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM talent_profiles) as total_talent,
        (SELECT COUNT(*) FROM talent_profiles WHERE status = 'pending') as pending_talent,
        (SELECT COUNT(*) FROM talent_profiles WHERE status = 'approved') as approved_talent,
        (SELECT COUNT(*) FROM talent_profiles WHERE status = 'rejected') as rejected_talent,
        (SELECT COUNT(*) FROM sponsor_profiles) as total_sponsors,
        (SELECT COUNT(*) FROM sponsor_profiles WHERE status = 'active') as active_sponsors,
        (SELECT COUNT(*) FROM requests) as total_requests,
        (SELECT COUNT(*) FROM requests WHERE status IN ('open', 'in_review')) as open_requests,
        (SELECT COUNT(*) FROM messages) as total_messages,
        (SELECT COUNT(*) FROM messages WHERE status = 'unread') as unread_messages,
        (SELECT COUNT(*) FROM talent_profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_talent_7d,
        (SELECT COUNT(*) FROM sponsor_profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_sponsors_7d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get time-series data for charts
CREATE OR REPLACE FUNCTION get_submissions_trend(days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    talent_count BIGINT,
    sponsor_count BIGINT,
    request_count BIGINT,
    message_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (days - 1) * INTERVAL '1 day',
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE as date
    )
    SELECT
        ds.date,
        COALESCE((SELECT COUNT(*) FROM talent_profiles WHERE talent_profiles.created_at::DATE = ds.date), 0) as talent_count,
        COALESCE((SELECT COUNT(*) FROM sponsor_profiles WHERE sponsor_profiles.created_at::DATE = ds.date), 0) as sponsor_count,
        COALESCE((SELECT COUNT(*) FROM requests WHERE requests.created_at::DATE = ds.date), 0) as request_count,
        COALESCE((SELECT COUNT(*) FROM messages WHERE messages.created_at::DATE = ds.date), 0) as message_count
    FROM date_series ds
    ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
