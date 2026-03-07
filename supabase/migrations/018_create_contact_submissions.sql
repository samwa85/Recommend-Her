-- ============================================================================
-- CREATE CONTACT_SUBMISSIONS TABLE
-- The app expects this table but the schema only created 'messages'
-- ============================================================================

-- Create contact_submissions table with columns the app expects
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    inquiry_type TEXT NOT NULL DEFAULT 'General Inquiry',
    organization TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE contact_submissions IS 'Contact form submissions (app-facing table)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can insert contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can view contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can update contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can delete contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin full access on contact_submissions" ON contact_submissions;

-- Policy: Allow anyone to insert (for contact forms)
CREATE POLICY "Public can insert contact_submissions"
    ON contact_submissions
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

-- Policy: Allow anyone to select (for admin dashboard)
CREATE POLICY "Public can view contact_submissions"
    ON contact_submissions
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Policy: Allow anyone to update (for admin dashboard status changes)
CREATE POLICY "Public can update contact_submissions"
    ON contact_submissions
    FOR UPDATE
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Policy: Allow anyone to delete (for admin dashboard)
CREATE POLICY "Public can delete contact_submissions"
    ON contact_submissions
    FOR DELETE
    TO PUBLIC
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_submissions_updated_at();

-- ============================================================================
-- MIGRATE DATA FROM MESSAGES TABLE (if any exists)
-- ============================================================================

-- If there are existing messages, copy them to contact_submissions
INSERT INTO contact_submissions (id, full_name, email, inquiry_type, message, status, created_at)
SELECT 
    id,
    sender_name as full_name,
    sender_email as email,
    COALESCE(subject, 'General Inquiry') as inquiry_type,
    message,
    CASE 
        WHEN status = 'unread' THEN 'new'
        WHEN status = 'spam' THEN 'archived'
        ELSE status
    END as status,
    created_at
FROM messages
ON CONFLICT (id) DO NOTHING;
