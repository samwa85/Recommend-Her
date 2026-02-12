# Admin Dashboard Redesign - Complete Guide

## Overview

This document provides a comprehensive overview of the redesigned `/admin` dashboard with a single source of truth for data, types, and formatting.

---

## 📁 File Structure

```
src/admin/
├── components/
│   ├── index.ts                 # Component exports
│   ├── AdminLayout.tsx          # Main layout (Sidebar + Topbar)
│   ├── DataTable.tsx            # Reusable table with pagination
│   ├── StatusBadge.tsx          # Unified status badge component
│   ├── KPICard.tsx              # KPI metric cards
│   ├── ChartCard.tsx            # Chart container component
│   ├── EmptyState.tsx           # Empty state illustrations
│   ├── LoadingSkeleton.tsx      # Loading skeletons
│   ├── ConfirmDialog.tsx        # Confirmation dialogs
│   ├── FilterBar.tsx            # Filter bar component
│   └── DetailDrawer.tsx         # Detail view drawer
├── hooks/
│   └── useAdminData.ts          # React hooks for all data fetching
├── lib/
│   ├── types.ts                 # TypeScript types (existing)
│   ├── queries.ts               # Supabase queries (existing)
│   └── formatters.ts            # Date/formatting utilities (enhanced)
├── pages/
│   ├── index.ts                 # Page exports
│   ├── OverviewPage.tsx         # Dashboard home
│   ├── TalentPage.tsx           # Talent listing + detail
│   ├── SponsorsPage.tsx         # Sponsors listing + detail
│   ├── RequestsPage.tsx         # Requests listing + detail
│   ├── MessagesPage.tsx         # Messages listing + detail
│   └── AnalyticsPage.tsx        # Analytics charts
├── index.ts                     # Main module exports
```

---

## 🌐 New Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | OverviewPage | Dashboard home with KPIs and charts |
| `/admin/talent` | TalentPage | Talent listing with filters and detail view |
| `/admin/sponsors` | SponsorsPage | Sponsors listing with filters |
| `/admin/requests` | RequestsPage | Recommendation requests management |
| `/admin/messages` | MessagesPage | Contact submissions inbox |
| `/admin/analytics` | AnalyticsPage | Charts and data analysis |

---

## 📊 Entity to Table Mapping

| Entity | Table Name | Description |
|--------|------------|-------------|
| Talent | `talent_profiles` | Talent profile data joined with `profiles` |
| Sponsors | `sponsor_profiles` | Sponsor profile data joined with `profiles` |
| Requests | `recommendation_requests` | Recommendation requests with talent/sponsor joins |
| Messages | `contact_submissions` | Contact form submissions |
| CV Storage | `talent-cvs` | Supabase Storage bucket for CV files |

---

## 🔄 Single Source of Truth

### Data Layer (`src/admin/hooks/useAdminData.ts`)

All data fetching is centralized through custom React hooks:

```typescript
// Talent hooks
useTalentList(options)           // Fetch talent list with filters
useTalentDetail(id)              // Fetch single talent + actions

// Sponsor hooks  
useSponsorList(options)          // Fetch sponsors list
useSponsorDetail(id)             // Fetch single sponsor + actions

// Request hooks
useRequestList(options)          // Fetch requests list
useRequestDetail(id)             // Fetch single request + actions

// Message hooks
useMessageList(options)          // Fetch messages list
useMessageDetail(id)             // Fetch single message + actions

// Dashboard hooks
useDashboardMetrics(options)     // KPI metrics
useAnalytics(options)            // Chart data
useActivityLogs(options)         // Activity feed
```

### Type Definitions (`src/admin/lib/types.ts`)

All types are already defined in the existing file:

- `AdminTalent` - Talent with joined profile data
- `AdminSponsor` - Sponsor with joined profile data
- `AdminRequest` - Request with talent/sponsor joins
- `AdminMessage` - Contact submission
- `DashboardMetrics` - KPI data structure
- `AnalyticsData` - Chart data structure

### Formatting Utilities (`src/admin/lib/formatters.ts`)

All formatting functions use the existing formatters:

```typescript
// Date formatters
formatDate(dateString)           // MMM dd, yyyy
formatDateTime(dateString)       // MMM dd, yyyy HH:mm
formatRelativeTime(dateString)   // 2 hours ago
formatTableDate(dateString)      // MMM d, yyyy

// Status formatters
getTalentStatusLabel(status)
getSponsorStatusLabel(status)
getRequestStatusLabel(status)
getMessageStatusLabel(status)

// File formatters
formatCVUrl(filePath)            // Full Supabase storage URL
getCVFileName(filePath)          // Extract filename
formatFileSize(bytes)            // Human readable

// Other formatters
formatPhone(phone)               // (XXX) XXX-XXXX
formatNumber(num)                // 1,234,567
truncateString(str, maxLength)   // With ellipsis
```

---

## 🎨 Shared Components

### AdminLayout
- Responsive sidebar + topbar navigation
- Mobile hamburger menu
- Quick stats sidebar
- User menu with notifications
- Auto-refresh indicator

### DataTable
- Sortable columns
- Pagination
- Row selection (checkboxes)
- Action dropdowns
- Loading skeleton
- Empty states

### StatusBadge
- Unified badge component for all status types
- Color-coded: approved (green), rejected (red), pending (yellow), etc.
- Supports: talent, sponsor, request, message

### FilterBar
- Search input with clear button
- Filter dropdowns
- Export button
- Clear all filters

### DetailDrawer
- Slide-out detail view
- Avatar with initials
- Status badge
- Sectioned fields
- Action buttons
- Loading state

### KPICard
- Trend indicators
- Color themes
- Clickable (navigates to detail)

### ChartCard
- Chart container with title
- Loading skeleton
- Footer support

### ConfirmDialog
- Danger/Warning/Info variants
- Delete confirmation preset
- Loading state

---

## 🔌 Supabase Integration

### Storage (CV Files)
CV files are stored in the `talent-cvs` bucket. URLs are constructed as:

```typescript
`${VITE_SUPABASE_URL}/storage/v1/object/public/talent-cvs/${filePath}`
```

### Real-time Subscriptions
The hooks automatically subscribe to Supabase real-time changes:

```typescript
// Auto-refresh when talent data changes
supabase
  .channel('talent-changes')
  .on('postgres_changes', { event: '*', table: 'talent_profiles' }, callback)
  .subscribe()
```

### Row Level Security (RLS)
All queries respect RLS policies:
- Only admin roles can read/admin-edit data
- Public users can only insert (contact forms, talent submissions)

---

## 📱 Mobile Responsive

All admin pages are fully responsive:
- Desktop: Sidebar navigation + full table view
- Tablet: Collapsible sidebar + condensed tables
- Mobile: Hamburger menu + card-based layouts

---

## 🚀 Quick Actions

### Approve/Reject Talent
1. Navigate to `/admin/talent`
2. Find talent with "Pending Review" status
3. Click row or actions menu
4. Click Approve/Reject in drawer

### Review Messages
1. Navigate to `/admin/messages`
2. Filter by "New" status
3. Click message to view
4. Click "Reply via Email" to respond
5. Mark as Read/Replied

### Export Data
All list pages have export functionality:
- CSV format for tables
- JSON format for analytics

---

## 📝 Notes

### Performance
- All list queries use pagination (default 25 items)
- Analytics queries are cached for 60 seconds
- Real-time subscriptions only refresh changed data

### Security
- Service role key is NEVER exposed in frontend
- All queries go through RLS policies
- Confirm dialogs for delete actions

### Known Limitations
1. Admin authentication uses simple password check (dev mode)
2. No bulk actions implemented yet
3. Charts use client-side data aggregation

---

## 🔄 Migration from Legacy

Legacy admin pages remain accessible:
- `/admin-legacy` → Old AdminDashboard
- `/super-admin` → Old SuperAdminDashboard

New pages are at:
- `/admin` → New Overview
- `/admin/talent` → New Talent page
- etc.

To fully migrate, update any bookmarks or hardcoded links.

---

## 📊 Database Performance

### Indexes Recommended
```sql
-- For faster filtering
CREATE INDEX idx_talent_profiles_status ON talent_profiles(status);
CREATE INDEX idx_talent_profiles_created_at ON talent_profiles(created_at DESC);
CREATE INDEX idx_sponsor_profiles_status ON sponsor_profiles(status);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);

-- For search
CREATE INDEX idx_profiles_full_name ON profiles(full_name);
CREATE INDEX idx_profiles_email ON profiles(email);
```

---

## ✅ Verification Checklist

- [ ] All pages load without errors
- [ ] Data loads from Supabase (not mock data)
- [ ] Status badges show correct colors
- [ ] CV download links work
- [ ] Pagination works on all tables
- [ ] Filters update URL params
- [ ] Detail drawers open correctly
- [ ] Approve/Reject actions work
- [ ] Export downloads CSV file
- [ ] Charts display real data
- [ ] Mobile navigation works
- [ ] Real-time updates refresh data

---

## 🛠️ Troubleshooting

### Data not loading?
1. Check browser console for errors
2. Verify Supabase env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Check RLS policies allow admin access
4. Verify table names match queries

### CV downloads not working?
1. Check bucket name is `talent-cvs`
2. Verify file paths in `talent_profiles.cv_file_path`
3. Check bucket permissions allow public read

### Charts not showing?
1. Verify analytics queries return data
2. Check date range filter
3. Ensure recharts library is installed

---

## 📚 Additional Resources

- Supabase Docs: https://supabase.com/docs
- Recharts Docs: https://recharts.org
- React Query Pattern: Used in useAdminData hooks
