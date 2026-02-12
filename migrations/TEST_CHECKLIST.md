# RecommendHer Test Checklist

Use this checklist to verify the backend implementation.

## Pre-requisites

- [ ] Supabase database is running
- [ ] Migration 001 has been applied
- [ ] Frontend is running (`npm run dev`)
- [ ] You have access to Supabase Studio

---

## 1. Database Schema Verification

### Run these SQL queries in Supabase Studio:

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Expected: audit_logs, opportunity_outcomes, profiles, recommendation_requests, 
--           sponsor_profiles, talent_profiles, vetting_reviews
```

- [ ] All 7 tables exist

```sql
-- Check all views exist
SELECT viewname FROM pg_views WHERE schemaname = 'public' ORDER BY viewname;

-- Expected: v_admin_dashboard_metrics, v_pending_sponsor_approvals, 
--           v_pending_talent_reviews, v_public_talent_profiles, v_recommendation_requests_detail
```

- [ ] All 5 views exist

```sql
-- Check functions exist
SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace 
AND proname IN ('submit_talent_profile', 'admin_review_talent', 'admin_review_sponsor', 
                'create_recommendation_request', 'update_request_status', 'record_outcome')
ORDER BY proname;
```

- [ ] All 6 RPC functions exist

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

- [ ] RLS enabled on all tables except audit_logs (should still have policies)

---

## 2. Authentication & Access Control

### Test as Unauthenticated User

- [ ] Visit `http://localhost:5173/admin` - Should show "Access denied"
- [ ] Try to access talent data via API - Should fail with 401/403

### Test as Talent User

1. Create a talent account (if auth is set up) or manually set role in DB:
```sql
-- Create auth user first, then:
INSERT INTO profiles (id, role, full_name, email) 
VALUES ('user-uuid', 'talent', 'Test Talent', 'talent@test.com');
```

- [ ] Can access `/for-talent` page
- [ ] Can submit profile (status becomes 'submitted')
- [ ] Cannot see other talent profiles
- [ ] Cannot approve own profile (try via SQL - should fail)
- [ ] Can update profile while pending

### Test as Sponsor User

```sql
INSERT INTO profiles (id, role, full_name, email) 
VALUES ('sponsor-uuid', 'sponsor', 'Test Sponsor', 'sponsor@test.com');

INSERT INTO sponsor_profiles (user_id, org_name, title, status) 
VALUES ('sponsor-uuid', 'Test Corp', 'CEO', 'pending');
```

- [ ] Can see own sponsor profile
- [ ] Cannot see talent while sponsor status is 'pending'
- [ ] Cannot create recommendation request while pending

### Test as Admin User

```sql
-- Create admin
INSERT INTO profiles (id, role, full_name, email) 
VALUES ('admin-uuid', 'admin', 'Admin User', 'admin@test.com');
```

- [ ] Can access `/admin` dashboard
- [ ] Can see all talent profiles
- [ ] Can see all sponsor profiles
- [ ] Can approve/reject talent
- [ ] Can approve/reject sponsors
- [ ] Can delete profiles
- [ ] Can view audit logs

---

## 3. Talent Submission Flow

### Submit Profile

1. Go to `/for-talent`
2. Fill out the form:
   - Headline: "Senior Product Manager | Fintech"
   - Bio: "10 years experience..."
   - Years of Experience: 8
   - Seniority: "Senior Level"
   - Industry: "Technology"
   - LinkedIn: https://linkedin.com/in/test
   - Upload CV (PDF, under 3MB)

- [ ] Form submits successfully
- [ ] Status is set to 'submitted'
- [ ] submitted_at is populated
- [ ] Audit log entry created with action 'TALENT_SUBMIT'
- [ ] CV uploaded to storage bucket

### Verify in Database

```sql
-- Check talent profile
SELECT * FROM talent_profiles WHERE user_id = 'your-user-id';

-- Check audit log
SELECT * FROM audit_logs WHERE action = 'TALENT_SUBMIT' ORDER BY created_at DESC LIMIT 1;

-- Check storage
SELECT * FROM storage.objects WHERE bucket_id = 'talent-cvs';
```

---

## 4. Admin Review Flow

### Review Talent

1. Go to `/admin`
2. Click "Talent Reviews" tab
3. Find the submitted talent
4. Click "Review" button
5. Select decision: "Approve"
6. Add feedback and internal notes
7. Click "Submit Review"

- [ ] Talent status changes to 'approved'
- [ ] approved_at is populated
- [ ] Vetting review record created
- [ ] Audit log entry created with action 'TALENT_REVIEW_APPROVED'
- [ ] Feedback stored in vetting_reviews

### Verify in Database

```sql
-- Check talent status
SELECT id, status, approved_at FROM talent_profiles WHERE id = 'talent-id';

-- Check vetting review
SELECT * FROM vetting_reviews WHERE talent_id = 'talent-id';

-- Check audit log
SELECT * FROM audit_logs WHERE action LIKE 'TALENT_REVIEW_%' ORDER BY created_at DESC;
```

---

## 5. Sponsor Flow

### Create Sponsor Profile

```sql
-- Create sponsor user
INSERT INTO profiles (id, role, full_name, email) 
VALUES ('sponsor-uuid', 'sponsor', 'Jane Sponsor', 'jane@test.com');

-- Create sponsor profile (pending)
INSERT INTO sponsor_profiles (user_id, org_name, title, industry, sponsor_type, status)
VALUES ('sponsor-uuid', 'Tech Corp', 'VP Engineering', 'Technology', 'hiring', 'pending');
```

### Try to Access Talent (Should Fail)

- [ ] Sponsor cannot see talent_profiles with status != 'approved'
- [ ] Sponsor cannot create recommendation_request while pending

### Admin Approves Sponsor

1. Go to `/admin`
2. Click "Sponsors" tab
3. Find pending sponsor
4. Click "Approve"

- [ ] Sponsor status changes to 'approved'
- [ ] Audit log entry created

### Sponsor Creates Request

1. As approved sponsor, call API:
```typescript
const { data, error } = await createRecommendationRequest(
  'approved-talent-id',
  "I'd like to discuss a VP role"
);
```

- [ ] Request created with status 'requested'
- [ ] Audit log entry created

---

## 6. Security Tests

### SQL Injection Attempt

Try submitting profile with SQL in fields:
```javascript
headline: "'; DROP TABLE talent_profiles; --"
```

- [ ] Input sanitized, no SQL error
- [ ] Table still exists

### Unauthorized Status Change

As talent user, try to update own status to 'approved':
```sql
-- This should fail with trigger
UPDATE talent_profiles SET status = 'approved' WHERE user_id = 'talent-uuid';
```

- [ ] Error: "Only admins can approve or reject profiles"

### File Upload Restrictions

- [ ] Try uploading .exe file - Should be rejected
- [ ] Try uploading 5MB+ file - Should be rejected
- [ ] Try uploading PDF - Should succeed

### Cross-User Access

As User A, try to access User B's data:
```typescript
// Should fail with 403
const { data } = await supabase
  .from('talent_profiles')
  .select('*')
  .eq('user_id', 'other-user-id');
```

- [ ] Returns empty or 403

---

## 7. Performance Tests

### Test Pagination

```typescript
// Should return only 10 results
const { data } = await getAllTalent({ limit: 10, offset: 0 });
```

- [ ] Returns correct page size
- [ ] Offset works correctly

### Test Dashboard Load

1. Load `/admin` with 100+ talent profiles
- [ ] Dashboard loads in < 2 seconds
- [ ] Metrics display correctly

### Test Indexes

```sql
-- Check query uses index
EXPLAIN ANALYZE SELECT * FROM talent_profiles WHERE status = 'approved';

-- Should show "Index Scan" not "Seq Scan"
```

- [ ] Index scan used for status queries

---

## 8. Edge Cases

### Duplicate Email

- [ ] Cannot create two profiles with same user_id

### Duplicate Request

Try creating second request from same sponsor to same talent:
```typescript
const { error } = await createRecommendationRequest(talentId, "Another message");
```

- [ ] Error: duplicate key violation

### Delete Profile with CV

1. As admin, delete talent profile with CV
- [ ] Profile deleted
- [ ] CV deleted from storage (if implemented)
- [ ] Related vetting_reviews deleted (cascade)

### Update Non-Existent Profile

- [ ] Graceful error handling

---

## 9. Integration Tests

### Full Flow

1. Talent signs up → submits profile
2. Admin reviews → approves talent
3. Sponsor signs up → gets approved
4. Sponsor browses approved talent
5. Sponsor creates recommendation request
6. Talent sees request
7. Admin monitors via dashboard

- [ ] All steps work end-to-end

### Export to CSV

1. Go to `/admin`
2. Click "Export CSV"
- [ ] CSV downloads successfully
- [ ] Contains correct data

---

## Test Results Summary

| Category | Passed | Failed | Notes |
|----------|--------|--------|-------|
| Schema | / | / | |
| Auth & Access | / | / | |
| Talent Flow | / | / | |
| Admin Flow | / | / | |
| Sponsor Flow | / | / | |
| Security | / | / | |
| Performance | / | / | |
| Edge Cases | / | / | |
| Integration | / | / | |

**Overall Status:** ⬜ PASS / ⬜ FAIL

**Date Tested:** ___________

**Tested By:** ___________
