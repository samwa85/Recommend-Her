# RecommendHer Database Schema Reference

**Last Updated:** 2026-02-14  
**Version:** 2.0

---

## Overview

This document describes the complete database schema for the RecommendHer platform, designed to support the admin dashboard with pages for **Overview**, **Talent**, **Sponsors**, **Requests**, **Messages**, and **Analytics**.

---

## Tables Summary

| Table | Description | Admin Page |
|-------|-------------|------------|
| `talent_profiles` | Talent/candidate submissions | Talent |
| `sponsor_profiles` | Sponsor/mentor profiles | Sponsors |
| `requests` | Recommendation & intro requests | Requests |
| `messages` | Contact form submissions | Messages |
| `files` | CV & document storage metadata | All (via relations) |
| `admin_users` | Admin dashboard users | Settings |
| `audit_logs` | Action tracking | Activity Log |

---

## Table Definitions

### 1. `files`

File metadata for CVs and attachments stored in Supabase Storage.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `owner_type` | TEXT | NO | - | One of: `talent`, `sponsor`, `request`, `message` |
| `owner_id` | UUID | NO | - | ID of the owner record |
| `bucket` | TEXT | NO | `'recommendher-files'` | Storage bucket name |
| `path` | TEXT | NO | - | Unique storage path |
| `file_name` | TEXT | NO | - | Original filename |
| `mime_type` | TEXT | YES | - | File MIME type |
| `file_size` | BIGINT | YES | - | File size in bytes |
| `public_url` | TEXT | YES | - | Public access URL |
| `is_primary` | BOOLEAN | NO | `false` | Main CV flag |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Upload timestamp |

**Storage Path Convention:**
```
talent/{talent_id}/cv/{timestamp}_{filename}
sponsor/{sponsor_id}/attachments/{timestamp}_{filename}
request/{request_id}/attachments/{timestamp}_{filename}
message/{message_id}/attachments/{timestamp}_{filename}
```

---

### 2. `talent_profiles`

Stores all "For Talent" form submissions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `full_name` | TEXT | NO | - | Full name |
| `email` | TEXT | NO | - | Email (unique) |
| `phone` | TEXT | YES | - | Phone number |
| `location` | TEXT | YES | - | City/region |
| `country` | TEXT | NO | `'Tanzania'` | Country |
| `headline` | TEXT | YES | - | Professional headline |
| `bio` | TEXT | YES | - | Bio/about text |
| `current_company` | TEXT | YES | - | Current employer |
| `current_title` | TEXT | YES | - | Current job title |
| `years_experience` | INTEGER | YES | - | Years of experience |
| `industry` | TEXT | YES | - | Industry field |
| `role_category` | TEXT | YES | - | Role category |
| `skills` | JSONB | NO | `'[]'::jsonb` | Array of skills |
| `linkedin_url` | TEXT | YES | - | LinkedIn profile URL |
| `portfolio_url` | TEXT | YES | - | Portfolio website URL |
| `website_url` | TEXT | YES | - | Personal website URL |
| `cv_file_id` | UUID | YES | - | FK to `files.id` |
| `status` | TEXT | NO | `'pending'` | Status (see below) |
| `source_page` | TEXT | YES | - | Source page tracking |
| `notes_admin` | TEXT | YES | - | Internal admin notes |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp |

**Status Values:** `pending` | `approved` | `rejected` | `archived`

---

### 3. `sponsor_profiles`

Stores "For Sponsors" form submissions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `full_name` | TEXT | NO | - | Full name |
| `email` | TEXT | NO | - | Email (unique) |
| `phone` | TEXT | YES | - | Phone number |
| `organization` | TEXT | YES | - | Company/organization |
| `job_title` | TEXT | YES | - | Job title |
| `industry` | TEXT | YES | - | Industry field |
| `linkedin_url` | TEXT | YES | - | LinkedIn profile URL |
| `sponsor_type` | TEXT | NO | `'individual'` | Type (see below) |
| `commitment_level` | TEXT | YES | - | Commitment type |
| `focus_areas` | JSONB | NO | `'[]'::jsonb` | Focus areas array |
| `status` | TEXT | NO | `'active'` | Status (see below) |
| `notes_admin` | TEXT | YES | - | Internal admin notes |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp |

**Sponsor Types:** `individual` | `company` | `community`  
**Status Values:** `active` | `inactive` | `archived`

---

### 4. `requests`

Recommendation requests, sponsorship intros, and talent matching.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `request_type` | TEXT | NO | - | Type (see below) |
| `title` | TEXT | YES | - | Request title/summary |
| `description` | TEXT | NO | - | Detailed description |
| `talent_id` | UUID | YES | - | FK to `talent_profiles.id` |
| `sponsor_id` | UUID | YES | - | FK to `sponsor_profiles.id` |
| `priority` | TEXT | NO | `'normal'` | Priority level |
| `status` | TEXT | NO | `'open'` | Status (see below) |
| `assigned_admin_id` | UUID | YES | - | FK to `admin_users.id` |
| `due_date` | DATE | YES | - | Due date |
| `resolution_notes` | TEXT | YES | - | Resolution details |
| `source_page` | TEXT | YES | - | Source page tracking |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp |

**Request Types:** `recommendation` | `sponsorship_intro` | `talent_match` | `general`  
**Priority Values:** `low` | `normal` | `high` | `urgent`  
**Status Values:** `open` | `in_review` | `approved` | `rejected` | `closed`

---

### 5. `messages`

Contact form submissions and inquiries.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `sender_name` | TEXT | NO | - | Sender's name |
| `sender_email` | TEXT | NO | - | Sender's email |
| `sender_phone` | TEXT | YES | - | Sender's phone |
| `subject` | TEXT | YES | - | Message subject |
| `message` | TEXT | NO | - | Message content |
| `page_source` | TEXT | YES | - | Source page |
| `status` | TEXT | NO | `'unread'` | Status (see below) |
| `handled_by_admin_id` | UUID | YES | - | FK to `admin_users.id` |
| `replied_at` | TIMESTAMPTZ | YES | - | Reply timestamp |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |

**Status Values:** `unread` | `read` | `replied` | `archived` | `spam`

---

### 6. `admin_users`

Admin dashboard users with role-based access.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `auth_user_id` | UUID | YES | - | Supabase Auth user ID |
| `full_name` | TEXT | NO | - | Full name |
| `email` | TEXT | NO | - | Email (unique) |
| `avatar_url` | TEXT | YES | - | Avatar image URL |
| `role` | TEXT | NO | `'admin'` | Role (see below) |
| `is_active` | BOOLEAN | NO | `true` | Active status |
| `last_login_at` | TIMESTAMPTZ | YES | - | Last login timestamp |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp |

**Roles:** `super_admin` | `admin` | `viewer`

---

### 7. `audit_logs`

Audit trail for all admin actions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `admin_id` | UUID | YES | - | FK to `admin_users.id` |
| `admin_email` | TEXT | YES | - | Email at action time |
| `action` | TEXT | NO | - | Action type (see below) |
| `entity_type` | TEXT | NO | - | Entity type (see below) |
| `entity_id` | UUID | YES | - | Affected entity ID |
| `before_data` | JSONB | YES | - | State before action |
| `after_data` | JSONB | YES | - | State after action |
| `ip_address` | TEXT | YES | - | Client IP address |
| `user_agent` | TEXT | YES | - | Client user agent |
| `metadata` | JSONB | NO | `'{}'::jsonb` | Additional metadata |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Action timestamp |

**Actions:** `created` | `updated` | `deleted` | `status_changed` | `viewed` | `downloaded` | `exported` | `logged_in` | `logged_out`  
**Entity Types:** `talent` | `sponsor` | `request` | `message` | `file` | `admin_user` | `system`

---

## Relationships

```
files ←───────────────── talent_profiles (cv_file_id)
    │
    └── owner_id ─────── talent_profiles (owner_type='talent')
                       sponsor_profiles (owner_type='sponsor')
                       requests (owner_type='request')
                       messages (owner_type='message')

talent_profiles ←─────── requests (talent_id)
sponsor_profiles ←────── requests (sponsor_id)
admin_users ←─────────── requests (assigned_admin_id)
admin_users ←─────────── messages (handled_by_admin_id)
admin_users ←─────────── audit_logs (admin_id)
```

---

## Indexes

### Performance Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `talent_profiles` | `idx_talent_profiles_status` | Filter by status |
| `talent_profiles` | `idx_talent_profiles_created_at` | Sort by date |
| `talent_profiles` | `idx_talent_profiles_email` | Email lookup |
| `talent_profiles` | `idx_talent_profiles_industry` | Filter by industry |
| `sponsor_profiles` | `idx_sponsor_profiles_status` | Filter by status |
| `sponsor_profiles` | `idx_sponsor_profiles_created_at` | Sort by date |
| `sponsor_profiles` | `idx_sponsor_profiles_email` | Email lookup |
| `sponsor_profiles` | `idx_sponsor_profiles_organization` | Organization search |
| `requests` | `idx_requests_status` | Filter by status |
| `requests` | `idx_requests_priority` | Filter by priority |
| `requests` | `idx_requests_created_at` | Sort by date |
| `requests` | `idx_requests_talent_id` | Talent lookup |
| `requests` | `idx_requests_sponsor_id` | Sponsor lookup |
| `messages` | `idx_messages_status` | Filter by status |
| `messages` | `idx_messages_created_at` | Sort by date |
| `messages` | `idx_messages_sender_email` | Email lookup |
| `files` | `idx_files_owner` | Owner lookup |
| `admin_users` | `idx_admin_users_email` | Email lookup |
| `admin_users` | `idx_admin_users_role` | Role filter |
| `audit_logs` | `idx_audit_logs_admin_id` | Admin lookup |
| `audit_logs` | `idx_audit_logs_entity_type` | Entity filter |
| `audit_logs` | `idx_audit_logs_created_at` | Sort by date |

---

## Functions

### `get_dashboard_metrics()`

Returns aggregate metrics for the admin dashboard overview.

```sql
SELECT * FROM get_dashboard_metrics();
```

**Returns:**
- `total_talent`, `pending_talent`, `approved_talent`, `rejected_talent`
- `total_sponsors`, `active_sponsors`
- `total_requests`, `open_requests`
- `total_messages`, `unread_messages`
- `new_talent_7d`, `new_sponsors_7d`

### `update_updated_at_column()`

Trigger function that automatically updates the `updated_at` column on record modification.

---

## Storage Bucket

### `recommendher-files`

Public bucket for storing:
- Talent CVs (PDF, DOC, DOCX)
- Sponsor documents
- Request attachments
- Message attachments

**Folder Structure:**
```
talent/{talent_id}/cv/{timestamp}_{filename}
sponsor/{sponsor_id}/attachments/{timestamp}_{filename}
request/{request_id}/attachments/{timestamp}_{filename}
message/{message_id}/attachments/{timestamp}_{filename}
```

---

## Status Enums Summary

### Talent Status
| Status | Label | Color |
|--------|-------|-------|
| `pending` | Pending Review | Yellow |
| `approved` | Approved | Green |
| `rejected` | Rejected | Red |
| `archived` | Archived | Gray |

### Sponsor Status
| Status | Label | Color |
|--------|-------|-------|
| `active` | Active | Green |
| `inactive` | Inactive | Gray |
| `archived` | Archived | Gray |

### Request Status
| Status | Label | Color |
|--------|-------|-------|
| `open` | Open | Blue |
| `in_review` | In Review | Yellow |
| `approved` | Approved | Green |
| `rejected` | Rejected | Red |
| `closed` | Closed | Gray |

### Message Status
| Status | Label | Color |
|--------|-------|-------|
| `unread` | Unread | Blue |
| `read` | Read | Gray |
| `replied` | Replied | Green |
| `archived` | Archived | Gray |
| `spam` | Spam | Red |

---

## Admin Dashboard Page Mapping

| Page | Primary Table | Relations |
|------|---------------|-----------|
| Overview | All (aggregated) | - |
| Talent | `talent_profiles` | `files` (CV) |
| Sponsors | `sponsor_profiles` | - |
| Requests | `requests` | `talent_profiles`, `sponsor_profiles`, `admin_users` |
| Messages | `messages` | `admin_users` |
| Analytics | All (aggregated) | - |
| Activity | `audit_logs` | `admin_users` |

---

## Migration Files

1. `001_recommendher_schema.sql` - Core tables (files, talent, sponsors, requests, messages)
2. `002_storage_setup.sql` - Storage bucket policies
3. `003_admin_and_audit.sql` - Admin users and audit logs

---

## TypeScript Types

All types are defined in `src/lib/database.types.ts` and re-exported in `src/admin/lib/types.ts`.

Key types:
- `TalentProfile`, `SponsorProfile`, `Request`, `Message`
- `AdminUser`, `AuditLog`, `File`
- `TalentStatus`, `SponsorStatus`, `RequestStatus`, `MessageStatus`, `Priority`
- `DashboardMetrics`, `RecentActivity`