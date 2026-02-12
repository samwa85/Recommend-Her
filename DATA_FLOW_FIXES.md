# Data Flow & Reporting Fixes

## Issues Identified

### 1. **Anonymous Profile Data Loss**
- **Problem**: Views like `v_pending_talent_reviews` used `JOIN` which excluded anonymous profiles without matching `profiles` records
- **Impact**: Anonymous submissions disappeared from the dashboard
- **Fix**: Changed to `LEFT JOIN` in views to include all talent profiles

### 2. **Metrics vs Data Inconsistency**
- **Problem**: Metrics view (`v_admin_dashboard_metrics`) counts from raw table, but dashboard queries use joins
- **Impact**: Metrics showed counts that didn't match the displayed data
- **Fix**: 
  - Added detailed logging to track data flow
  - Created data health check component
  - Fixed `getAllTalent()` to use `LEFT JOIN` for profiles

### 3. **Race Condition in Data Loading**
- **Problem**: `loadAllData()` didn't properly handle individual API failures
- **Impact**: One failed request could break the entire dashboard
- **Fix**: Changed to `Promise.allSettled()` with individual error handling

### 4. **Missing Error Tracking**
- **Problem**: API errors weren't visible in the UI
- **Impact**: Users couldn't tell why data wasn't loading
- **Fix**: Added comprehensive console logging and error display

## Files Modified

### Frontend Changes

#### `src/lib/supabase.ts`
- Changed `getAllTalent()` to use `LEFT JOIN` for profiles
- Added `getTalentProfileDebug()` diagnostic function
- Added detailed logging for talent queries

#### `src/pages/AdminDashboard.tsx`
- Added comprehensive logging to `loadAllData()`
- Changed to `Promise.allSettled()` for parallel requests
- Added `runDataHealthCheck()` function
- Added data health check UI component
- Added data consistency warnings
- Fixed `checkAuth()` to log auth status

### Database Migration

#### `migrations/006_fix_data_flow.sql`
- Fixed `v_pending_talent_reviews` to use `LEFT JOIN`
- Fixed `v_public_talent_profiles` to use `LEFT JOIN`
- Fixed `v_recommendation_requests_detail` to use `LEFT JOIN`
- Added `get_talent_status_counts()` diagnostic function
- Improved admin RLS policies with `EXISTS` pattern

## How to Apply Database Fixes

1. Run the migration in Supabase SQL Editor:
```sql
\i migrations/006_fix_data_flow.sql
```

Or copy-paste the contents of `006_fix_data_flow.sql` into the SQL Editor and run.

2. Verify the fixes:
```sql
-- Check talent counts by status
SELECT * FROM public.get_talent_status_counts();

-- Check if views return data
SELECT COUNT(*) FROM public.v_pending_talent_reviews;
SELECT COUNT(*) FROM public.v_public_talent_profiles;
```

## Debugging Steps

1. **Check browser console** - All data loading is now logged with:
   - `=== Loading all dashboard data ===`
   - `✓ Metrics: {...}`
   - `✓ All talent: { count, dataLength, error }`
   - `Status breakdown: {...}`

2. **Check Data Health Card** - New UI component shows:
   - Total raw talent count
   - Status breakdown from database
   - Inconsistency warnings

3. **Check Network Tab** - Look for:
   - `getAdminMetrics` response
   - `getAllTalent` response
   - Any 403/401 errors (RLS issues)

## Expected Behavior After Fixes

1. **Metrics Match Data**: The stat card numbers should match the dialog list counts
2. **Anonymous Profiles Visible**: Anonymous submissions appear in pending reviews
3. **No Data Loss**: All talent profiles are accessible regardless of profile record status
4. **Clear Errors**: API failures are logged and displayed

## Rollback Plan

If issues occur, rollback database changes:
```sql
-- Restore original views (from 001_complete_backend_hardening.sql)
-- Or restore from backup
```

Frontend changes are backward compatible and can be reverted by reverting the git commit.
