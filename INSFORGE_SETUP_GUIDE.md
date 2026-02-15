# InsForge + Laravel Setup Guide

Complete guide to clone your Laravel project and use **InsForge** (insforge.dev) as your backend database and API service.

## 🎯 What is InsForge?

InsForge is a Backend-as-a-Service (BaaS) platform providing:
- **PostgreSQL Database** with PostgREST API
- **Authentication** (Email/Password + OAuth)
- **File Storage**
- **Serverless Functions**
- **Real-time** WebSocket pub/sub

## 📋 Prerequisites

- Git installed
- PHP 8.1+ installed locally
- Composer installed
- InsForge account (sign up at https://insforge.dev)
- Your InsForge project credentials:
  - Project URL: `https://your-project.insforge.app`
  - Anon Key: `your-anon-key`
  - Service Role Key: `your-service-key` (keep secret!)

---

## 🚀 Step 1: Clone the Repository

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/samwa85/Recommend-Her.git

# Navigate to project
cd Recommend-Her

# Copy Laravel files to a new project folder (or work from laravel/ subfolder)
cp -r laravel recommend-her-app
cd recommend-her-app

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

---

## 🔧 Step 2: Configure InsForge Database

### Option A: Direct PostgreSQL Connection (Recommended)

InsForge uses PostgreSQL. Get your connection details from InsForge Dashboard:

1. Log in to https://insforge.dev
2. Go to your project → **Settings** → **Database**
3. Copy the connection string

Edit `.env`:

```env
# Change from MySQL to PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=db.your-project.insforge.app
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-database-password

# Or use URL format
DATABASE_URL=postgresql://postgres:password@db.your-project.insforge.app:5432/postgres
```

Install PostgreSQL driver for PHP:

```bash
# Ubuntu/Debian
sudo apt-get install php-pgsql

# macOS with Homebrew
brew install php-pgsql

# Or check if already installed
php -m | grep pgsql
```

### Option B: Use PostgREST API (Alternative)

If you want to use InsForge's REST API instead of direct DB connection:

```bash
# Install InsForge PHP SDK (if available) or use HTTP client
composer install guzzlehttp/guzzle
```

Create a service class `app/Services/InsForgeService.php`:

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class InsForgeService
{
    protected string $baseUrl;
    protected string $apiKey;
    
    public function __construct()
    {
        $this->baseUrl = config('services.insforge.url');
        $this->apiKey = config('services.insforge.key');
    }
    
    public function query(string $table, array $params = [])
    {
        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->get("{$this->baseUrl}/rest/v1/{$table}", $params);
        
        return $response->json();
    }
    
    public function insert(string $table, array $data)
    {
        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation',
        ])->post("{$this->baseUrl}/rest/v1/{$table}", $data);
        
        return $response->json();
    }
}
```

Add to `config/services.php`:

```php
'insforge' => [
    'url' => env('INSFORGE_URL'),
    'key' => env('INSFORGE_KEY'),
    'service_key' => env('INSFORGE_SERVICE_KEY'),
],
```

Update `.env`:

```env
INSFORGE_URL=https://your-project.insforge.app
INSFORGE_KEY=your-anon-key
INSFORGE_SERVICE_KEY=your-service-role-key
```

---

## 🗄️ Step 3: Create Database Tables on InsForge

### Using InsForge Dashboard

1. Go to https://insforge.dev → Your Project → **Database**
2. Use the **SQL Editor** or **Table Editor**
3. Create tables for your application

### SQL Schema for Recommend Her

Run this SQL in InsForge SQL Editor:

```sql
-- Talent Profiles Table
CREATE TABLE talent_profiles (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    headline VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    seniority_level VARCHAR(100) NOT NULL,
    bio TEXT,
    cv_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsors Table
CREATE TABLE sponsors (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    organization VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    sponsor_type VARCHAR(100),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Submissions Table
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    inquiry_type VARCHAR(100) NOT NULL,
    organization VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100),
    author VARCHAR(255),
    read_time VARCHAR(50),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (for admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (optional, for advanced security)
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
```

---

## 🔑 Step 4: Configure Laravel Models

### Update Models for PostgreSQL

Models should work with PostgreSQL automatically. Update `app/Models/`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TalentProfile extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'full_name',
        'email',
        'headline',
        'industry',
        'seniority_level',
        'bio',
        'cv_path',
        'status',
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
```

Create other models:

```bash
php artisan make:model TalentProfile
php artisan make:model Sponsor
php artisan make:model ContactSubmission
php artisan make:model BlogPost
```

---

## 🔐 Step 5: Authentication with InsForge

### Option A: Laravel's Built-in Auth (Recommended)

Use Laravel's auth with InsForge PostgreSQL:

```bash
# Install Laravel Breeze (simple auth scaffolding)
composer require laravel/breeze --dev
php artisan breeze:install blade
npm install
npm run build

# Run migrations (will create auth tables on InsForge)
php artisan migrate
```

### Option B: InsForge Auth (External)

Use InsForge's authentication service:

```php
// app/Services/InsForgeAuthService.php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class InsForgeAuthService
{
    public function signUp($email, $password)
    {
        $response = Http::withHeaders([
            'apikey' => config('services.insforge.key'),
        ])->post(config('services.insforge.url') . '/auth/v1/signup', [
            'email' => $email,
            'password' => $password,
        ]);
        
        return $response->json();
    }
    
    public function signIn($email, $password)
    {
        $response = Http::withHeaders([
            'apikey' => config('services.insforge.key'),
        ])->post(config('services.insforge.url') . '/auth/v1/token?grant_type=password', [
            'email' => $email,
            'password' => $password,
        ]);
        
        return $response->json();
    }
}
```

---

## 📁 Step 6: File Storage with InsForge

Configure Laravel to use InsForge Storage:

```php
// config/filesystems.php
'disks' => [
    // ... other disks
    
    'insforge' => [
        'driver' => 's3',
        'key' => env('INSFORGE_SERVICE_KEY'),
        'secret' => env('INSFORGE_SERVICE_KEY'),
        'region' => 'us-east-1',
        'bucket' => 'storage',
        'url' => env('INSFORGE_URL') . '/storage/v1',
        'endpoint' => env('INSFORGE_URL') . '/storage/v1',
        'use_path_style_endpoint' => true,
    ],
],
```

Use in controllers:

```php
// Store file on InsForge
$path = $request->file('cv')->store('cvs', 'insforge');
```

---

## 🧪 Step 7: Test Connection

```bash
# Test database connection
php artisan tinker

# In tinker, run:
>>> DB::connection()->getPdo();
# Should return PDO object without errors

>>> App\Models\TalentProfile::count();
# Should return 0 (or count of existing records)
```

---

## 🚀 Step 8: Run Locally

```bash
# Serve the application
php artisan serve

# Or use Vite for asset compilation
npm run dev
```

Visit: `http://localhost:8000`

---

## 📤 Step 9: Deploy to Production (with InsForge)

Since your database is already on InsForge (cloud), deployment is easier:

### Deploy to Hostinger/Vercel/Any Host

1. **Clone repo on server**:
   ```bash
   git clone https://github.com/samwa85/Recommend-Her.git
   cd Recommend-Her/laravel
   ```

2. **Install dependencies**:
   ```bash
   composer install --no-dev
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   
   Edit `.env` - keep InsForge credentials, no local DB needed!

4. **No database migrations needed** (already on InsForge)

5. **Set permissions**:
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```

6. **Point web server** to `public/` directory

---

## 📊 InsForge vs Self-Hosted Database

| Feature | InsForge | Self-Hosted MySQL |
|---------|----------|-------------------|
| Setup | Instant | Manual install |
| Scaling | Automatic | Manual |
| Backups | Automatic | Manual setup |
| API | Built-in REST | Requires custom |
| Real-time | Built-in | Requires setup |
| Auth | Built-in | Requires setup |
| Cost | Free tier available | Server costs |

---

## 🔧 Troubleshooting

### PostgreSQL Connection Failed

```bash
# Check if pgsql extension is enabled
php -m | grep pgsql

# If not, install:
# Ubuntu/Debian:
sudo apt-get install php8.1-pgsql

# Restart web server
sudo service apache2 restart
# or
sudo service nginx restart
```

### SSL Connection Error

Add to `.env`:

```env
DB_SSLMODE=require
# or for Laravel 10+
DB_SSL_MODE=require
```

Or disable SSL for local dev:

```env
DB_SSLMODE=disable
```

### InsForge API Errors

Check InsForge Dashboard:
1. Go to **Logs** → **API**
2. Look for error details
3. Verify API keys are correct

---

## 📚 Useful InsForge Resources

- **InsForge Dashboard**: https://insforge.dev
- **PostgREST Docs**: https://postgrest.org/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## ✅ Quick Checklist

- [ ] Cloned git repository
- [ ] Installed PHP dependencies (`composer install`)
- [ ] Created InsForge account & project
- [ ] Got InsForge credentials (URL, anon key, service key)
- [ ] Updated `.env` with InsForge database credentials
- [ ] Installed PostgreSQL PHP extension
- [ ] Created tables on InsForge
- [ ] Created Laravel models
- [ ] Tested database connection
- [ ] Configured file storage (optional)
- [ ] Ran application locally
- [ ] Deployed to production

---

## 🎉 Success!

Your Laravel app is now:
- ✅ Cloned from GitHub
- ✅ Connected to InsForge PostgreSQL database
- ✅ Using InsForge API for backend services
- ✅ Ready for production deployment

**Next Steps:**
1. Create an admin user
2. Add real data to InsForge database
3. Deploy to your hosting provider
4. Set up SSL
5. Configure domain
