# Hostinger Deployment Guide - Laravel

Complete guide to deploy your Laravel project from GitHub to Hostinger hosting.

## 🎯 Prerequisites

Before starting, ensure you have:
- **Hostinger hosting account** (Premium or Business recommended for Laravel)
- **Domain** connected to Hostinger
- **SSH access** enabled (for Git deployment)
- **Database** created in Hostinger hPanel

## 📋 Option 1: Deploy via Git (Recommended)

### Step 1: Prepare Your Repository

Make sure your `laravel/` folder is properly structured in your GitHub repo:

```
Recommend-Her/
├── laravel/                    <-- Your Laravel app
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── .env.example
│   ├── artisan
│   ├── composer.json
│   └── package.json
├── src/                        <-- Old React files (keep or remove)
└── README.md
```

### Step 2: Enable SSH on Hostinger

1. Log in to Hostinger **hPanel**
2. Go to **Advanced** → **SSH Access**
3. Enable SSH and note your credentials:
   - **IP Address**: `your-server-ip`
   - **Username**: `u123456789` (your Hostinger username)
   - **Port**: `65002` (default Hostinger SSH port)

### Step 3: Connect via SSH & Deploy

```bash
# Connect to Hostinger via SSH
ssh -p 65002 u123456789@your-server-ip

# Navigate to public_html (or subdomain folder)
cd ~/public_html
# OR for subdomain:
# cd ~/domains/yourdomain.com/public_html

# Clone your repository
git clone https://github.com/samwa85/Recommend-Her.git .

# Move Laravel files to root (if laravel/ is a subdirectory)
mv laravel/* .
mv laravel/.* . 2>/dev/null || true
rm -rf laravel

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Create .env file
cp .env.example .env

# Generate application key
php artisan key:generate

# Set permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### Step 4: Configure Database

In Hostinger hPanel:
1. Go to **Databases** → **MySQL Databases**
2. Create a new database:
   - Database name: `u123456789_recommendher`
   - Username: `u123456789_admin`
   - Password: Generate strong password

Edit your `.env` file:

```bash
nano .env
```

Update database settings:

```env
APP_NAME="Recommend Her"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u123456789_recommendher
DB_USERNAME=u123456789_admin
DB_PASSWORD=your-database-password

# Mail settings (configure later)
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=hello@yourdomain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=hello@yourdomain.com
MAIL_FROM_NAME="Recommend Her"
```

Run migrations:

```bash
php artisan migrate --force
```

### Step 5: Configure Public Directory

Hostinger uses `public_html` as the web root. You need to point it to Laravel's `public` folder.

**Option A: Move public contents (Easiest)**

```bash
# Backup current public_html
mv public_html public_html_backup

# Create new public_html pointing to Laravel public
ln -s /home/u123456789/public_html/public public_html
```

**Option B: Use .htaccess (Alternative)**

Create/edit `.htaccess` in `public_html`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ /laravel/public/$1 [L]
</IfModule>
```

**Option C: Subdomain Setup (Recommended for clean deployment)**

1. In Hostinger hPanel, create a subdomain: `app.yourdomain.com`
2. Point it to `public_html/laravel/public`
3. Access your app at `https://app.yourdomain.com`

### Step 6: Set Correct Permissions

```bash
# Set ownership (replace u123456789 with your username)
chown -R u123456789:u123456789 .

# Set directory permissions
find . -type d -exec chmod 755 {} \;

# Set file permissions
find . -type f -exec chmod 644 {} \;

# Set storage and cache permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

---

## 📋 Option 2: Deploy via FTP/File Manager

### Step 1: Prepare Local Files

On your local machine:

```bash
# Navigate to Laravel project
cd /path/to/Recommend-Her/laravel

# Install production dependencies
composer install --no-dev --optimize-autoloader

# Create optimized files
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create deployment archive (exclude unnecessary files)
zip -r deploy.zip . -x "*.git*" -x "node_modules/*" -x "vendor/*" -x ".env"
```

### Step 2: Upload via Hostinger File Manager

1. Log in to Hostinger **hPanel**
2. Go to **Files** → **File Manager**
3. Navigate to `public_html`
4. Click **Upload** and select `deploy.zip`
5. Extract the archive
6. Upload `vendor/` folder separately (or install via SSH)

### Step 3: Install Dependencies on Server

If you didn't upload `vendor/`:

```bash
# Via SSH
ssh -p 65002 u123456789@your-server-ip
cd ~/public_html

# Download composer
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"

# Install dependencies
php composer.phar install --no-dev --optimize-autoloader
```

---

## 📋 Option 3: Deploy via Hostinger's Git Integration

Hostinger offers built-in Git deployment:

1. In hPanel, go to **Advanced** → **Git**
2. Click **Create Repository**
3. Fill in details:
   - **Repository URL**: `https://github.com/samwa85/Recommend-Her.git`
   - **Branch**: `main`
   - **Directory**: `public_html`
4. Click **Create**
5. After clone, SSH in and:
   ```bash
   cd ~/public_html
   mv laravel/* .
   rm -rf laravel
   composer install --no-dev
   ```

---

## ⚙️ Post-Deployment Configuration

### 1. Update .env for Production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database (your Hostinger credentials)
DB_HOST=127.0.0.1
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

### 2. Run Migrations & Seeders

```bash
php artisan migrate --force
# php artisan db:seed --force  # if you have seeders
```

### 3. Clear and Cache Config

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. Set Up Cron Jobs (Optional)

For Laravel scheduler:

1. In hPanel, go to **Advanced** → **Cron Jobs**
2. Add new cron job:
   - **Command**: `cd /home/u123456789/public_html && php artisan schedule:run >> /dev/null 2>&1`
   - **Schedule**: Every minute (`* * * * *`)

### 5. SSL Certificate

1. In hPanel, go to **SSL** → **SSL Certificates**
2. Enable **Free SSL** (Let's Encrypt)
3. Force HTTPS in `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🔧 Troubleshooting

### 500 Internal Server Error

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Check permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Database Connection Error

- Verify DB credentials in `.env`
- Check if database exists in hPanel
- Ensure MySQL service is running

### File Upload Issues

Increase upload limits in `php.ini` or `.htaccess`:

```apache
php_value upload_max_filesize 64M
php_value post_max_size 64M
php_value max_execution_time 300
```

### Composer Memory Limit

```bash
php -d memory_limit=512M composer.phar install --no-dev
```

---

## 📊 Performance Optimization

### Enable OPcache

Create/edit `php.ini` in `public_html`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

### Use Cloudflare (Free CDN)

1. Add site to Cloudflare
2. Update nameservers in Hostinger
3. Enable caching and optimizations

---

## 📁 Recommended File Structure on Hostinger

```
/home/u123456789/
├── public_html/              # Web root → points to Laravel public/
│   ├── index.php
│   ├── .htaccess
│   ├── css/
│   ├── js/
│   ├── images/
│   └── ...
├── laravel-app/              # Alternative: Laravel files outside web root (more secure)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env
│   └── artisan
└── logs/
```

---

## ✅ Deployment Checklist

- [ ] SSH access enabled
- [ ] Database created and configured
- [ ] Files uploaded/extracted
- [ ] Composer dependencies installed
- [ ] `.env` configured with production values
- [ ] Application key generated
- [ ] Database migrations run
- [ ] Storage permissions set (775)
- [ ] Public directory configured
- [ ] SSL certificate installed
- [ ] Domain DNS pointing to Hostinger
- [ ] Test all forms and pages
- [ ] Test admin login
- [ ] Enable production error logging

---

## 🆘 Need Help?

**Hostinger Support:**
- Live Chat in hPanel
- Knowledge Base: https://support.hostinger.com

**Laravel on Hostinger Guides:**
- https://support.hostinger.com/en/articles/1583454/how-to-install-laravel-on-hostinger

**Common Commands Reference:**

```bash
# SSH Connect
ssh -p 65002 u123456789@your-server-ip

# Navigate to project
cd ~/public_html

# Run artisan commands
php artisan migrate --force
php artisan cache:clear

# View logs
tail -f storage/logs/laravel.log

# Check disk space
df -h

# Check memory usage
free -m
```

---

## 🎉 Success!

Your Laravel app should now be live at:
- `https://yourdomain.com` (if deployed to root)
- `https://yourdomain.com/laravel` (if in subdirectory)
- `https://app.yourdomain.com` (if using subdomain)

**Next Steps:**
1. Create admin user in database
2. Configure mail settings
3. Set up backups
4. Monitor error logs
5. Enable analytics
