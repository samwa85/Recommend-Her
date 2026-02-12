# RecommendHer Backend Hardening

## Overview

This migration implements a production-ready backend for the RecommendHer platform with:
- Complete database schema with 7 core tables
- Secure Row Level Security (RLS) policies
- Stored procedures for business logic
- Audit logging for all admin actions
- Performance indexes
- Admin views for dashboards

## Database Schema

### Tables Created

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | Core user profiles (links to auth.users) | role, contact info |
| `talent_profiles` | Extended talent information | status workflow, skills, CV |
| `sponsor_profiles` | Sponsor applications | type, commitment, verification |
| `vetting_reviews` | Admin review records | decision, feedback, notes |
| `recommendation_requests` | Sponsor → Talent requests | status workflow |
| `opportunity_outcomes` | Hiring outcomes | offer, hired, etc. |
| `audit_logs` | Complete audit trail | actor, action, entity |

### Views Created

| View | Purpose |
|------|---------|
| `v_pending_talent_reviews` | Talent awaiting approval |
| `v_pending_sponsor_approvals` | Sponsors awaiting approval |
| `v_public_talent_profiles` | What sponsors see (approved only) |
| `v_admin_dashboard_metrics` | Dashboard counts |
| `v_recommendation_requests_detail` | Requests with joined data |

### Functions (RPC)

| Function | Purpose | Access |
|----------|---------|--------|
| `submit_talent_profile()` | Talent submits profile | Authenticated |
| `admin_review_talent()` | Admin approves/rejects | Admin only |
| `admin_review_sponsor()` | Admin approves sponsor | Admin only |
| `create_recommendation_request()` | Sponsor requests intro | Approved sponsors |
| `update_request_status()` | Update request state | Related users |
| `record_outcome()` | Record hiring outcome | Sponsor/Admin |
| `write_audit_log()` | Write audit entry | Service role |

## RLS Security Summary

### Policies By Role

**Talent Users:**
- Read/update own profile only
- Cannot see other talent
- Cannot change status to approved/rejected

**Sponsor Users:**
- Read/update own profile only
- Can ONLY see approved talent (via view)
- Can only create requests when approved
- Cannot see CVs without permission

**Admin Users:**
- Full read/write on all tables
- Can approve/reject profiles
- Can view audit logs
- Can delete records

**Anonymous Users:**
- No access to any data
- Cannot read any profiles

## Status Workflows

### Talent Profile Status
```
draft → submitted → vetted → approved
              ↓           ↓
          rejected    rejected
```

### Sponsor Profile Status
```
pending → approved
     ↓
  rejected
```

### Recommendation Request Status
```
requested → accepted → intro_sent → closed
       ↓         ↓
   declined  declined
```

## Test Checklist

### Authentication & Authorization

- [ ] Unauthenticated user cannot access any data
- [ ] Talent can only see their own profile
- [ ] Talent cannot see other talent profiles
- [ ] Sponsor cannot see unapproved talent
- [ ] Sponsor cannot see talent CVs
- [ ] Admin can see all data
- [ ] Non-admin cannot approve/reject profiles (blocked by trigger)

### Talent Submission Flow

- [ ] Talent can submit profile (status = submitted)
- [ ] Talent can update while pending
- [ ] CV uploads to storage with correct path
- [ ] CV file size limited to 3MB
- [ ] Only PDF/DOC/DOCX allowed
- [ ] Audit log created on submit

### Admin Review Flow

- [ ] Admin sees pending talent in dashboard
- [ ] Admin can approve talent (status = approved)
- [ ] Admin can reject talent (status = rejected)
- [ ] Admin can request changes (status stays submitted)
- [ ] Feedback stored for talent viewing
- [ ] Internal notes stay private
- [ ] Audit log created for each action
- [ ] Vetting review record created

### Sponsor Flow

- [ ] Sponsor can create profile (status = pending)
- [ ] Sponsor cannot create requests while pending
- [ ] Sponsor can see approved talent only
- [ ] Sponsor can create request to approved talent
- [ ] Sponsor can update request status
- [ ] Status transitions enforced (can't skip states)

### Security Tests

- [ ] SQL injection attempts blocked
- [ ] XSS in profile fields handled
- [ ] File upload restricted by type
- [ ] File upload restricted by size
- [ ] Cannot access other user's files
- [ ] Audit logs immutable

### Performance Tests

- [ ] Query with pagination works
- [ ] Indexes improve query speed
- [ ] Large dataset loads efficiently
- [ ] Dashboard metrics load quickly

## API Usage Examples

### Submit Talent Profile
```typescript
const { data, error } = await submitTalentProfile({
  headline: "Senior Product Manager",
  bio: "Experienced in fintech...",
  years_experience: 8,
  industry: "Technology",
  seniority_level: "Senior Level",
  functions: ["Product", "Strategy"],
  skills: ["Product Management", "Agile"],
  languages: ["English", "Spanish"],
  linkedin_url: "https://linkedin.com/in/jane",
  portfolio_url: "https://jane.com",
  cv_file_path: "user-id/timestamp-file.pdf"
});
```

### Admin Review Talent
```typescript
const { data, error } = await adminReviewTalent(talentId, {
  decision: 'approved', // 'approved' | 'rejected' | 'needs_changes'
  feedback_to_talent: "Great profile! Welcome to the network.",
  internal_notes: "Strong background in leadership"
});
```

### Create Recommendation Request
```typescript
const { data, error } = await createRecommendationRequest(
  talentId,
  "I'd like to discuss a VP role at my company"
);
```

## How to Verify Setup

1. **Check tables exist:**
```sql
\dt public.*
```

2. **Check views exist:**
```sql
\dv public.*
```

3. **Check functions exist:**
```sql
SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace;
```

4. **Check RLS enabled:**
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

5. **Check indexes:**
```sql
\di public.*
```

## Changes Summary

### Database Changes
- ✅ Dropped old `talent_profiles` table
- ✅ Created 7 new tables with proper constraints
- ✅ Created 5 admin views
- ✅ Created 8 RPC functions
- ✅ Added 20+ indexes for performance
- ✅ Enabled RLS on all tables
- ✅ Created security triggers
- ✅ Set up audit logging

### Frontend Changes
- ✅ Updated `src/lib/database.types.ts` - Complete type definitions
- ✅ Updated `src/lib/supabase.ts` - API client with all methods
- ✅ Updated `src/lib/storage.ts` - Storage helpers with validation
- ✅ Updated `src/pages/ForTalent.tsx` - New schema form
- ✅ Updated `src/pages/AdminDashboard.tsx` - Full admin workflow

### Security Improvements
- ✅ RLS policies on all tables
- ✅ Security trigger prevents non-admin status changes
- ✅ Audit logs for all admin actions
- ✅ File upload validation (type, size)
- ✅ Row-level access control

### Performance Improvements
- ✅ Indexes on all foreign keys
- ✅ Indexes on status fields
- ✅ GIN indexes on array fields (skills, functions)
- ✅ Pagination support in API
- ✅ Optimized views for dashboard

## Next Steps

1. **Test the migration** - Run through the test checklist
2. **Set up Supabase Auth** - Configure email/password or OAuth providers
3. **Configure email notifications** - Set up Supabase hooks or Edge Functions
4. **Deploy to staging** - Test in production-like environment
5. **Monitor audit logs** - Regular review of admin actions
6. **Set up backups** - Regular database backups

## Support

For issues or questions:
1. Check Supabase logs in Coolify dashboard
2. Review audit_logs table for debugging
3. Check browser console for frontend errors
