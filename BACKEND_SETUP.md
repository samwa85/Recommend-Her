# Backend Setup Guide - Fix Submission Issues

## Problem
The form submission is getting stuck on "Submitting..." because the database function `submit_talent_profile_anon` doesn't exist in the InsForge backend.

## Solution

### Step 1: Access Your InsForge SQL Editor

1. Go to your InsForge dashboard: `https://aku8v88g.us-east.insforge.app`
2. Navigate to the SQL Editor section
3. Create a new query

### Step 2: Run the Database Setup Script

Copy and paste the entire contents of `server-setup/setup-database.sql` into the SQL Editor and run it.

This will:
- Create all necessary tables (profiles, talent_profiles, sponsor_profiles, audit_logs)
- Create the `submit_talent_profile_anon` function for talent submissions
- Create the `submit_sponsor_profile_anon` function for sponsor submissions
- Create admin views for the dashboard
- Set up proper permissions

**Direct SQL to run:**

```sql
-- ============================================================================
-- QUICK SETUP - Run this in InsForge SQL Editor
-- ============================================================================

-- Create tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL DEFAULT 'talent',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.talent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    headline TEXT,
    bio TEXT,
    years_experience INTEGER DEFAULT 0,
    industry TEXT,
    seniority_level TEXT,
    functions TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    linkedin_url TEXT,
    portfolio_url TEXT,
    cv_file_path TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the submission function
CREATE OR REPLACE FUNCTION public.submit_talent_profile_anon(
    p_full_name TEXT,
    p_email TEXT,
    p_headline TEXT,
    p_bio TEXT DEFAULT '',
    p_years_experience INTEGER DEFAULT 0,
    p_industry TEXT DEFAULT '',
    p_seniority_level TEXT DEFAULT '',
    p_functions TEXT[] DEFAULT '{}',
    p_skills TEXT[] DEFAULT '{}',
    p_languages TEXT[] DEFAULT '{}',
    p_linkedin_url TEXT DEFAULT '',
    p_portfolio_url TEXT DEFAULT '',
    p_cv_file_path TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
    v_talent_id UUID;
BEGIN
    v_profile_id := gen_random_uuid();
    
    INSERT INTO public.profiles (id, role, full_name, email, created_at)
    VALUES (v_profile_id, 'talent', p_full_name, p_email, NOW());
    
    INSERT INTO public.talent_profiles (
        user_id, headline, bio, years_experience, industry, seniority_level,
        functions, skills, languages, linkedin_url, portfolio_url, cv_file_path,
        status, submitted_at, created_at
    ) VALUES (
        v_profile_id, p_headline, p_bio, p_years_experience, p_industry, 
        p_seniority_level, p_functions, p_skills, p_languages, 
        p_linkedin_url, p_portfolio_url, p_cv_file_path,
        'submitted', NOW(), NOW()
    )
    RETURNING id INTO v_talent_id;
    
    RETURN v_talent_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO anon;
GRANT EXECUTE ON FUNCTION public.submit_talent_profile_anon TO authenticated;
GRANT INSERT ON public.profiles TO anon;
GRANT INSERT ON public.talent_profiles TO anon;

-- Create admin view
CREATE OR REPLACE VIEW public.v_pending_talent_reviews AS
SELECT 
    tp.id, tp.user_id, p.full_name, p.email, tp.headline, tp.industry,
    tp.seniority_level, tp.years_experience, tp.submitted_at, tp.cv_file_path,
    tp.linkedin_url, tp.status, tp.functions, tp.skills, tp.languages
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.status = 'submitted' 
ORDER BY tp.submitted_at ASC;

GRANT SELECT ON public.v_pending_talent_reviews TO authenticated;
```

### Step 3: Verify the Setup

After running the SQL, verify by running:

```sql
-- Check if the function was created
SELECT proname FROM pg_proc WHERE proname = 'submit_talent_profile_anon';

-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'talent_profiles');
```

### Step 4: Test the Submission

1. Go back to your app (`http://localhost:5176` or your deployed URL)
2. Fill out the talent form
3. Submit and verify it works

## Alternative: Direct Insert (No RPC Required)

The code has been updated with a **fallback mechanism**. If the RPC function doesn't exist, it will automatically try direct database inserts. This means:

- ✅ If you run the SQL above → Uses optimized RPC function
- ✅ If you don't run the SQL → Falls back to direct inserts (still works!)

## Admin Dashboard Access

To view submitted talent profiles:

1. Go to `/admin` route
2. Login with password: `admin123`
3. Navigate to "Talent Management" tab
4. All submissions will appear in the list

## Troubleshooting

### Issue: Still stuck on "Submitting..."

**Check browser console:**
- Open DevTools (F12)
- Go to Console tab
- Look for red error messages

**Common errors:**
1. `Cannot POST /rest/v1/rpc/submit_talent_profile_anon` → SQL not run yet
2. `403 Forbidden` → Permissions issue, run the GRANT statements
3. `Network error` → Check internet connection

### Issue: Data not showing in Admin Dashboard

1. Verify the view exists:
```sql
SELECT * FROM public.v_pending_talent_reviews LIMIT 5;
```

2. Check raw data:
```sql
SELECT * FROM public.talent_profiles ORDER BY created_at DESC LIMIT 5;
```

### Issue: CV Upload Fails

1. Ensure storage bucket `talent-cvs` exists in InsForge
2. Check RLS policies allow anonymous uploads

## File Changes Made

The following files were updated to fix the submission issue:

1. **`src/pages/ForTalent.tsx`** - Updated `handleSubmit` with fallback mechanism
2. **`src/pages/ForSponsors.tsx`** - Updated `handleSubmit` with fallback mechanism
3. **`server-setup/setup-database.sql`** - Complete database setup script

## Next Steps

1. ✅ Run the SQL setup script in InsForge
2. ✅ Test form submission
3. ✅ Verify data appears in Admin Dashboard
4. ✅ Deploy updated code to production

## Support

If issues persist:
1. Check browser console for exact error messages
2. Verify InsForge backend is accessible
3. Ensure all migrations are applied
