-- ============================================================================
-- FIX RLS RECURSION 
-- The previous EXISTS (SELECT 1 FROM profiles ...) check within a profiles 
-- policy was causing infinite recursion, resulting in zero rows returned.
-- ============================================================================

-- 1. PROFILES TABLE: Use SECURITY DEFINER is_admin() to break recursion
DROP POLICY IF EXISTS "Profiles: Admin read all" ON public.profiles;
CREATE POLICY "Profiles: Admin read all" ON public.profiles 
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Profiles: Admin full access" ON public.profiles;
CREATE POLICY "Profiles: Admin full access" ON public.profiles 
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 2. TALENT_PROFILES TABLE: Consistent naming and recursion fix
DROP POLICY IF EXISTS "Talent: Admin read all" ON public.talent_profiles;
DROP POLICY IF EXISTS "Talent: Admin full access" ON public.talent_profiles;

CREATE POLICY "Talent: Admin select" ON public.talent_profiles 
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Talent: Admin manage" ON public.talent_profiles 
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 3. SPONSOR_PROFILES TABLE: Consistent naming and recursion fix
DROP POLICY IF EXISTS "Sponsor: Admin read all" ON public.sponsor_profiles;
DROP POLICY IF EXISTS "Sponsor: Admin full access" ON public.sponsor_profiles;

CREATE POLICY "Sponsor: Admin select" ON public.sponsor_profiles 
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Sponsor: Admin manage" ON public.sponsor_profiles 
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 4. ENSURE SERVICE ROLE HAS FULL ACCESS
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
