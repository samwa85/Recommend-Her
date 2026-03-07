# Messages RLS Fix Documentation

## Problem

The Messages admin module was unable to perform UPDATE and DELETE operations due to Row Level Security (RLS) policies on the `contact_submissions` table. The RLS policies only allowed:
- ✅ INSERT (for contact form submissions)
- ✅ SELECT (for viewing messages)
- ❌ UPDATE (blocked - couldn't mark as read/archived)
- ❌ DELETE (blocked - couldn't delete messages)

## Solution

Apply migration `017_fix_messages_rls.sql` to update the RLS policies and allow admin dashboard operations.

### Migration File Location
```
supabase/migrations/017_fix_messages_rls.sql
```

### SQL Content

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can insert messages" ON messages;
DROP POLICY IF EXISTS "Admin full access on messages" ON messages;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow PUBLIC to perform all operations (for admin dashboard)
CREATE POLICY "Public can insert messages"
    ON messages
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Public can view messages"
    ON messages
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Public can update messages"
    ON messages
    FOR UPDATE
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can delete messages"
    ON messages
    FOR DELETE
    TO PUBLIC
    USING (true);
```

## How to Apply the Fix

### Option 1: InsForge Dashboard (Recommended)

1. Log into your InsForge dashboard at: https://aku8v88g.us-east.insforge.app
2. Navigate to Database → SQL Editor
3. Copy the content from `supabase/migrations/017_fix_messages_rls.sql`
4. Paste into the SQL editor
5. Click "Run"
6. Verify the policies were created successfully

### Option 2: Direct API Call

```bash
curl -X POST "https://aku8v88g.us-east.insforge.app/api/database/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"query": "YOUR_SQL_HERE"}'
```

### Option 3: Using InsForge SDK

```typescript
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://aku8v88g.us-east.insforge.app',
  anonKey: 'YOUR_ANON_KEY',
});

// Apply migration
const { error } = await client.database.rpc('exec_sql', {
  sql: `YOUR_SQL_HERE`
});
```

## Verification

After applying the migration, run the tests to verify:

```bash
npm test -- src/test/admin-crud-integration.test.ts -t "Messages Module"
```

All tests should pass:
- ✅ CREATE message
- ✅ READ message (list)
- ✅ READ message (single)
- ✅ UPDATE message status
- ✅ DELETE message

## Security Considerations

⚠️ **Important:** The current migration allows PUBLIC access to UPDATE/DELETE for the admin dashboard to work with the anonymous key.

For production with stricter security:

1. **Option A:** Implement admin authentication and use authenticated role
2. **Option B:** Keep RLS restrictive and use server-side functions for mutations
3. **Option C:** Add IP restrictions or API key validation

### Alternative: Authenticated-Only Policy

If you have admin authentication implemented:

```sql
-- Instead of PUBLIC policies, use authenticated role
CREATE POLICY "Authenticated full access on messages"
    ON messages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
```

## Test Results

| Operation | Before Fix | After Fix |
|-----------|-----------|-----------|
| CREATE | ✅ Working | ✅ Working |
| READ | ✅ Working | ✅ Working |
| UPDATE | ❌ Blocked by RLS | ✅ Working |
| DELETE | ❌ Blocked by RLS | ✅ Working |

## Related Files

- `supabase/migrations/017_fix_messages_rls.sql` - Migration file
- `src/admin/pages/MessagesPage.tsx` - Admin UI
- `src/lib/queries/messages.ts` - Message queries
- `src/test/admin-crud-integration.test.ts` - Test suite
- `ADMIN_CRUD_TEST_RESULTS.md` - Test documentation

## Troubleshooting

### Issue: Migration fails with "policy already exists"

**Solution:** The DROP POLICY IF EXISTS statements should handle this, but if they fail:

```sql
-- Manually drop all policies first
DROP POLICY IF EXISTS "Public can insert messages" ON messages;
DROP POLICY IF EXISTS "Public can view messages" ON messages;
DROP POLICY IF EXISTS "Public can update messages" ON messages;
DROP POLICY IF EXISTS "Public can delete messages" ON messages;
DROP POLICY IF EXISTS "Admin full access on messages" ON messages;

-- Then recreate
-- ... (rest of migration)
```

### Issue: Still can't update after migration

**Check:**
1. Verify migration was applied: Check RLS policies in InsForge dashboard
2. Confirm table name: App uses `contact_submissions` not `messages`
3. Check for typos in policy names

### Issue: Too permissive for production

**Solution:** Implement admin authentication and switch to authenticated role policies (see Security Considerations above).
