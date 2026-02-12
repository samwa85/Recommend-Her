# RecommendHer Supabase Schema

Complete database schema for RecommendHer Admin platform.

---

## 📦 Contents

| File | Description |
|------|-------------|
| `001_recommendher_schema.sql` | Core tables, indexes, RLS policies, functions |
| `002_storage_setup.sql` | Storage bucket policies and helpers |
| `schema.types.ts` | TypeScript type definitions |
| `SETUP_INSTRUCTIONS.md` | Step-by-step setup guide |
| `seed_sample_data.sql` | Sample data for testing |
| `README.md` | This file |

---

## 🏗️ Schema Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ talent_profiles │────<│     requests     │>────│sponsor_profiles │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │                                               │
         │                    ┌──────────────────┐       │
         └───────────────────<│      files       │>──────┘
                            └──────────────────┘
                                     ▲
                                     │
                            ┌──────────────────┐
                            │     messages     │
                            └──────────────────┘
```

---

## 📊 Tables

### 1. `talent_profiles`
Talent/Candidate information
- **PK**: `id` (uuid)
- **Unique**: `email`
- **FK**: `cv_file_id` → `files.id`
- **Status**: `pending` | `approved` | `rejected` | `archived`

### 2. `sponsor_profiles`
Sponsor/Mentor/Recruiter information
- **PK**: `id` (uuid)
- **Unique**: `email`
- **Status**: `active` | `inactive` | `archived`
- **Type**: `individual` | `company` | `community`

### 3. `requests`
Recommendation requests and introductions
- **PK**: `id` (uuid)
- **FK**: `talent_id` → `talent_profiles.id` (nullable)
- **FK**: `sponsor_id` → `sponsor_profiles.id` (nullable)
- **Type**: `recommendation` | `sponsorship_intro` | `talent_match` | `general`
- **Priority**: `low` | `normal` | `high` | `urgent`
- **Status**: `open` | `in_review` | `approved` | `rejected` | `closed`

### 4. `messages`
Contact form submissions
- **PK**: `id` (uuid)
- **Status**: `unread` | `read` | `replied` | `archived` | `spam`

### 5. `files`
File metadata for CVs and attachments
- **PK**: `id` (uuid)
- **Owner**: `owner_type` + `owner_id` (polymorphic)
- **Storage**: `bucket` + `path`

---

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

| Operation | Public | Authenticated |
|-----------|--------|---------------|
| INSERT | ✅ Yes | ✅ Yes |
| SELECT | ⚠️ Limited* | ✅ Yes |
| UPDATE | ❌ No | ✅ Yes |
| DELETE | ❌ No | ✅ Yes |

*Public can only SELECT approved talent profiles

### Storage

Bucket: `recommendher-files`
- Public bucket (for CV downloads)
- Folder structure by owner type
- Policies control upload/download access

---

## 📈 Analytics

### Views
- `v_talent_status_counts` - Talent counts by status
- `v_sponsor_status_counts` - Sponsor counts by status
- `v_request_status_counts` - Request counts by status/priority
- `v_message_status_counts` - Message counts by status

### Functions
- `get_dashboard_metrics()` - KPI data for dashboard
- `get_submissions_trend(days)` - Time-series data for charts

---

## 🚀 Quick Start

```bash
# 1. Create Supabase project
# Go to https://supabase.com and create a new project

# 2. Run schema migration
# In Supabase SQL Editor, run:
# - 001_recommendher_schema.sql
# - 002_storage_setup.sql

# 3. Create storage bucket
# In Supabase Storage, create bucket: "recommendher-files"

# 4. Set up environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 5. Seed sample data (optional)
# Run: seed_sample_data.sql
```

---

## 📝 TypeScript Usage

```typescript
import { 
  TalentProfile, 
  SponsorProfile, 
  Request, 
  Message, 
  File,
  TalentStatus,
  RequestPriority 
} from './schema.types';

// Insert talent
const talent: TalentProfileInput = {
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  headline: 'Software Engineer',
  skills: ['React', 'TypeScript'],
  status: 'pending'
};

// Type-safe status checks
const isApproved = (status: TalentStatus) => status === 'approved';
```

---

## 🔍 Common Queries

### Get talent with CV
```sql
SELECT t.*, f.path as cv_path
FROM talent_profiles t
LEFT JOIN files f ON t.cv_file_id = f.id
WHERE t.status = 'approved';
```

### Get requests with talent and sponsor
```sql
SELECT 
  r.*,
  t.full_name as talent_name,
  s.full_name as sponsor_name
FROM requests r
LEFT JOIN talent_profiles t ON r.talent_id = t.id
LEFT JOIN sponsor_profiles s ON r.sponsor_id = s.id
WHERE r.status = 'open';
```

### Get dashboard metrics
```sql
SELECT * FROM get_dashboard_metrics();
```

### Get submission trend
```sql
SELECT * FROM get_submissions_trend(30); -- Last 30 days
```

---

## 🔄 Migrations

### Create new migration
```bash
# Using Supabase CLI
supabase migration new add_new_feature

# Or manually
# Create file: 003_add_new_feature.sql
```

### Apply migrations
```bash
supabase db push
```

---

## 🛠️ Maintenance

### Backup
```bash
# Using Supabase CLI
supabase db dump > backup.sql
```

### Reset (DANGER: Deletes all data)
```bash
supabase db reset
```

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All 5 tables created
- [ ] RLS enabled on all tables
- [ ] Indexes created (15 total)
- [ ] Storage bucket created
- [ ] Storage policies configured
- [ ] Sample data inserted
- [ ] Dashboard metrics function works
- [ ] TypeScript types match schema

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-12  
**Schema Hash**: (run `md5sum 001_recommendher_schema.sql`)
