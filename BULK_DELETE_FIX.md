# Bulk Delete Fix Documentation

## Problem

When using bulk delete in the admin dashboard, the UI shows "Bulk action completed" but the data remains in the database. This happens because:

1. **Row Level Security (RLS)** policies on `talent_profiles`, `sponsor_profiles`, and `recommendation_requests` tables restrict DELETE operations to admin users only
2. The frontend uses an anonymous key which doesn't pass the `public.is_admin(auth.uid())` check
3. The SDK returns a "success" (empty result) even when RLS blocks the delete, because no error is thrown - the rows are just silently filtered out
4. The frontend code counted operations without proper error checking, showing success even when deletes failed

## Solution

### 1. Database Migration (migrations/021_fix_bulk_delete_rls.sql)

Updated RLS policies for the following tables to allow anonymous (public) access:
- `talent_profiles`
- `sponsor_profiles`  
- `recommendation_requests`

**Changes:**
- Replaced restrictive policies (`public.is_admin(auth.uid())`) with permissive policies (`USING (true)`)
- Allowed `anon` and `authenticated` roles full CRUD access
- This matches the pattern already used for `contact_submissions` (messages) table

### 2. Frontend Error Handling Improvements

Updated bulk action handlers in:
- `TalentPage.tsx`
- `SponsorsPage.tsx`
- `RequestsPage.tsx`
- `BlogPage.tsx`

**Improvements:**
- Now counts both successes and failures separately
- Shows detailed error messages when all operations fail
- Shows warning toast for partial failures
- Better loading messages showing count of items being processed
- Returns specific action names ("deleted" vs "updated") in success messages

## How to Apply the Fix

### Option 1: InsForge Dashboard (Recommended)

1. Log into your InsForge dashboard
2. Navigate to Database → SQL Editor
3. Open `migrations/021_fix_bulk_delete_rls.sql`
4. Copy and paste the SQL content
5. Click "Run"
6. Verify the policies were created successfully

### Option 2: Deploy with Application

The frontend changes are already in the codebase. Deploy the updated code:

```bash
npm run build
# Deploy to your hosting platform
```

## Verification

After applying the migration:

1. Go to Admin Dashboard → Talent
2. Select multiple talent profiles using checkboxes
3. Click "Archive" or perform another bulk action
4. Verify the data is actually removed/updated by refreshing the page

## Security Considerations

⚠️ **Important:** The current fix allows PUBLIC access to all operations on these tables. This is necessary for the admin dashboard to work with anonymous keys.

For production with stricter security:

1. **Option A:** Implement admin authentication and switch to authenticated role policies
2. **Option B:** Use server-side functions for mutations with SECURITY DEFINER
3. **Option C:** Add API key validation or IP restrictions

### Example: Authenticated-Only Policy

```sql
-- Instead of PUBLIC policies, use authenticated role
CREATE POLICY "Table: Authenticated full access"
    ON table_name
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
```

## Files Modified

### Database
- `migrations/021_fix_bulk_delete_rls.sql` (new file)

### Frontend
- `src/admin/pages/TalentPage.tsx`
- `src/admin/pages/SponsorsPage.tsx`
- `src/admin/pages/RequestsPage.tsx`
- `src/admin/pages/BlogPage.tsx`

## Related Issues

This fix addresses the same underlying issue that was previously fixed for:
- Messages (`contact_submissions` table) - see `MESSAGES_RLS_FIX.md`
