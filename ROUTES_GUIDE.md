# Routes Guide - Recommend Her

## All Available Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page with hero, features, testimonials |
| `/for-talent` | ForTalent | Talent submission form with CV upload |
| `/for-sponsors` | ForSponsors | Sponsor registration form |
| `/talent-pool` | TalentPool | Public talent pool listing (approved only) |
| `/contact` | Contact | Contact form |
| `/mission` | Mission | Mission statement page |
| `/resources` | Resources | Resources page |

### Admin Routes (Protected)
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | AdminDashboard | Full admin dashboard with analytics |
| `/super-admin` | SuperAdminDashboard | Simplified admin view for super admins |

## New Super Admin Dashboard Features

### Simplified Interface
- **Clean table view** of all talent and sponsors
- **No complex charts** or analytics - just data
- **Quick actions** - approve/reject with one click
- **CV download** - view and download talent CVs

### Key Features
1. **Stats Cards** - Quick overview of counts
2. **Talent Tab**
   - Search by name, email, industry
   - Filter by status (all/pending/approved/rejected)
   - View CV button (opens in new tab)
   - Download CV button
   - Quick approve/reject buttons
   - Detail view popup

3. **Sponsors Tab**
   - Search by name, organization, industry
   - Filter by status
   - Quick approve/reject buttons
   - Detail view popup

### Access
- Only users with `role = 'admin'` in profiles table can access
- Shows error message if not authenticated or not admin

## How to Access

1. **Create admin user** (if not exists):
```sql
-- Run in Supabase SQL Editor
INSERT INTO public.profiles (id, role, full_name, email)
VALUES ('your-user-id', 'admin', 'Admin User', 'admin@example.com');
```

2. **Navigate to**:
   - Complex dashboard: `/admin`
   - Simple dashboard: `/super-admin`

## Testing Checklist

- [ ] `/` - Home page loads
- [ ] `/for-talent` - Talent form submits successfully
- [ ] `/for-sponsors` - Sponsor form submits successfully
- [ ] `/talent-pool` - Shows approved talent
- [ ] `/contact` - Contact form works
- [ ] `/admin` - Admin dashboard loads (admin only)
- [ ] `/super-admin` - Super admin dashboard loads (admin only)
- [ ] CV upload works on talent form
- [ ] CV download works in super admin dashboard
- [ ] Approve/reject buttons work in super admin dashboard
