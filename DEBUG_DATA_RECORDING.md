# Debug: Is Database Recording Data?

## Quick Check

Run these SQL queries in Supabase SQL Editor to verify if data exists:

### 1. Check if any talent profiles exist
```sql
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
FROM public.talent_profiles;
```

### 2. Check if any profiles exist
```sql
SELECT COUNT(*) as total_profiles FROM public.profiles;
```

### 3. Check recent submissions
```sql
SELECT 
    tp.id,
    tp.status,
    tp.created_at,
    p.full_name,
    p.email
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
ORDER BY tp.created_at DESC
LIMIT 10;
```

### 4. Check anonymous submissions (no auth.users record)
```sql
SELECT 
    tp.id,
    tp.user_id,
    tp.status,
    p.full_name,
    p.email,
    CASE WHEN au.id IS NULL THEN 'Anonymous' ELSE 'Registered' END as user_type
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON tp.user_id = p.id
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY tp.created_at DESC
LIMIT 10;
```

## If No Data Exists

### Test Anonymous Submission Directly in SQL
```sql
-- Test the anonymous submission function
SELECT public.submit_talent_profile_anon(
    'Test User',
    'test@example.com',
    'Test Headline',
    'Test bio',
    5,
    'Technology',
    'Senior',
    ARRAY['Product', 'Strategy'],
    ARRAY['Leadership', 'Management'],
    ARRAY['English'],
    'https://linkedin.com/in/test',
    '',
    NULL
);
```

### Check for Errors
```sql
-- Check if function exists
SELECT proname, prosrc IS NOT NULL as has_body
FROM pg_proc 
WHERE proname = 'submit_talent_profile_anon';

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('talent_profiles', 'profiles')
ORDER BY tablename, policyname;
```

## Frontend Debugging

Add this logging to `src/pages/ForTalent.tsx` to trace submissions:

```typescript
// Around line 319, add logging:
console.log('Submitting talent profile with data:', {
  full_name: formData.full_name.trim(),
  email: formData.email.trim().toLowerCase(),
  headline: formData.headline.trim(),
  // ... other fields
});

const { error: submitError, data: submitData } = await supabase.rpc('submit_talent_profile_anon', {
  // ... params
});

console.log('Submission result:', { error: submitError, data: submitData });
```

## Common Issues

### 1. **RLS Blocking Inserts**
Symptom: Form submits successfully but no data appears
Check: RLS policies might be too restrictive

### 2. **Function Not Found**
Symptom: Error "function submit_talent_profile_anon does not exist"
Fix: Run migration 003, 004, or 005

### 3. **Foreign Key Constraint**
Symptom: Error about profiles_id_fkey
Fix: Run migration 004 to drop the FK constraint

### 4. **Permission Denied**
Symptom: Error "permission denied for function"
Fix: Check GRANT statements in migrations

## Immediate Fix

If you need to test immediately, run this SQL to add test data:

```sql
-- Insert test profile
INSERT INTO public.profiles (id, role, full_name, email, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'talent',
    'Test Talent',
    'test@example.com',
    NOW(),
    NOW()
)
RETURNING id;

-- Use the returned ID to insert talent profile
INSERT INTO public.talent_profiles (
    user_id, headline, bio, years_experience, industry, seniority_level,
    functions, skills, languages, status, submitted_at, created_at, updated_at
) VALUES (
    '<ID_FROM_ABOVE>',
    'Test Headline',
    'Test bio',
    5,
    'Technology',
    'Senior',
    ARRAY['Product'],
    ARRAY['Management'],
    ARRAY['English'],
    'submitted',
    NOW(),
    NOW(),
    NOW()
);
```

## Checklist

- [ ] Run the 4 SQL queries above - any data returned?
- [ ] Check browser console when submitting form - any errors?
- [ ] Check Supabase logs (Database → Logs) - any errors?
- [ ] Verify migrations are applied (001, 003, 004, 005)
- [ ] Check if admin user can see data in dashboard
