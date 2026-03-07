# Sponsor Showcase Migration

## Overview
This migration creates the `sponsor_showcase` table for displaying sponsors on the `/for-sponsors` page.

## Migration File
**Location:** `migrations/023_sponsor_showcase.sql`

## How to Run

### Option 1: InsForge SQL Editor (Recommended)
1. Go to: https://aku8v88g.us-east.insforge.app/dashboard/sql
2. Login with your InsForge admin credentials
3. Copy and paste the contents of `migrations/023_sponsor_showcase.sql`
4. Click "Run"

### Option 2: Direct Database Connection
If you have direct PostgreSQL access:
```bash
psql -h <db-host> -p 5432 -U postgres -d postgres -f migrations/023_sponsor_showcase.sql
```

## SQL Summary

### Tables Created
- `public.sponsor_showcase` - Stores sponsor information

### Columns
- `id` - UUID primary key
- `name` - Sponsor's full name
- `title` - Job title
- `company` - Company name
- `bio` - Sponsor biography/text
- `image_path` - Storage path to image
- `image_url` - Public URL to image
- `linkedin_url` - LinkedIn profile URL
- `is_active` - Whether to display this sponsor
- `display_order` - Sort order (lower = first)
- `featured` - Highlight this sponsor
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Indexes
- `idx_sponsor_showcase_active_order` - For filtering active sponsors by order
- `idx_sponsor_showcase_featured` - For filtering featured sponsors

### Functions
- `update_sponsor_showcase_updated_at()` - Auto-updates `updated_at` timestamp
- `get_active_sponsor_showcase()` - Returns active sponsors for public display

### Views
- `v_active_sponsor_showcase` - View of active sponsors ordered by display_order

### RLS Policies
- Public read access for active sponsors
- Authenticated users can create/update/delete

### Storage Bucket
- `sponsor-images` - For sponsor profile images

## After Migration

1. Go to Admin Dashboard: http://localhost:5173/admin/sponsor-showcase
2. Click "Add Sponsor" to create your first sponsor showcase entry
3. The sponsors will appear on the `/for-sponsors` public page

## Admin Features

The Sponsor Showcase admin page allows you to:
- Add new sponsors with images
- Edit sponsor details
- Hide/Show sponsors
- Feature/Unfeature sponsors
- Reorder sponsors (drag and drop)
- Delete sponsors

## Public Page

The `/for-sponsors` page displays:
- Sponsor cards with photos
- Name, title, company
- LinkedIn links
- Bio/quote
- Featured sponsors highlighted

## Troubleshooting

### "Failed to load sponsors" error
This means the table hasn't been created yet. Run the migration SQL above.

### Images not uploading
Check that the `sponsor-images` storage bucket exists:
```sql
SELECT * FROM storage.buckets WHERE name = 'sponsor-images';
```

If missing, the migration includes the bucket creation.
