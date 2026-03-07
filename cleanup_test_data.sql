-- ============================================================================
-- CLEANUP SCRIPT: Remove Test Data
-- Run this after QA testing to clean up test entries
-- ============================================================================

-- ============================================================================
-- MESSAGES / CONTACT SUBMISSIONS
-- ============================================================================
DELETE FROM contact_submissions 
WHERE email LIKE '%@example.com' 
   OR email LIKE '%@test.com'
   OR email LIKE 'test-contact%@example.com'
   OR email LIKE 'qa-test%@example.com'
   OR email LIKE 'user-%@test.com'
   OR email LIKE 'talent-%@test.com'
   OR email LIKE 'sponsor-%@test.com'
   OR full_name LIKE 'Test %'
   OR full_name LIKE 'Test QA%';

-- ============================================================================
-- TALENT PROFILES
-- ============================================================================
DELETE FROM talent_profiles 
WHERE email LIKE '%@test.com'
   OR email LIKE '%@example.com'
   OR full_name LIKE 'Test Talent%'
   OR full_name LIKE 'Test User%'
   OR linkedin_url LIKE '%/test%'
   OR headline LIKE '%Test%';

-- ============================================================================
-- SPONSOR PROFILES
-- ============================================================================
DELETE FROM sponsor_profiles 
WHERE email LIKE '%@test.com'
   OR email LIKE '%@example.com'
   OR full_name LIKE 'Test Sponsor%'
   OR full_name LIKE 'Test User%'
   OR linkedin_url LIKE '%/test%'
   OR company_name LIKE 'Test Company%';

-- ============================================================================
-- BLOG POSTS (Restore original titles)
-- ============================================================================
UPDATE blog_posts 
SET title = 'The Power of Sponsorship vs. Mentorship',
    updated_at = NOW()
WHERE title = '[UPDATED]' 
   OR title LIKE '%[UPDATED]%';

-- Delete any truly test blog posts if created
DELETE FROM blog_posts 
WHERE title LIKE 'Test Post%'
   OR slug LIKE 'test-%'
   OR excerpt LIKE '%test%';

-- ============================================================================
-- TESTIMONIALS (Reset hidden ones to active)
-- ============================================================================
UPDATE testimonials 
SET is_active = true,
    updated_at = NOW()
WHERE is_active = false;

-- Reset featured to only the first one
UPDATE testimonials 
SET is_featured = false,
    updated_at = NOW()
WHERE id NOT IN (SELECT id FROM testimonials ORDER BY display_order LIMIT 1);

-- Delete any test testimonials
DELETE FROM testimonials 
WHERE name LIKE 'Test %'
   OR quote LIKE '%test%'
   OR company LIKE 'Test %';

-- ============================================================================
-- REQUESTS
-- ============================================================================
DELETE FROM requests 
WHERE requester_email LIKE '%@test.com'
   OR requester_email LIKE '%@example.com'
   OR notes LIKE '%test%';

-- ============================================================================
-- VERIFY CLEANUP
-- ============================================================================
SELECT 'Contact Submissions' as table_name, COUNT(*) as count FROM contact_submissions
UNION ALL
SELECT 'Talent Profiles', COUNT(*) FROM talent_profiles
UNION ALL
SELECT 'Sponsor Profiles', COUNT(*) FROM sponsor_profiles
UNION ALL
SELECT 'Blog Posts', COUNT(*) FROM blog_posts
UNION ALL
SELECT 'Testimonials', COUNT(*) FROM testimonials
UNION ALL
SELECT 'Requests', COUNT(*) FROM requests;
