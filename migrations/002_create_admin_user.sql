-- ============================================================================
-- CREATE ADMIN USER
-- Run this in Supabase Studio SQL Editor
-- ============================================================================

-- Step 1: Create an auth user (replace with your email/password)
-- Note: This uses Supabase Auth. You can also create via the Auth UI in Studio.

-- If you want to create via SQL (requires proper password hash):
-- First, sign up via the app or Supabase Auth UI, then run:

-- Step 2: After creating auth user, make them admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Or insert directly if you know the UUID:
-- INSERT INTO profiles (id, role, full_name, email)
-- VALUES ('auth-user-uuid-here', 'admin', 'Admin User', 'admin@example.com');

-- Step 3: Verify
SELECT id, role, full_name, email FROM profiles WHERE role = 'admin';
