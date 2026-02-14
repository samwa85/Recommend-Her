# Data Schema Fix Documentation

## Problem Summary

The Admin Dashboard shows "0 total talents" even after successful form submissions. This was caused by a **schema mismatch** between:

1. **InsForge Database Schema** (old column names):
   - `years_experience` (int)
   - `seniority_level` (text)
   - `functions` (text[])
   - `portfolio_url` (text)
   - `cv_file_path` (text)
   - Status values: 'draft', 'submitted', 'vetted', 'approved', 'rejected'

2. **Admin Dashboard Expectations** (new column names):
   - `years_of_experience` (text)
   - `current_role_title` (text)
   - `role_category` (text)
   - `seeking_roles` (text[])
   - `website_url` (text)
   - `cv_file_id` (text)
   - Status values: 'pending', 'approved', 'rejected', 'archived'

## Root Cause

The forms were updated to use new column names, but the InsForge database still had the old schema. When forms submitted data:
- Insert failed with: `Could not find the 'current_role_title' column`
- Admin queries returned empty because data wasn't being stored

## Solution

### 1. Created Migration Script (`migrations/014_align_talent_schema.sql`)

This migration:
- **Adds new columns** alongside old ones (dual-schema approach)
- **Creates triggers** to automatically sync data between old and new columns
- **Migrates existing data** from old columns to new
- **Updates views** to use new column names
- **Updates status constraint** to accept 'pending' instead of 'submitted'

### 2. Updated Form Submission (`src/pages/ForTalent.tsx`)

Changed the insert to use database-compatible column names:
```typescript
// Before (failed):
years_of_experience: formData.years_experience,
current_role_title: formData.seniority_level,
role_category: formData.functions?.[0],

// After (works):
years_experience: formData.years_experience,
seniority_level: formData.seniority_level,
functions: formData.functions,
```

### 3. Updated Admin Queries (`src/lib/queries/talent.ts`)

Fixed query filters to use correct column names:
```typescript
// Before:
query = query.eq('years_of_experience', filters.years_of_experience);
query = query.not('cv_file_id', 'is', null);

// After:
query = query.eq('years_experience', filters.years_of_experience);
query = query.not('cv_file_path', 'is', null);
```

### 4. Updated Type Definitions (`src/lib/types/db.ts`)

Made types support both old and new column names:
```typescript
export interface TalentProfileRow {
  // Support both old and new column names
  years_of_experience?: string | null;
  years_experience?: number | null;
  current_role_title?: string | null;
  seniority_level?: string | null;
  // ... etc
}
```

## How to Apply the Fix

### Option 1: Apply Migration to InsForge (Recommended)

1. Copy the contents of `migrations/014_align_talent_schema.sql`
2. Log in to your InsForge dashboard
3. Navigate to Database → SQL Editor
4. Run the migration script
5. Verify by checking if data appears in admin dashboard

### Option 2: Manual Column Renaming

If the migration fails, manually rename columns:
```sql
ALTER TABLE talent_profiles 
    RENAME COLUMN years_experience TO years_of_experience,
    RENAME COLUMN seniority_level TO current_role_title,
    -- etc
```

## Testing the Fix

1. **Submit a test talent profile** via `/for-talent`
2. **Check console** for success message with talent ID
3. **Navigate to admin** at `/admin/talent`
4. **Verify** the new profile appears in the list
5. **Check filters** work correctly

## Status Values Mapping

| Old Value | New Value | Notes |
|-----------|-----------|-------|
| 'draft' | 'draft' | Unchanged |
| 'submitted' | 'pending' | Submitted profiles become pending |
| 'vetted' | 'vetted' | Unchanged |
| 'approved' | 'approved' | Unchanged |
| 'rejected' | 'rejected' | Unchanged |
| - | 'archived' | New status added |

## Files Modified

1. `migrations/014_align_talent_schema.sql` - New migration
2. `src/pages/ForTalent.tsx` - Form submission
3. `src/lib/queries/talent.ts` - Query filters
4. `src/lib/types/db.ts` - Type definitions

## Future Cleanup

After all systems are working with the new schema:
1. Remove old columns from database
2. Remove sync triggers
3. Clean up optional fields in type definitions
4. Update all code to use only new column names

## Troubleshooting

**Issue**: Form still fails with "column not found"
- **Fix**: Ensure migration was applied to InsForge database

**Issue**: Admin shows 0 records but form submits successfully
- **Fix**: Check if status values match (should be 'pending', not 'submitted')

**Issue**: Filters don't work
- **Fix**: Verify query filters use correct column names
