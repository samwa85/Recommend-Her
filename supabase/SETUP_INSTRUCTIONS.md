# RecommendHer Supabase Setup Instructions

## 📋 Prerequisites

- Supabase project created (https://supabase.com)
- Supabase CLI installed (optional but recommended)
- PostgreSQL 14+ (Supabase uses this)

---

## 🚀 Quick Setup

### Step 1: Run the Schema Migration

#### Option A: Via Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase Dashboard → SQL Editor
2. Create a "New Query"
3. Copy the contents of `001_recommendher_schema.sql`
4. Paste into the SQL Editor
5. Click "Run"
6. Repeat for `002_storage_setup.sql`

#### Option B: Via Supabase CLI

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option C: Via psql

```bash
# Connect to your Supabase database
psql -h db.your-project.supabase.co -p 5432 -d postgres -U postgres

# Run the migration
\i 001_recommendher_schema.sql
\i 002_storage_setup.sql
```

---

## 📦 Step 2: Create Storage Bucket

### Via Supabase Dashboard

1. Go to Storage → Buckets
2. Click "New Bucket"
3. Name: `recommendher-files`
4. Check "Public bucket" (for CV downloads)
5. Click "Save"

### Via Supabase CLI

```bash
supabase storage create recommendher-files
```

---

## 🔐 Step 3: Configure Storage Policies

### Via Supabase Dashboard

1. Go to Storage → Policies
2. Select `recommendher-files` bucket
3. Add these policies:

#### Policy 1: Public Upload
- **Name**: Public can upload files
- **Allowed operation**: INSERT
- **Target roles**: anon, authenticated
- **Policy definition**: `(storage.foldername(name))[1] IN ('talent', 'sponsor', 'request', 'message')`

#### Policy 2: Public Read
- **Name**: Public can read files
- **Allowed operation**: SELECT
- **Target roles**: anon, authenticated
- **Policy definition**: `(storage.foldername(name))[1] = 'talent'`

#### Policy 3: Admin Full Access
- **Name**: Admin full access
- **Allowed operation**: ALL
- **Target roles**: authenticated
- **Policy definition**: `true`

---

## 🔄 Step 4: Update Environment Variables

Add to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Storage
VITE_STORAGE_BUCKET=recommendher-files
VITE_STORAGE_URL=https://your-project-ref.supabase.co/storage/v1
```

**Important**: Never expose the service_role key in frontend code!

---

## ✅ Step 5: Verify Setup

### Test Database Connection

```sql
-- Run in Supabase SQL Editor
SELECT * FROM get_dashboard_metrics();
```

Expected result: A single row with counts (all zeros initially)

### Test Table Creation

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('talent_profiles', 'sponsor_profiles', 'requests', 'messages', 'files');
```

Expected: 5 rows returned

### Test RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('talent_profiles', 'sponsor_profiles', 'requests', 'messages', 'files');
```

Expected: All should show `true` for rowsecurity

---

## 📊 Final Table Schema Summary

### Table: `files`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| owner_type | text | NOT NULL, CHECK IN ('talent', 'sponsor', 'request', 'message') |
| owner_id | uuid | NOT NULL |
| bucket | text | NOT NULL, DEFAULT 'recommendher-files' |
| path | text | NOT NULL, UNIQUE |
| file_name | text | NOT NULL |
| mime_type | text | |
| file_size | bigint | |
| public_url | text | |
| is_primary | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT NOW() |

### Table: `talent_profiles`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| full_name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| phone | text | |
| location | text | |
| country | text | DEFAULT 'Tanzania' |
| headline | text | |
| bio | text | |
| current_company | text | |
| current_title | text | |
| years_experience | integer | |
| industry | text | |
| role_category | text | |
| skills | jsonb | DEFAULT '[]' |
| linkedin_url | text | |
| portfolio_url | text | |
| website_url | text | |
| cv_file_id | uuid | FK → files.id |
| status | text | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'approved', 'rejected', 'archived') |
| source_page | text | |
| notes_admin | text | |
| created_at | timestamptz | DEFAULT NOW() |
| updated_at | timestamptz | DEFAULT NOW() |

### Table: `sponsor_profiles`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| full_name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| phone | text | |
| organization | text | |
| job_title | text | |
| industry | text | |
| linkedin_url | text | |
| sponsor_type | text | DEFAULT 'individual', CHECK IN ('individual', 'company', 'community') |
| commitment_level | text | |
| focus_areas | jsonb | DEFAULT '[]' |
| status | text | DEFAULT 'active', CHECK IN ('active', 'inactive', 'archived') |
| notes_admin | text | |
| created_at | timestamptz | DEFAULT NOW() |
| updated_at | timestamptz | DEFAULT NOW() |

### Table: `requests`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| request_type | text | NOT NULL, CHECK IN ('recommendation', 'sponsorship_intro', 'talent_match', 'general') |
| title | text | |
| description | text | NOT NULL |
| talent_id | uuid | FK → talent_profiles.id |
| sponsor_id | uuid | FK → sponsor_profiles.id |
| priority | text | DEFAULT 'normal', CHECK IN ('low', 'normal', 'high', 'urgent') |
| status | text | DEFAULT 'open', CHECK IN ('open', 'in_review', 'approved', 'rejected', 'closed') |
| assigned_admin_id | uuid | |
| due_date | date | |
| resolution_notes | text | |
| source_page | text | |
| created_at | timestamptz | DEFAULT NOW() |
| updated_at | timestamptz | DEFAULT NOW() |

### Table: `messages`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| sender_name | text | NOT NULL |
| sender_email | text | NOT NULL |
| sender_phone | text | |
| subject | text | |
| message | text | NOT NULL |
| page_source | text | |
| status | text | DEFAULT 'unread', CHECK IN ('unread', 'read', 'replied', 'archived', 'spam') |
| handled_by_admin_id | uuid | |
| replied_at | timestamptz | |
| created_at | timestamptz | DEFAULT NOW() |

---

## 📁 Storage Folder Structure

```
recommendher-files/
├── talent/
│   └── {talent_id}/
│       └── cv/
│           └── {timestamp}_{filename}.pdf
├── sponsor/
│   └── {sponsor_id}/
│       └── documents/
├── request/
│   └── {request_id}/
│       └── attachments/
└── message/
    └── {message_id}/
        └── attachments/
```

---

## 🔍 Indexes Created

### talent_profiles
- idx_talent_profiles_status
- idx_talent_profiles_created_at
- idx_talent_profiles_status_created
- idx_talent_profiles_email
- idx_talent_profiles_phone
- idx_talent_profiles_industry
- idx_talent_profiles_cv_file

### sponsor_profiles
- idx_sponsor_profiles_status
- idx_sponsor_profiles_created_at
- idx_sponsor_profiles_status_created
- idx_sponsor_profiles_email
- idx_sponsor_profiles_organization

### requests
- idx_requests_status
- idx_requests_priority
- idx_requests_created_at
- idx_requests_status_priority
- idx_requests_talent_id
- idx_requests_sponsor_id
- idx_requests_assigned
- idx_requests_due_date

### messages
- idx_messages_status
- idx_messages_created_at
- idx_messages_status_created
- idx_messages_sender_email
- idx_messages_handled_by

### files
- idx_files_owner
- idx_files_created_at
- idx_files_owner_primary

---

## 🔒 RLS Policies Summary

| Table | Public | Authenticated |
|-------|--------|---------------|
| talent_profiles | INSERT, SELECT (approved only) | ALL |
| sponsor_profiles | INSERT | ALL |
| requests | INSERT | ALL |
| messages | INSERT | ALL |
| files | INSERT | ALL |

**Note**: In production, replace `authenticated` with a proper admin check function.

---

## 📈 Analytics Functions

### `get_dashboard_metrics()`
Returns aggregate counts for dashboard KPIs.

### `get_submissions_trend(days INTEGER)`
Returns time-series data for charts.

---

## 🛠️ Troubleshooting

### Issue: "permission denied for table"
**Solution**: RLS is enabled but no policies match. Check your user role (anon vs authenticated).

### Issue: "bucket not found"
**Solution**: Create the storage bucket manually in Dashboard or via CLI.

### Issue: "violates check constraint"
**Solution**: Ensure status values match exactly: 'pending', 'approved', etc. (lowercase).

### Issue: "unique constraint violation"
**Solution**: Email addresses must be unique across talent/sponsor profiles.

---

## 🔄 Migration History

| Version | File | Description |
|---------|------|-------------|
| 001 | 001_recommendher_schema.sql | Core tables, indexes, RLS |
| 002 | 002_storage_setup.sql | Storage policies |

---

## 📝 Next Steps

1. ✅ Run schema migration
2. ✅ Create storage bucket
3. ✅ Configure storage policies
4. ✅ Update environment variables
5. ✅ Test with sample data
6. ⏭️ Set up admin authentication (custom implementation)
7. ⏭️ Configure email notifications (optional)

---

**Setup Date**: 2026-02-12
**Schema Version**: 1.0.0
