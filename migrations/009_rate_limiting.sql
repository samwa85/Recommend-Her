-- ============================================================================
-- RATE LIMITING FOR FORMS
-- Prevent spam and abuse on anonymous submissions
-- ============================================================================

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address text,
    email text,
    action_type text NOT NULL, -- 'talent_submit', 'sponsor_submit', 'contact_submit'
    created_at timestamptz DEFAULT NOW()
);

-- Index for cleanup and queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(ip_address, action_type, created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_email ON public.rate_limits(email, action_type, created_at);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage
GRANT SELECT, INSERT, DELETE ON public.rate_limits TO service_role;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_ip_address text,
    p_email text,
    p_action_type text,
    p_max_requests int DEFAULT 5,
    p_window_minutes int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count int;
BEGIN
    -- Check by IP address
    SELECT COUNT(*) INTO v_count
    FROM public.rate_limits
    WHERE (ip_address = p_ip_address OR email = p_email)
      AND action_type = p_action_type
      AND created_at > NOW() - (p_window_minutes || ' minutes')::interval;
    
    IF v_count >= p_max_requests THEN
        RETURN false; -- Rate limit exceeded
    END IF;
    
    -- Record this attempt
    INSERT INTO public.rate_limits (ip_address, email, action_type)
    VALUES (p_ip_address, p_email, p_action_type);
    
    RETURN true; -- Allowed
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated;

-- Cleanup old rate limits (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.rate_limits
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- ============================================================================
-- EMAIL VALIDATION - Prevent disposable emails
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.disposable_email_domains (
    domain text PRIMARY KEY
);

-- Insert common disposable email domains
INSERT INTO public.disposable_email_domains (domain) VALUES
('tempmail.com'), ('throwaway.com'), ('mailinator.com'), ('guerrillamail.com'),
('sharklasers.com'), ('spam4.me'), ('trashmail.com'), ('yopmail.com'),
('temp.inbox.com'), ('mailnesia.com'), ('tempmailaddress.com')
ON CONFLICT DO NOTHING;

-- Function to validate email
CREATE OR REPLACE FUNCTION public.is_valid_email(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_domain text;
BEGIN
    -- Basic format check
    IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN false;
    END IF;
    
    -- Extract domain
    v_domain := split_part(p_email, '@', 2);
    
    -- Check against disposable domains
    IF EXISTS (SELECT 1 FROM public.disposable_email_domains WHERE domain = v_domain) THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_valid_email TO anon;
GRANT EXECUTE ON FUNCTION public.is_valid_email TO authenticated;
