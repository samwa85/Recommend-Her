# GitHub Actions Auto-Deploy Setup Guide

## Overview
This guide will help you set up automatic deployment to my20i.com whenever you push code to GitHub.

## Step 1: Create Workflow File

### 1.1 Go to Your GitHub Repository
```
URL: https://github.com/samwa85/Recommend-Her
```

### 1.2 Create the Workflow Directory
```
Click: "Add file" → "Create new file"
```

**Path to enter:**
```
.github/workflows/deploy.yml
```

### 1.3 Paste This Content:
```yaml
name: Build and Deploy to my20i

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_APP_ENV: production
        
    - name: Deploy to my20i via FTP
      uses: SamKirkland/FTP-Deploy-Action@4.3.3
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./dist/
        server-dir: /public_html/
        dangerous-clean-slate: true
```

### 1.4 Commit the File
```
Scroll down → Click "Commit new file"
```

---

## Step 2: Add Secrets

### 2.1 Go to Settings
```
Click: "Settings" tab (next to Insights)
```

### 2.2 Navigate to Secrets
```
Left sidebar → "Secrets and variables" → "Actions"
URL: https://github.com/samwa85/Recommend-Her/settings/secrets/actions
```

### 2.3 Add Each Secret

Click **"New repository secret"** 5 times and add:

#### Secret 1: FTP_SERVER
```
Name: FTP_SERVER
Value: ftp.yourdomain.com (or your my20i FTP server)
```

#### Secret 2: FTP_USERNAME
```
Name: FTP_USERNAME
Value: your-my20i-ftp-username
```

#### Secret 3: FTP_PASSWORD
```
Name: FTP_PASSWORD
Value: your-my20i-ftp-password
```

#### Secret 4: VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://aku8v88g.us-east.insforge.app
```

#### Secret 5: VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: ik_964af40fa98a7966a53bc8c77af44d52
```

---

## Step 3: Get my20i FTP Credentials

### 3.1 Login to my20i.com
```
URL: https://my20i.com
Login with your credentials
```

### 3.2 Find FTP Details
```
Navigate to: Hosting → Manage → FTP

Look for:
- FTP Server/Host (e.g., ftp.yourdomain.com or 123.456.789.0)
- FTP Username (e.g., recommendher@yourdomain.com)
- FTP Password (set this if not already set)
```

---

## Step 4: Test the Setup

### 4.1 Make a Small Change
```bash
# On your local machine
echo "// Auto-deploy test" >> src/main.tsx
```

### 4.2 Commit and Push
```bash
git add .
git commit -m "test: auto-deploy to my20i"
git push origin main
```

### 4.3 Watch the Action
```
Go to: https://github.com/samwa85/Recommend-Her/actions

You should see a new workflow running:
- Yellow circle = Running
- Green checkmark = Success
- Red X = Failed (click for details)
```

### 4.4 Verify Deployment
```
Visit: http://yourdomain.com or http://recommendher.africa
```

---

## Troubleshooting

### Issue: "FTP connection failed"
**Solution:**
- Check FTP_SERVER is correct (no http:// or ftp:// prefix)
- Verify username and password
- Try using IP address instead of domain

### Issue: "Build failed"
**Solution:**
- Check secrets are added correctly
- View logs in GitHub Actions
- Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set

### Issue: "Deployed but blank screen"
**Solution:**
- Check .htaccess file exists on server
- Verify all dist/ files were uploaded
- Check browser console for errors

### Issue: "Workflow not triggering"
**Solution:**
- Ensure file is at `.github/workflows/deploy.yml` (exact path)
- Check you're pushing to `main` branch
- Verify workflow file syntax is correct

---

## How It Works (Diagram)

```
┌─────────────────┐
│  You push code  │
│  to GitHub      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│ 1. Checkout code│
│ 2. npm install  │
│ 3. npm run build│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   dist/ folder  │
│   (built files) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FTP Deploy to  │
│    my20i.com    │
└─────────────────┘
```

---

## Benefits of This Setup

✅ **Automatic**: Push to GitHub → Auto-deploys to my20i
✅ **No manual FTP**: Never upload files manually again
✅ **Version controlled**: Every deployment is tracked
✅ **Rollback**: Can revert to previous commits
✅ **Free**: GitHub Actions is free for public repos

---

## Need Help?

If you get stuck on any step:
1. Check the GitHub Actions logs for specific errors
2. Verify your my20i FTP credentials work in FileZilla first
3. Make sure the workflow file syntax is correct (YAML indentation matters!)
