-- ============================================================================
-- BLOG POSTS TABLE
-- Store blog articles with full content, images, and metadata
-- ============================================================================

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    
    -- Media
    featured_image text,
    video_url text,
    
    -- Metadata
    author_name text NOT NULL DEFAULT 'Recommend Her Team',
    author_title text,
    author_image text,
    category text NOT NULL DEFAULT 'General',
    tags text[] DEFAULT '{}',
    read_time text,
    
    -- Status & Publishing
    status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at timestamptz,
    
    -- SEO
    meta_title text,
    meta_description text,
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published posts
DROP POLICY IF EXISTS "Blog: Allow public read published" ON public.blog_posts;
CREATE POLICY "Blog: Allow public read published" ON public.blog_posts
    FOR SELECT TO anon, authenticated
    USING (status = 'published');

-- Allow admin full access
DROP POLICY IF EXISTS "Blog: Admin full access" ON public.blog_posts;
CREATE POLICY "Blog: Admin full access" ON public.blog_posts FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Allow authenticated users to create (for admin functionality)
DROP POLICY IF EXISTS "Blog: Allow admin insert" ON public.blog_posts;
CREATE POLICY "Blog: Allow admin insert" ON public.blog_posts
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;

-- Create trigger
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND (OLD.status != 'published' OR OLD.status IS NULL) THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS set_blog_posts_published_at ON public.blog_posts;

-- Create trigger
CREATE TRIGGER set_blog_posts_published_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_published_at();

-- Create storage bucket for blog images (if not exists)
-- Note: This needs to be done via Supabase dashboard or storage API

-- Insert sample blog posts (matching our current static data)
INSERT INTO public.blog_posts (
    title, 
    slug, 
    excerpt, 
    content, 
    category, 
    author_name, 
    author_title, 
    tags, 
    read_time, 
    status, 
    published_at
) VALUES 
(
    'The Power of Sponsorship vs. Mentorship',
    'sponsorship-vs-mentorship',
    'Understanding the difference and why sponsorship matters more for career advancement.',
    E'# The Power of Sponsorship vs. Mentorship\n\nIn the landscape of professional development, two terms often get used interchangeably: mentorship and sponsorship. While both are valuable, understanding their distinct roles can be the key to unlocking unprecedented career growth.\n\n## What is Mentorship?\n\nMentorship is a relationship focused on guidance, advice, and personal growth. A mentor acts as a trusted advisor who:\n\n- Shares knowledge and experience\n- Provides career advice and guidance\n- Helps navigate workplace challenges\n- Offers feedback on skills and performance\n- Supports personal and professional development\n\n## What is Sponsorship?\n\nSponsorship, on the other hand, is an active advocacy relationship. A sponsor is someone who:\n\n- **Speaks your name in rooms you\'re not in**\n- Advocates for your promotion and advancement\n- Creates opportunities for visibility\n- Puts their own reputation on the line for your success\n\n## Conclusion\n\nMentorship will help you grow; sponsorship will help you rise. Both are valuable, but for breaking through to senior leadership, sponsorship is the accelerator that makes the difference.',
    'Leadership',
    'Dr. Amina Hassan',
    'Executive Coach & Leadership Expert',
    ARRAY['Sponsorship', 'Mentorship', 'Career Growth', 'Leadership'],
    '6 min read',
    'published',
    NOW()
),
(
    'Success Story: How Sarah Landed Her Dream Role',
    'success-story-sarah',
    'A Recommend Her talent shares her journey from submission to promotion.',
    E'# Success Story: How Sarah Landed Her Dream Role\n\n*From mid-level manager to VP in 18 months—one woman\'s journey through the power of sponsorship.*\n\n## The Stagnation\n\nThree years ago, Sarah Mitchell was stuck. As a Senior Product Manager at a mid-size tech company, she had repeatedly been passed over for promotion.\n\n## The Discovery\n\nSarah discovered Recommend Her through a LinkedIn post. Skeptical but curious, she submitted her profile.\n\n## The Results\n\nEighteen months later, Sarah has grown her team from 8 to 35 people and launched two new product lines.\n\n## Join the Movement\n\nAre you ready to write your own success story?',
    'Success Stories',
    'Sarah Mitchell',
    'VP of Product at TechVentures',
    ARRAY['Success Story', 'Career Change', 'Product Management'],
    '5 min read',
    'published',
    NOW() - INTERVAL '5 days'
),
(
    'Building an Inclusive Leadership Pipeline',
    'inclusive-leadership-pipeline',
    'How organizations can create pathways for diverse talent to reach the top.',
    E'# Building an Inclusive Leadership Pipeline\n\n*Moving beyond good intentions to create systems that develop and advance diverse leaders.*\n\n## The Pipeline Problem\n\nDespite decades of diversity initiatives, C-suites remain overwhelmingly homogeneous.\n\n## A Systemic Approach\n\n### 1. Audit Your Data\nBefore fixing the pipeline, understand where it breaks.\n\n### 2. Implement Structured Sponsorship Programs\nSponsorship is the single most effective intervention for advancing diverse talent.\n\n## Conclusion\n\nBuilding an inclusive leadership pipeline requires intention, investment, and persistence.',
    'Diversity & Inclusion',
    'Marcus Chen',
    'Chief Diversity Officer at GlobalTech',
    ARRAY['Diversity', 'Inclusion', 'Leadership', 'Organizational Change'],
    '8 min read',
    'published',
    NOW() - INTERVAL '10 days'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VERIFY
-- ============================================================================

-- Check table exists
SELECT 'blog_posts table exists' as check_result
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'blog_posts'
);

-- Check sample data exists
SELECT 'sample blog posts exist' as check_result
WHERE EXISTS (
    SELECT 1 FROM public.blog_posts WHERE status = 'published'
);
