-- ============================================================================
-- RECOMMENDHER BACKEND HARDENING MIGRATION
-- Comprehensive: Schema, RLS, Functions, Triggers, Indexes, Audit Logging
-- ============================================================================

-- ============================================================================
-- PART 1: HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_uuid;
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to write audit log (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.write_audit_log(
    p_actor_user_id uuid,
    p_action text,
    p_entity_type text,
    p_entity_id uuid,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
    log_id uuid;
BEGIN
    INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
    VALUES (p_actor_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
    RETURNING id INTO log_id;
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 2: CORE TABLES SCHEMA
-- ============================================================================

-- Drop old table if exists (migration from old schema)
DROP TABLE IF EXISTS public.talent_profiles CASCADE;

-- 1. PROFILES TABLE (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('talent', 'sponsor', 'admin')) DEFAULT 'talent',
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    country text,
    location text,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- 2. TALENT_PROFILES TABLE (enhanced)
CREATE TABLE IF NOT EXISTS public.talent_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline text,
    bio text,
    years_experience int CHECK (years_experience >= 0),
    industry text,
    seniority_level text,
    functions text[],
    skills text[],
    languages text[],
    linkedin_url text,
    portfolio_url text,
    cv_file_path text,
    status text NOT NULL CHECK (status IN ('draft', 'submitted', 'vetted', 'approved', 'rejected')) DEFAULT 'draft',
    visibility text NOT NULL CHECK (visibility IN ('private', 'vetted_only')) DEFAULT 'private',
    admin_private_notes text,
    submitted_at timestamptz,
    vetted_at timestamptz,
    approved_at timestamptz,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- 3. SPONSOR_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.sponsor_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    org_name text,
    title text,
    industry text,
    sponsor_type text CHECK (sponsor_type IN ('mentor', 'connector', 'hiring', 'board', 'investor')),
    commitment_note text,
    verified boolean DEFAULT FALSE,
    status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- 4. VETTING_REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.vetting_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    talent_id uuid NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
    admin_id uuid REFERENCES public.profiles(id),
    decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs_changes')),
    feedback_to_talent text,
    internal_notes text,
    created_at timestamptz DEFAULT NOW()
);

-- 5. RECOMMENDATION_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.recommendation_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id uuid NOT NULL REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE,
    talent_id uuid NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
    message text,
    status text NOT NULL CHECK (status IN ('requested', 'accepted', 'declined', 'intro_sent', 'closed')) DEFAULT 'requested',
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    UNIQUE(sponsor_id, talent_id)
);

-- 6. OPPORTUNITY_OUTCOMES TABLE
CREATE TABLE IF NOT EXISTS public.opportunity_outcomes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid UNIQUE NOT NULL REFERENCES public.recommendation_requests(id) ON DELETE CASCADE,
    outcome text NOT NULL CHECK (outcome IN ('shortlisted', 'interview', 'offer', 'hired', 'no_fit')),
    notes text,
    outcome_date date,
    created_at timestamptz DEFAULT NOW()
);

-- 7. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid REFERENCES public.profiles(id),
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- PART 3: TRIGGERS FOR updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_talent_profiles_updated_at ON public.talent_profiles;
CREATE TRIGGER set_talent_profiles_updated_at
    BEFORE UPDATE ON public.talent_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_sponsor_profiles_updated_at ON public.sponsor_profiles;
CREATE TRIGGER set_sponsor_profiles_updated_at
    BEFORE UPDATE ON public.sponsor_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_recommendation_requests_updated_at ON public.recommendation_requests;
CREATE TRIGGER set_recommendation_requests_updated_at
    BEFORE UPDATE ON public.recommendation_requests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- PART 4: SECURITY TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_status_change_permissions()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF NEW.status IN ('approved', 'rejected') OR OLD.status IN ('approved', 'rejected') THEN
            IF NOT public.is_admin(auth.uid()) THEN
                RAISE EXCEPTION 'Only admins can approve or reject profiles';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_talent_status_changes ON public.talent_profiles;
CREATE TRIGGER enforce_talent_status_changes
    BEFORE UPDATE ON public.talent_profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_status_change_permissions();

DROP TRIGGER IF EXISTS enforce_sponsor_status_changes ON public.sponsor_profiles;
CREATE TRIGGER enforce_sponsor_status_changes
    BEFORE UPDATE ON public.sponsor_profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_status_change_permissions();

-- ============================================================================
-- PART 5: ENABLE RLS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetting_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: RLS POLICIES
-- ============================================================================

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles: Users can read own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Users can update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Insert on signup" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Admin full access" ON public.profiles;

CREATE POLICY "Profiles: Users can read own" ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Profiles: Users can update own" ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Profiles: Insert on signup" ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles: Admin full access" ON public.profiles FOR ALL
    USING (public.is_admin(auth.uid()));

-- TALENT_PROFILES POLICIES
DROP POLICY IF EXISTS "Talent: Read own" ON public.talent_profiles;
DROP POLICY IF EXISTS "Talent: Update own" ON public.talent_profiles;
DROP POLICY IF EXISTS "Talent: Insert own" ON public.talent_profiles;
DROP POLICY IF EXISTS "Talent: Sponsors read approved only" ON public.talent_profiles;
DROP POLICY IF EXISTS "Talent: Admin full access" ON public.talent_profiles;

CREATE POLICY "Talent: Read own" ON public.talent_profiles FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Talent: Update own" ON public.talent_profiles FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Talent: Insert own" ON public.talent_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Talent: Sponsors read approved only" ON public.talent_profiles FOR SELECT
    USING (status = 'approved' AND EXISTS (
        SELECT 1 FROM public.sponsor_profiles sp
        WHERE sp.user_id = auth.uid() AND sp.status = 'approved'
    ));

CREATE POLICY "Talent: Admin full access" ON public.talent_profiles FOR ALL
    USING (public.is_admin(auth.uid()));

-- SPONSOR_PROFILES POLICIES
DROP POLICY IF EXISTS "Sponsor: Read own" ON public.sponsor_profiles;
DROP POLICY IF EXISTS "Sponsor: Update own" ON public.sponsor_profiles;
DROP POLICY IF EXISTS "Sponsor: Insert own" ON public.sponsor_profiles;
DROP POLICY IF EXISTS "Sponsor: Admin full access" ON public.sponsor_profiles;

CREATE POLICY "Sponsor: Read own" ON public.sponsor_profiles FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Sponsor: Update own" ON public.sponsor_profiles FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Sponsor: Insert own" ON public.sponsor_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sponsor: Admin full access" ON public.sponsor_profiles FOR ALL
    USING (public.is_admin(auth.uid()));

-- VETTING_REVIEWS POLICIES
DROP POLICY IF EXISTS "Vetting: Admin only" ON public.vetting_reviews;
CREATE POLICY "Vetting: Admin only" ON public.vetting_reviews FOR ALL
    USING (public.is_admin(auth.uid()));

-- RECOMMENDATION_REQUESTS POLICIES
DROP POLICY IF EXISTS "Requests: Sponsor read own" ON public.recommendation_requests;
DROP POLICY IF EXISTS "Requests: Talent read own" ON public.recommendation_requests;
DROP POLICY IF EXISTS "Requests: Sponsor create when approved" ON public.recommendation_requests;
DROP POLICY IF EXISTS "Requests: Admin full access" ON public.recommendation_requests;

CREATE POLICY "Requests: Sponsor read own" ON public.recommendation_requests FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.sponsor_profiles sp
        WHERE sp.id = sponsor_id AND sp.user_id = auth.uid()
    ) OR public.is_admin(auth.uid()));

CREATE POLICY "Requests: Talent read own" ON public.recommendation_requests FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.talent_profiles tp
        WHERE tp.id = talent_id AND tp.user_id = auth.uid()
    ) OR public.is_admin(auth.uid()));

CREATE POLICY "Requests: Sponsor create when approved" ON public.recommendation_requests FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.sponsor_profiles sp
        WHERE sp.user_id = auth.uid() AND sp.status = 'approved'
    ) AND EXISTS (
        SELECT 1 FROM public.talent_profiles tp
        WHERE tp.id = talent_id AND tp.status = 'approved'
    ));

CREATE POLICY "Requests: Admin full access" ON public.recommendation_requests FOR ALL
    USING (public.is_admin(auth.uid()));

-- OPPORTUNITY_OUTCOMES POLICIES
DROP POLICY IF EXISTS "Outcomes: Sponsor read own" ON public.opportunity_outcomes;
DROP POLICY IF EXISTS "Outcomes: Admin full access" ON public.opportunity_outcomes;

CREATE POLICY "Outcomes: Sponsor read own" ON public.opportunity_outcomes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.recommendation_requests rr
        JOIN public.sponsor_profiles sp ON rr.sponsor_id = sp.id
        WHERE rr.id = request_id AND sp.user_id = auth.uid()
    ) OR public.is_admin(auth.uid()));

CREATE POLICY "Outcomes: Admin full access" ON public.opportunity_outcomes FOR ALL
    USING (public.is_admin(auth.uid()));

-- AUDIT_LOGS POLICIES
DROP POLICY IF EXISTS "Audit: Admin read only" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit: Insert via function" ON public.audit_logs;

CREATE POLICY "Audit: Admin read only" ON public.audit_logs FOR SELECT
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Audit: Insert via function" ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- PART 7: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON public.talent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_status ON public.talent_profiles(status);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_industry ON public.talent_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_seniority ON public.talent_profiles(seniority_level);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_created_at ON public.talent_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_skills_gin ON public.talent_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_functions_gin ON public.talent_profiles USING GIN(functions);

CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_user_id ON public.sponsor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_status ON public.sponsor_profiles(status);

CREATE INDEX IF NOT EXISTS idx_vetting_reviews_talent_id ON public.vetting_reviews(talent_id);
CREATE INDEX IF NOT EXISTS idx_vetting_reviews_admin_id ON public.vetting_reviews(admin_id);

CREATE INDEX IF NOT EXISTS idx_requests_sponsor_id ON public.recommendation_requests(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_requests_talent_id ON public.recommendation_requests(talent_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.recommendation_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.recommendation_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================================================
-- PART 8: STORED PROCEDURES (RPC FUNCTIONS)
-- ============================================================================

-- 1. SUBMIT_TALENT_PROFILE
CREATE OR REPLACE FUNCTION public.submit_talent_profile(
    p_user_id uuid,
    p_headline text,
    p_bio text,
    p_years_experience int,
    p_industry text,
    p_seniority_level text,
    p_functions text[],
    p_skills text[],
    p_languages text[],
    p_linkedin_url text,
    p_portfolio_url text DEFAULT NULL,
    p_cv_file_path text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    talent_id uuid;
BEGIN
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Can only submit own profile';
    END IF;

    INSERT INTO public.talent_profiles (
        user_id, headline, bio, years_experience, industry, seniority_level,
        functions, skills, languages, linkedin_url, portfolio_url, cv_file_path,
        status, submitted_at
    ) VALUES (
        p_user_id, p_headline, p_bio, p_years_experience, p_industry, p_seniority_level,
        p_functions, p_skills, p_languages, p_linkedin_url, p_portfolio_url, p_cv_file_path,
        'submitted', NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        headline = EXCLUDED.headline, bio = EXCLUDED.bio,
        years_experience = EXCLUDED.years_experience, industry = EXCLUDED.industry,
        seniority_level = EXCLUDED.seniority_level, functions = EXCLUDED.functions,
        skills = EXCLUDED.skills, languages = EXCLUDED.languages,
        linkedin_url = EXCLUDED.linkedin_url, portfolio_url = EXCLUDED.portfolio_url,
        cv_file_path = EXCLUDED.cv_file_path, status = 'submitted', submitted_at = NOW()
    RETURNING id INTO talent_id;

    PERFORM public.write_audit_log(auth.uid(), 'TALENT_SUBMIT', 'talent_profile', talent_id,
        jsonb_build_object('status', 'submitted'));

    RETURN talent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ADMIN_REVIEW_TALENT
CREATE OR REPLACE FUNCTION public.admin_review_talent(
    p_talent_id uuid,
    p_decision text,
    p_feedback_to_talent text DEFAULT NULL,
    p_internal_notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_admin_id uuid;
    v_new_status text;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admins can review talent';
    END IF;

    v_admin_id := auth.uid();
    v_new_status := CASE p_decision WHEN 'approved' THEN 'approved' WHEN 'rejected' THEN 'rejected' ELSE 'submitted' END;

    UPDATE public.talent_profiles SET
        status = v_new_status,
        vetted_at = CASE WHEN p_decision IN ('approved', 'rejected') THEN NOW() ELSE vetted_at END,
        approved_at = CASE WHEN p_decision = 'approved' THEN NOW() ELSE approved_at END
    WHERE id = p_talent_id;

    INSERT INTO public.vetting_reviews (talent_id, admin_id, decision, feedback_to_talent, internal_notes)
    VALUES (p_talent_id, v_admin_id, p_decision, p_feedback_to_talent, p_internal_notes);

    PERFORM public.write_audit_log(v_admin_id, 'TALENT_REVIEW_' || UPPER(p_decision),
        'talent_profile', p_talent_id, jsonb_build_object('decision', p_decision));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ADMIN_REVIEW_SPONSOR
CREATE OR REPLACE FUNCTION public.admin_review_sponsor(
    p_sponsor_id uuid,
    p_decision text
)
RETURNS void AS $$
DECLARE
    v_admin_id uuid;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admins can review sponsors';
    END IF;

    v_admin_id := auth.uid();
    UPDATE public.sponsor_profiles SET status = p_decision WHERE id = p_sponsor_id;

    PERFORM public.write_audit_log(v_admin_id, 'SPONSOR_REVIEW_' || UPPER(p_decision),
        'sponsor_profile', p_sponsor_id, jsonb_build_object('decision', p_decision));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE_RECOMMENDATION_REQUEST
CREATE OR REPLACE FUNCTION public.create_recommendation_request(
    p_talent_id uuid,
    p_message text
)
RETURNS uuid AS $$
DECLARE
    v_sponsor_id uuid;
    v_request_id uuid;
    v_sponsor_status text;
    v_talent_status text;
BEGIN
    SELECT id, status INTO v_sponsor_id, v_sponsor_status
    FROM public.sponsor_profiles WHERE user_id = auth.uid();

    IF v_sponsor_id IS NULL OR v_sponsor_status != 'approved' THEN
        RAISE EXCEPTION 'Only approved sponsors can create requests';
    END IF;

    SELECT status INTO v_talent_status FROM public.talent_profiles WHERE id = p_talent_id;
    IF v_talent_status IS NULL OR v_talent_status != 'approved' THEN
        RAISE EXCEPTION 'Can only request introductions to approved talent';
    END IF;

    INSERT INTO public.recommendation_requests (sponsor_id, talent_id, message, status)
    VALUES (v_sponsor_id, p_talent_id, p_message, 'requested')
    RETURNING id INTO v_request_id;

    PERFORM public.write_audit_log(auth.uid(), 'REQUEST_CREATE', 'recommendation_request', v_request_id,
        jsonb_build_object('sponsor_id', v_sponsor_id, 'talent_id', p_talent_id));

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. UPDATE_REQUEST_STATUS
CREATE OR REPLACE FUNCTION public.update_request_status(
    p_request_id uuid,
    p_new_status text
)
RETURNS void AS $$
DECLARE
    v_current_status text;
    v_sponsor_user_id uuid;
    v_talent_user_id uuid;
BEGIN
    SELECT rr.status, sp.user_id, tp.user_id
    INTO v_current_status, v_sponsor_user_id, v_talent_user_id
    FROM public.recommendation_requests rr
    JOIN public.sponsor_profiles sp ON rr.sponsor_id = sp.id
    JOIN public.talent_profiles tp ON rr.talent_id = tp.id
    WHERE rr.id = p_request_id;

    IF NOT (auth.uid() = v_sponsor_user_id OR auth.uid() = v_talent_user_id OR public.is_admin(auth.uid())) THEN
        RAISE EXCEPTION 'Unauthorized to update this request';
    END IF;

    IF v_current_status = 'requested' AND p_new_status NOT IN ('accepted', 'declined') THEN
        RAISE EXCEPTION 'Invalid status transition from requested';
    ELSIF v_current_status = 'accepted' AND p_new_status NOT IN ('intro_sent', 'declined') THEN
        RAISE EXCEPTION 'Invalid status transition from accepted';
    ELSIF v_current_status = 'intro_sent' AND p_new_status != 'closed' THEN
        RAISE EXCEPTION 'Invalid status transition from intro_sent';
    ELSIF v_current_status IN ('declined', 'closed') THEN
        RAISE EXCEPTION 'Cannot update closed/declined requests';
    END IF;

    UPDATE public.recommendation_requests SET status = p_new_status WHERE id = p_request_id;

    PERFORM public.write_audit_log(auth.uid(), 'REQUEST_STATUS_' || UPPER(p_new_status),
        'recommendation_request', p_request_id,
        jsonb_build_object('from_status', v_current_status, 'to_status', p_new_status));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RECORD_OUTCOME
CREATE OR REPLACE FUNCTION public.record_outcome(
    p_request_id uuid,
    p_outcome text,
    p_notes text DEFAULT NULL,
    p_outcome_date date DEFAULT CURRENT_DATE
)
RETURNS uuid AS $$
DECLARE
    v_outcome_id uuid;
    v_request_status text;
    v_sponsor_user_id uuid;
BEGIN
    SELECT rr.status, sp.user_id
    INTO v_request_status, v_sponsor_user_id
    FROM public.recommendation_requests rr
    JOIN public.sponsor_profiles sp ON rr.sponsor_id = sp.id
    WHERE rr.id = p_request_id;

    IF v_request_status NOT IN ('intro_sent', 'closed') THEN
        RAISE EXCEPTION 'Can only record outcome for completed requests';
    END IF;

    IF NOT (auth.uid() = v_sponsor_user_id OR public.is_admin(auth.uid())) THEN
        RAISE EXCEPTION 'Unauthorized to record outcome';
    END IF;

    INSERT INTO public.opportunity_outcomes (request_id, outcome, notes, outcome_date)
    VALUES (p_request_id, p_outcome, p_notes, p_outcome_date)
    ON CONFLICT (request_id) DO UPDATE SET
        outcome = EXCLUDED.outcome, notes = EXCLUDED.notes, outcome_date = EXCLUDED.outcome_date
    RETURNING id INTO v_outcome_id;

    PERFORM public.write_audit_log(auth.uid(), 'OUTCOME_RECORD', 'opportunity_outcome', v_outcome_id,
        jsonb_build_object('request_id', p_request_id, 'outcome', p_outcome));

    RETURN v_outcome_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 9: ADMIN VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW public.v_pending_talent_reviews AS
SELECT tp.id, tp.user_id, p.full_name, p.email, tp.headline, tp.industry,
    tp.seniority_level, tp.years_experience, tp.submitted_at, tp.cv_file_path,
    tp.linkedin_url, tp.status
FROM public.talent_profiles tp
JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.status = 'submitted' ORDER BY tp.submitted_at ASC;

CREATE OR REPLACE VIEW public.v_pending_sponsor_approvals AS
SELECT sp.id, sp.user_id, p.full_name, p.email, sp.org_name, sp.title,
    sp.industry, sp.sponsor_type, sp.commitment_note, sp.created_at
FROM public.sponsor_profiles sp
JOIN public.profiles p ON sp.user_id = p.id
WHERE sp.status = 'pending' ORDER BY sp.created_at ASC;

CREATE OR REPLACE VIEW public.v_public_talent_profiles AS
SELECT tp.id, tp.headline, tp.bio, tp.years_experience, tp.industry,
    tp.seniority_level, tp.functions, tp.skills, tp.languages,
    tp.linkedin_url, tp.portfolio_url, p.full_name, tp.approved_at
FROM public.talent_profiles tp
JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.status = 'approved';

CREATE OR REPLACE VIEW public.v_admin_dashboard_metrics AS
SELECT
    (SELECT COUNT(*) FROM public.talent_profiles WHERE status = 'submitted') as pending_talent_reviews,
    (SELECT COUNT(*) FROM public.sponsor_profiles WHERE status = 'pending') as pending_sponsor_approvals,
    (SELECT COUNT(*) FROM public.talent_profiles WHERE status = 'approved') as approved_talent,
    (SELECT COUNT(*) FROM public.sponsor_profiles WHERE status = 'approved') as approved_sponsors,
    (SELECT COUNT(*) FROM public.recommendation_requests WHERE status = 'requested') as pending_requests,
    (SELECT COUNT(*) FROM public.talent_profiles WHERE created_at > NOW() - INTERVAL '7 days') as talent_last_7_days,
    (SELECT COUNT(*) FROM public.recommendation_requests WHERE created_at > NOW() - INTERVAL '30 days') as requests_last_30_days;

CREATE OR REPLACE VIEW public.v_recommendation_requests_detail AS
SELECT rr.id, rr.status, rr.message, rr.created_at, rr.updated_at,
    sp.id as sponsor_id, sp_sponsor.full_name as sponsor_name, sp.org_name as sponsor_org,
    tp.id as talent_id, tp_talent.full_name as talent_name, tp.headline as talent_headline
FROM public.recommendation_requests rr
JOIN public.sponsor_profiles sp ON rr.sponsor_id = sp.id
JOIN public.profiles sp_sponsor ON sp.user_id = sp_sponsor.id
JOIN public.talent_profiles tp ON rr.talent_id = tp.id
JOIN public.profiles tp_talent ON tp.user_id = tp_talent.id;

-- ============================================================================
-- PART 10: GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.v_public_talent_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_talent_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_recommendation_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_request_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_outcome TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_talent TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_sponsor TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
