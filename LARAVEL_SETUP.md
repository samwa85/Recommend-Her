# Laravel Setup Guide - Recommend Her

This directory contains the complete Laravel + Blade conversion of the Recommend Her Initiative website. The frontend has been converted from React/Vite to PHP + Laravel while maintaining the exact same UX/UI.

## 🎨 UX/UI Preservation

**The UI is 100% preserved.** All the following remain identical to the original React version:
- Tailwind CSS styling with the same custom color variables
- All fonts (Poppins, Playfair Display, Space Mono)
- All animations (scroll reveal, hover effects)
- All layouts and spacing
- All icons (Lucide icons converted to SVG)
- All interactions (mobile menu, testimonials carousel, etc.)

## 📁 Directory Structure

```
laravel/
├── app/
│   └── Http/
│       └── Controllers/
│           ├── Controller.php
│           ├── PageController.php          # Public pages
│           ├── FormController.php          # Form submissions
│           └── Admin/                      # Admin controllers
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── app.blade.php             # Main layout
│   │   │   └── admin.blade.php           # Admin layout
│   │   ├── sections/                      # Reusable sections
│   │   │   ├── navigation.blade.php
│   │   │   ├── footer.blade.php
│   │   │   ├── hero.blade.php
│   │   │   ├── value-proposition.blade.php
│   │   │   ├── how-it-works.blade.php
│   │   │   ├── talent-pool-preview.blade.php
│   │   │   ├── for-sponsors.blade.php
│   │   │   ├── for-talent.blade.php
│   │   │   ├── testimonials.blade.php
│   │   │   └── cta-section.blade.php
│   │   ├── pages/                         # Page templates
│   │   │   ├── home.blade.php
│   │   │   ├── mission.blade.php
│   │   │   ├── for-talent.blade.php
│   │   │   ├── for-sponsors.blade.php
│   │   │   ├── talent-pool.blade.php
│   │   │   ├── talent-detail.blade.php
│   │   │   ├── resources.blade.php
│   │   │   ├── contact.blade.php
│   │   │   └── blog/
│   │   │       ├── index.blade.php
│   │   │       └── show.blade.php
│   │   └── admin/                         # Admin views
│   │       ├── login.blade.php
│   │       ├── dashboard.blade.php
│   │       └── ...
│   ├── css/
│   │   └── app.css
│   └── js/
│       └── app.js
├── routes/
│   └── web.php
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🚀 Installation

### 1. Create New Laravel Project

```bash
# Navigate to parent directory
cd /path/to/parent

# Create Laravel project
composer create-project laravel/laravel recommend-her-laravel

# Or use Laravel installer
laravel new recommend-her-laravel
```

### 2. Copy Files

Copy the contents of this `laravel/` directory into your new Laravel project:

```bash
# Copy routes
cp -r laravel/routes/* recommend-her-laravel/routes/

# Copy controllers
mkdir -p recommend-her-laravel/app/Http/Controllers/Admin
cp laravel/app/Http/Controllers/*.php recommend-her-laravel/app/Http/Controllers/
cp laravel/app/Http/Controllers/Admin/*.php recommend-her-laravel/app/Http/Controllers/Admin/

# Copy views
cp -r laravel/resources/views/* recommend-her-laravel/resources/views/

# Copy assets
cp -r laravel/resources/css/* recommend-her-laravel/resources/css/
cp -r laravel/resources/js/* recommend-her-laravel/resources/js/

# Copy config files
cp laravel/package.json recommend-her-laravel/
cp laravel/tailwind.config.js recommend-her-laravel/
cp laravel/vite.config.js recommend-her-laravel/
```

### 3. Install Dependencies

```bash
cd recommend-her-laravel

# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 4. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=recommend_her
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Build Assets

```bash
# Development build
npm run dev

# Production build
npm run build
```

### 6. Run Migrations (Optional)

If you want to use the database features:

```bash
# Create migrations for your tables
php artisan make:migration create_talent_profiles_table
php artisan make:migration create_sponsors_table
php artisan make:migration create_contact_submissions_table

# Run migrations
php artisan migrate
```

### 7. Start Development Server

```bash
php artisan serve
```

Visit `http://localhost:8000`

## 📝 Pages Implemented

### Public Pages
- ✅ Home Page (with all sections)
- ✅ Mission / About Page
- ✅ For Talent (with submission form)
- ✅ For Sponsors (with registration form)
- ✅ Talent Pool (with password protection)
- ✅ Talent Detail
- ✅ Resources & Blog Index
- ✅ Blog Post Detail
- ✅ Contact Page

### Admin Panel
- ✅ Login Page
- ✅ Dashboard
- ✅ Talent Management
- ✅ Sponsor Management
- ✅ Blog Management
- ✅ Requests Management
- ✅ Messages/Contact Submissions
- ✅ Analytics
- ✅ Settings

## 🔒 Features

### Forms
All forms include:
- Server-side validation
- CSRF protection
- Success/error messages
- Old input preservation
- File upload support (for CVs)

### Admin Panel
- Secure authentication
- Responsive sidebar navigation
- Dashboard with stats
- CRUD operations for all resources

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile
- Responsive grids and layouts
- Touch-friendly interactions

## 🎨 Customization

### Colors
Colors are defined as CSS variables in `resources/views/layouts/app.blade.php`:

```css
:root {
    --primary: 20 70% 45%;        /* Main brand color */
    --accent: 30 80% 55%;         /* Accent color */
    --background: 340 20% 98%;    /* Page background */
    --foreground: 340 25% 15%;    /* Text color */
    /* ... */
}
```

### Fonts
Fonts are loaded from Google Fonts:
- **Poppins**: Body text, UI elements
- **Playfair Display**: Headings, serif text
- **Space Mono**: Code, monospace text

## 📧 Form Handling

Forms are set up to:
1. Validate input server-side
2. Store in database (when migrations are created)
3. Send email notifications (configure in controllers)
4. Return user-friendly messages

To enable email notifications, configure your mail settings in `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=hello@recommendher.africa
MAIL_FROM_NAME="Recommend Her"
```

## 🔧 Next Steps

1. **Create Database Tables**: Run migrations or create models with `php artisan make:model`
2. **Set Up Authentication**: Laravel Breeze or Jetstream for full auth scaffolding
3. **Configure Mail**: Set up mail driver for form notifications
4. **File Storage**: Configure disk for CV uploads
5. **SEO**: Add meta tags, sitemap, etc.
6. **Analytics**: Add Google Analytics or similar

## 📚 Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Blade Templates](https://laravel.com/docs/blade)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev/guide/)

## 🤝 Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Clear caches: `php artisan cache:clear && php artisan view:clear`
3. Verify file permissions for `storage/` and `bootstrap/cache/`
