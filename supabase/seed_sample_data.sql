-- ============================================================================
-- SAMPLE DATA SEED - For Testing Only
-- Run this after schema setup to populate with test data
-- ============================================================================

-- Insert sample talent profiles
INSERT INTO talent_profiles (full_name, email, phone, location, country, headline, bio, current_company, current_title, years_experience, industry, role_category, skills, linkedin_url, status, source_page) VALUES
('Sarah Johnson', 'sarah.j@example.com', '+255 712 345 678', 'Dar es Salaam', 'Tanzania', 'Senior Software Engineer', 'Passionate full-stack developer with 8 years experience building scalable web applications.', 'TechCorp Tanzania', 'Senior Developer', 8, 'Technology', 'Engineering', '["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"]', 'https://linkedin.com/in/sarahj', 'approved', '/for-talent'),
('Michael Chen', 'michael.chen@example.com', '+255 723 456 789', 'Arusha', 'Tanzania', 'Product Manager', 'Experienced product manager specializing in fintech products and mobile applications.', 'FinTech Solutions', 'Product Lead', 6, 'Finance', 'Product', '["Product Strategy", "Agile", "Data Analysis", "User Research"]', 'https://linkedin.com/in/mchen', 'pending', '/for-talent'),
('Amina Hassan', 'amina.h@example.com', '+255 734 567 890', 'Mwanza', 'Tanzania', 'Marketing Director', 'Strategic marketing leader with expertise in brand development and digital marketing campaigns.', 'BrandWise Africa', 'Marketing Director', 10, 'Marketing', 'Marketing', '["Brand Strategy", "Digital Marketing", "Content Creation", "SEO"]', 'https://linkedin.com/in/aminah', 'approved', '/for-talent'),
('David Omondi', 'david.o@example.com', '+255 745 678 901', 'Dar es Salaam', 'Tanzania', 'Operations Manager', 'Operations expert focused on supply chain optimization and process improvement.', 'Logistics Pro', 'Operations Manager', 5, 'Operations', 'Operations', '["Supply Chain", "Process Improvement", "Team Leadership"]', NULL, 'pending', '/for-talent'),
('Grace Mwangi', 'grace.m@example.com', '+255 756 789 012', 'Nairobi', 'Kenya', 'HR Business Partner', 'HR professional specializing in talent acquisition and employee development.', 'PeopleFirst Ltd', 'HR Business Partner', 7, 'Human Resources', 'HR', '["Talent Acquisition", "Employee Relations", "Performance Management"]', 'https://linkedin.com/in/gracem', 'approved', '/for-talent'),
('James Wilson', 'james.w@example.com', '+255 767 890 123', 'Dar es Salaam', 'Tanzania', 'Legal Counsel', 'Corporate lawyer with expertise in contract negotiation and compliance.', 'Legal Partners TZ', 'Senior Associate', 4, 'Legal', 'Legal', '["Contract Law", "Compliance", "Corporate Governance"]', NULL, 'rejected', '/for-talent');

-- Insert sample sponsor profiles
INSERT INTO sponsor_profiles (full_name, email, phone, organization, job_title, industry, linkedin_url, sponsor_type, commitment_level, focus_areas, status) VALUES
('Dr. Elizabeth Taylor', 'elizabeth.taylor@bigtech.co.tz', '+255 778 901 234', 'BigTech Tanzania', 'CTO', 'Technology', 'https://linkedin.com/in/elizabetht', 'company', 'Champion (10+ hours/month)', '["Mentorship", "Hiring", "Networking"]', 'active'),
('Robert Kimani', 'robert.k@innovate.co.ke', '+255 789 012 345', 'Innovate Kenya', 'Founder & CEO', 'Technology', 'https://linkedin.com/in/rkimani', 'individual', 'Connector (2-5 hours/month)', '["Startup Mentorship", "Investment"]', 'active'),
('Patricia Ndege', 'patricia.ndege@healthplus.or.tz', '+255 790 123 456', 'HealthPlus Tanzania', 'Program Director', 'Healthcare', NULL, 'company', 'Sponsor (5-10 hours/month)', '["Healthcare Leadership", "Program Management"]', 'active'),
('Dr. Ibrahim Mohamed', 'ibrahim.m@university.ac.tz', '+255 701 234 567', 'University of Dar es Salaam', 'Professor of Business', 'Education', 'https://linkedin.com/in/ibrahimm', 'individual', 'Mentor (1-2 hours/month)', '["Academic Guidance", "Research"]', 'inactive'),
('Catherine Osei', 'catherine.o@bankofafrica.co.tz', '+255 712 345 678', 'Bank of Africa', 'Head of Talent', 'Finance', 'https://linkedin.com/in/catherineo', 'company', 'Champion (10+ hours/month)', '["Talent Acquisition", "Leadership Development"]', 'active'),
('Emmanuel Chirwa', 'emmanuel.c@community.org', '+255 723 456 789', 'Tech Community TZ', 'Community Lead', 'Technology', NULL, 'community', 'Connector (2-5 hours/month)', '["Community Building", "Events"]', 'active');

-- Insert sample requests
INSERT INTO requests (request_type, title, description, talent_id, sponsor_id, priority, status, due_date, source_page) VALUES
('recommendation', 'Looking for Senior Developer', 'We are looking for a senior full-stack developer with React and Node.js experience.', (SELECT id FROM talent_profiles WHERE email = 'sarah.j@example.com'), (SELECT id FROM sponsor_profiles WHERE email = 'elizabeth.taylor@bigtech.co.tz'), 'high', 'open', CURRENT_DATE + INTERVAL '14 days', '/admin'),
('sponsorship_intro', 'Introduction Needed', 'Would like to be introduced to the marketing talent for a potential collaboration.', (SELECT id FROM talent_profiles WHERE email = 'amina.h@example.com'), (SELECT id FROM sponsor_profiles WHERE email = 'robert.k@innovate.co.ke'), 'normal', 'in_review', CURRENT_DATE + INTERVAL '7 days', '/admin'),
('talent_match', 'Product Manager for Fintech', 'Looking for a product manager with fintech experience for our new mobile payment app.', (SELECT id FROM talent_profiles WHERE email = 'michael.chen@example.com'), (SELECT id FROM sponsor_profiles WHERE email = 'catherine.o@bankofafrica.co.tz'), 'urgent', 'open', CURRENT_DATE + INTERVAL '5 days', '/admin'),
('general', 'Partnership Inquiry', 'Interested in partnering with RecommendHer for our upcoming conference.', NULL, (SELECT id FROM sponsor_profiles WHERE email = 'emmanuel.c@community.org'), 'normal', 'open', NULL, '/contact'),
('recommendation', 'Operations Manager Role', 'Seeking an operations manager with supply chain experience.', (SELECT id FROM talent_profiles WHERE email = 'david.o@example.com'), (SELECT id FROM sponsor_profiles WHERE email = 'elizabeth.taylor@bigtech.co.tz'), 'normal', 'approved', CURRENT_DATE + INTERVAL '10 days', '/admin');

-- Insert sample messages
INSERT INTO messages (sender_name, sender_email, sender_phone, subject, message, page_source, status) VALUES
('Jane Smith', 'jane.smith@gmail.com', '+255 734 567 890', 'Question about joining', 'Hi, I would like to know more about how to join the talent pool. What are the requirements?', '/contact', 'unread'),
('Mark Johnson', 'mark.j@company.co.tz', '+255 745 678 901', 'Partnership Opportunity', 'We are a local tech company looking to partner with RecommendHer for our recruitment needs. Can we schedule a call?', '/contact', 'read'),
('Alice Mutua', 'alice.m@email.com', NULL, 'Talent Application', 'I am interested in applying as a talent. I have 5 years experience in UX design and would love to join your network.', '/for-talent', 'replied'),
('Peter Njoroge', 'peter.n@sponsor.co.ke', '+255 756 789 012', 'Sponsorship Inquiry', 'Our organization would like to become a sponsor. What are the different sponsorship levels available?', '/for-sponsors', 'unread'),
('Mary Wanjiku', 'mary.w@spam.test', NULL, 'Get Rich Quick', 'This is clearly spam content that should be filtered out.', '/contact', 'spam'),
('Carlos Mendez', 'carlos.m@international.org', '+1 555 123 4567', 'International Collaboration', 'We are an international NGO looking to expand our operations in East Africa. Interested in discussing potential collaborations.', '/contact', 'read'),
('Fatima Ali', 'fatima.a@consultant.com', '+255 767 890 123', 'Consulting Services', 'I offer HR consulting services and would like to offer my expertise to your talent network.', '/contact', 'archived');

-- Verify counts
SELECT 
    'talent_profiles' as table_name, 
    COUNT(*) as count 
FROM talent_profiles
UNION ALL
SELECT 
    'sponsor_profiles' as table_name, 
    COUNT(*) as count 
FROM sponsor_profiles
UNION ALL
SELECT 
    'requests' as table_name, 
    COUNT(*) as count 
FROM requests
UNION ALL
SELECT 
    'messages' as table_name, 
    COUNT(*) as count 
FROM messages;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
