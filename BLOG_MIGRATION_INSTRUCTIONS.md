# Blog Posts Table Migration

## Problem
The `blog_posts` table doesn't exist in the database. This is causing the "Failed to fetch blog posts" error.

## Solution

You need to run the migration file `migrations/009_blog_posts.sql` in your InsForge database.

### Option 1: InsForge SQL Editor (Recommended)

1. **Go to your InsForge Dashboard:**
   - URL: https://aku8v88g.us-east.insforge.app/dashboard
   - Login with your admin credentials

2. **Navigate to SQL Editor:**
   - Look for "SQL Editor" or "Database" section
   - Or go directly to: https://aku8v88g.us-east.insforge.app/dashboard/sql

3. **Run the Migration:**
   - Copy the entire contents of `migrations/009_blog_posts.sql`
   - Paste into the SQL Editor
   - Click "Run" or "Execute"

### Option 2: Using cURL with Admin API

If you have the admin/service role key, you can run:

```bash
# Set your service role key (different from anon key)
SERVICE_ROLE_KEY="your-service-role-key-here"

# Run the SQL migration
curl -X POST "https://aku8v88g.us-east.insforge.app/api/admin/database/query" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d @migrations/009_blog_posts.sql
```

### Option 3: Direct Database Connection (if available)

If you have direct PostgreSQL access:

```bash
psql -h <db-host> -p 5432 -U postgres -d postgres -f migrations/009_blog_posts.sql
```

## What the Migration Does

1. Creates the `blog_posts` table with all necessary columns
2. Creates indexes for common queries (status, slug, category, etc.)
3. Sets up Row Level Security (RLS) policies:
   - Public can read published posts
   - Only admins can create/update/delete
4. Creates triggers for:
   - Auto-updating `updated_at` timestamp
   - Auto-setting `published_at` when status changes to published
5. Inserts 3 sample blog posts:
   - "The Power of Sponsorship vs. Mentorship"
   - "Success Story: How Sarah Landed Her Dream Role"
   - "Building an Inclusive Leadership Pipeline"

## Verification

After running the migration, verify it worked:

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'blog_posts';

-- Check if sample data exists
SELECT slug, title, status FROM public.blog_posts;
```

## Quick Fix Alternative

If you can't access the database right now, the app has been updated with **static fallback** - it will display the blog posts from static data when the database is unavailable. Users will still see the blog content.

However, to use the admin blog management features, you need to run this migration.

## Troubleshooting

### "relation already exists" Error
If you see this error, the table already exists. You can skip the migration.

### RLS Policy Errors
If RLS policies fail, the table was created but permissions need adjustment. Run only the RLS section:

```sql
-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published posts
CREATE POLICY "Blog: Allow public read published" ON public.blog_posts
    FOR SELECT TO anon, authenticated
    USING (status = 'published');

-- Allow admin full access
CREATE POLICY "Blog: Admin full access" ON public.blog_posts FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
```

### Need Help?
Check the InsForge documentation or contact support if you can't access the SQL Editor.
