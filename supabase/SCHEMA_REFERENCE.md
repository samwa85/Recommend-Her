# RecommendHer Schema Reference - Single Source of Truth

## 📋 FINAL TABLE STRUCTURES

---

### Table: `files`

**Purpose**: File metadata for CVs and attachments

| Column | Type | Default | Nullable | Constraints |
|--------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PRIMARY KEY |
| `owner_type` | text | - | NO | CHECK IN ('talent', 'sponsor', 'request', 'message') |
| `owner_id` | uuid | - | NO | - |
| `bucket` | text | 'recommendher-files' | NO | - |
| `path` | text | - | NO | UNIQUE |
| `file_name` | text | - | NO | - |
| `mime_type` | text | NULL | YES | - |
| `file_size` | bigint | NULL | YES | - |
| `public_url` | text | NULL | YES | - |
| `is_primary` | boolean | false | YES | - |
| `created_at` | timestamptz | NOW() | YES | - |

**Indexes**:
- `idx_files_owner` (owner_type, owner_id)
- `idx_files_created_at` (created_at DESC)
- `idx_files_owner_primary` (owner_type, owner_id, is_primary) WHERE is_primary = true

---

### Table: `talent_profiles`

**Purpose**: Talent/Candidate profiles

| Column | Type | Default | Nullable | Constraints |
|--------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PRIMARY KEY |
| `full_name` | text | - | NO | - |
| `email` | text | - | NO | UNIQUE |
| `phone` | text | NULL | YES | - |
| `location` | text | NULL | YES | - |
| `country` | text | 'Tanzania' | YES | - |
| `headline` | text | NULL | YES | - |
| `bio` | text | NULL | YES | - |
| `current_company` | text | NULL | YES | - |
| `current_title` | text | NULL | YES | - |
| `years_experience` | integer | NULL | YES | - |
| `industry` | text | NULL | YES | - |
| `role_category` | text | NULL | YES | - |
| `skills` | jsonb | '[]' | YES | - |
| `linkedin_url` | text | NULL | YES | - |
| `portfolio_url` | text | NULL | YES | - |
| `website_url` | text | NULL | YES | - |
| `cv_file_id` | uuid | NULL | YES | FOREIGN KEY → files(id) |
| `status` | text | 'pending' | NO | CHECK IN ('pending', 'approved', 'rejected', 'archived') |
| `source_page` | text | NULL | YES | - |
| `notes_admin` | text | NULL | YES | - |
| `created_at` | timestamptz | NOW() | YES | - |
| `updated_at` | timestamptz | NOW() | YES | - |

**Indexes**:
- `idx_talent_profiles_status` (status)
- `idx_talent_profiles_created_at` (created_at DESC)
- `idx_talent_profiles_status_created` (status, created_at DESC)
- `idx_talent_profiles_email` (email)
- `idx_talent_profiles_phone` (phone)
- `idx_talent_profiles_industry` (industry)
- `idx_talent_profiles_cv_file` (cv_file_id) WHERE cv_file_id IS NOT NULL

**Trigger**: `update_talent_profiles_updated_at` (on UPDATE)

---

### Table: `sponsor_profiles`

**Purpose**: Sponsor/Mentor/Recruiter profiles

| Column | Type | Default | Nullable | Constraints |
|--------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PRIMARY KEY |
| `full_name` | text | - | NO | - |
| `email` | text | - | NO | UNIQUE |
| `phone` | text | NULL | YES | - |
| `organization` | text | NULL | YES | - |
| `job_title` | text | NULL | YES | - |
| `industry` | text | NULL | YES | - |
| `linkedin_url` | text | NULL | YES | - |
| `sponsor_type` | text | 'individual' | YES | CHECK IN ('individual', 'company', 'community') |
| `commitment_level` | text | NULL | YES | - |
| `focus_areas` | jsonb | '[]' | YES | - |
| `status` | text | 'active' | YES | CHECK IN ('active', 'inactive', 'archived') |
| `notes_admin` | text | NULL | YES | - |
| `created_at` | timestamptz | NOW() | YES | - |
| `updated_at` | timestamptz | NOW() | YES | - |

**Indexes**:
- `idx_sponsor_profiles_status` (status)
- `idx_sponsor_profiles_created_at` (created_at DESC)
- `idx_sponsor_profiles_status_created` (status, created_at DESC)
- `idx_sponsor_profiles_email` (email)
- `idx_sponsor_profiles_organization` (organization)

**Trigger**: `update_sponsor_profiles_updated_at` (on UPDATE)

---

### Table: `requests`

**Purpose**: Recommendation requests and sponsorship introductions

| Column | Type | Default | Nullable | Constraints |
|--------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PRIMARY KEY |
| `request_type` | text | - | NO | CHECK IN ('recommendation', 'sponsorship_intro', 'talent_match', 'general') |
| `title` | text | NULL | YES | - |
| `description` | text | - | NO | - |
| `talent_id` | uuid | NULL | YES | FOREIGN KEY → talent_profiles(id) |
| `sponsor_id` | uuid | NULL | YES | FOREIGN KEY → sponsor_profiles(id) |
| `priority` | text | 'normal' | YES | CHECK IN ('low', 'normal', 'high', 'urgent') |
| `status` | text | 'open' | YES | CHECK IN ('open', 'in_review', 'approved', 'rejected', 'closed') |
| `assigned_admin_id` | uuid | NULL | YES | - |
| `due_date` | date | NULL | YES | - |
| `resolution_notes` | text | NULL | YES | - |
| `source_page` | text | NULL | YES | - |
| `created_at` | timestamptz | NOW() | YES | - |
| `updated_at` | timestamptz | NOW() | YES | - |

**Indexes**:
- `idx_requests_status` (status)
- `idx_requests_priority` (priority)
- `idx_requests_created_at` (created_at DESC)
- `idx_requests_status_priority` (status, priority, created_at DESC)
- `idx_requests_talent_id` (talent_id) WHERE talent_id IS NOT NULL
- `idx_requests_sponsor_id` (sponsor_id) WHERE sponsor_id IS NOT NULL
- `idx_requests_assigned` (assigned_admin_id) WHERE assigned_admin_id IS NOT NULL
- `idx_requests_due_date` (due_date) WHERE due_date IS NOT NULL

**Trigger**: `update_requests_updated_at` (on UPDATE)

---

### Table: `messages`

**Purpose**: Contact form submissions and inquiries

| Column | Type | Default | Nullable | Constraints |
|--------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PRIMARY KEY |
| `sender_name` | text | - | NO | - |
| `sender_email` | text | - | NO | - |
| `sender_phone` | text | NULL | YES | - |
| `subject` | text | NULL | YES | - |
| `message` | text | - | NO | - |
| `page_source` | text | NULL | YES | - |
| `status` | text | 'unread' | YES | CHECK IN ('unread', 'read', 'replied', 'archived', 'spam') |
| `handled_by_admin_id` | uuid | NULL | YES | - |
| `replied_at` | timestamptz | NULL | YES | - |
| `created_at` | timestamptz | NOW() | YES | - |

**Indexes**:
- `idx_messages_status` (status)
- `idx_messages_created_at` (created_at DESC)
- `idx_messages_status_created` (status, created_at DESC)
- `idx_messages_sender_email` (sender_email)
- `idx_messages_handled_by` (handled_by_admin_id) WHERE handled_by_admin_id IS NOT NULL

---

## 🔗 Relationships

```
talent_profiles.cv_file_id ────────> files.id (ONE-TO-ONE, nullable)
sponsor_profiles (no FKs)
requests.talent_id ────────────────> talent_profiles.id (MANY-TO-ONE, nullable)
requests.sponsor_id ───────────────> sponsor_profiles.id (MANY-TO-ONE, nullable)
messages (no FKs)
files.owner_id ────────────────────> polymorphic (talent_profiles.id OR sponsor_profiles.id OR requests.id OR messages.id)
```

---

## ✅ ENUM Values

### talent_profiles.status
- `pending` - Pending review
- `approved` - Approved and visible
- `rejected` - Rejected
- `archived` - Archived

### sponsor_profiles.sponsor_type
- `individual` - Individual sponsor
- `company` - Company/Organization
- `community` - Community group

### sponsor_profiles.status
- `active` - Active sponsor
- `inactive` - Inactive
- `archived` - Archived

### requests.request_type
- `recommendation` - Talent recommendation
- `sponsorship_intro` - Introduction to sponsor
- `talent_match` - Match talent to opportunity
- `general` - General inquiry

### requests.priority
- `low` - Low priority
- `normal` - Normal priority
- `high` - High priority
- `urgent` - Urgent

### requests.status
- `open` - Open request
- `in_review` - Under review
- `approved` - Approved
- `rejected` - Rejected
- `closed` - Closed

### messages.status
- `unread` - Unread message
- `read` - Read
- `replied` - Replied
- `archived` - Archived
- `spam` - Marked as spam

### files.owner_type
- `talent` - Belongs to talent profile
- `sponsor` - Belongs to sponsor profile
- `request` - Belongs to request
- `message` - Belongs to message

---

## 📊 Views

### v_talent_status_counts
```sql
SELECT status, count, last_7_days, last_30_days
FROM v_talent_status_counts;
```

### v_sponsor_status_counts
```sql
SELECT status, count, last_7_days
FROM v_sponsor_status_counts;
```

### v_request_status_counts
```sql
SELECT status, priority, count, last_7_days
FROM v_request_status_counts;
```

### v_message_status_counts
```sql
SELECT status, count, last_24_hours
FROM v_message_status_counts;
```

---

## ⚙️ Functions

### get_dashboard_metrics()
Returns: `total_talent, pending_talent, approved_talent, rejected_talent, total_sponsors, active_sponsors, total_requests, open_requests, total_messages, unread_messages, new_talent_7d, new_sponsors_7d`

### get_submissions_trend(days INTEGER)
Returns: `date, talent_count, sponsor_count, request_count, message_count`

---

## 🔐 RLS Policies Summary

| Table | INSERT | SELECT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| talent_profiles | Public | Public (approved only), Auth (all) | Auth | Auth |
| sponsor_profiles | Public | Auth | Auth | Auth |
| requests | Public | Auth | Auth | Auth |
| messages | Public | Auth | Auth | Auth |
| files | Public | Auth | Auth | Auth |

---

## 📁 Storage

**Bucket**: `recommendher-files` (Public)

**Folder Structure**:
```
recommendher-files/
├── talent/{talent_id}/cv/{timestamp}_{filename}
├── sponsor/{sponsor_id}/documents/{filename}
├── request/{request_id}/attachments/{filename}
└── message/{message_id}/attachments/{filename}
```

---

## 📝 TypeScript Mapping

See `schema.types.ts` for complete TypeScript interfaces:

```typescript
interface TalentProfile {
  id: string;
  full_name: string;
  email: string;
  // ... all columns
}

type TalentStatus = 'pending' | 'approved' | 'rejected' | 'archived';
```

---

## ✅ Schema Verification

Run this to verify schema:

```sql
-- Check tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check constraints
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace;
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-12  
**Schema File**: `001_recommendher_schema.sql`
