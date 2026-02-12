# Complete Deployment Guide

## Quick Start - Copy & Paste These Commands

### Step 1: SSH to Your Server (YOU run this)
```bash
ssh root@145.223.96.191
```

### Step 2: Create Deployment Script
Once logged in, create this file:

```bash
cat > /tmp/deploy.sh << 'ENDOFSCRIPT'
#!/bin/bash
set -e

echo "🚀 Starting RecommendHer Deployment"

# Install Node.js 18 if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 globally
npm install -g pm2

# Create app directory
mkdir -p /var/www/recommendher
cd /var/www/recommendher

# Clone/pull your code (adjust path as needed)
# git clone https://github.com/yourusername/recommendher.git .
# OR if code is already there:
# cd /path/to/existing/code

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm install sonner date-fns

# Build the app
echo "🔨 Building..."
npm run build

# Setup PM2
echo "⚙️ Setting up PM2..."
pm2 delete recommendher 2>/dev/null || true
pm2 start npm --name "recommendher" -- run preview -- --host
pm2 save
pm2 startup systemd

echo "✅ Deployment complete!"
echo "App should be running on port 4173"
ENDOFSCRIPT

chmod +x /tmp/deploy.sh
/tmp/deploy.sh
```

### Step 3: Setup Nginx Reverse Proxy
```bash
cat > /etc/nginx/sites-available/recommendher << 'EOF'
server {
    listen 80;
    server_name 145.223.96.191;  # or your domain

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/recommendher /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

### Step 4: Database Migrations (Critical!)
Go to Supabase Dashboard:
1. Open: https://app.supabase.com/project/_/sql
2. Copy/paste these migration files ONE BY ONE:

**Migration 007:**
```sql
-- Run this first
[Content from migrations/007_sponsor_anonymous_submissions.sql]
```

**Migration 008:**
```sql
-- Run this second
[Content from migrations/008_contact_submissions.sql]
```

**Migration 009:**
```sql
-- Run this third
[Content from migrations/009_rate_limiting.sql]
```

**Migration 010:**
```sql
-- Run this last
[Content from migrations/010_soft_deletes.sql]
```

### Step 5: Environment Setup
```bash
cd /var/www/recommendher

cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=http://supabasekong-dcgko804wcgwow4s4ko40000.145.223.96.191.sslip.io
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDg5MTcyMCwiZXhwIjo0OTI2NTY1MzIwLCJyb2xlIjoiYW5vbiJ9.o3IrcUgo8uwNNWSshycVC6CgyxA7KExx_RR5DLwJRmE

# Application
VITE_APP_ENV=production
VITE_APP_URL=https://145.223.96.191
EOF

# Rebuild with env
npm run build
pm2 restart recommendher
```

---

## Troubleshooting

### Check if app is running:
```bash
pm2 status
pm2 logs recommendher
```

### Check Nginx:
```bash
nginx -t
systemctl status nginx
```

### Restart everything:
```bash
pm2 restart recommendher
systemctl restart nginx
```

### View logs:
```bash
pm2 logs recommendher --lines 100
```
