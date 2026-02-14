# Deployment Options for RecommendHer

## ✅ Build Status: SUCCESS
Your app has been built successfully and is ready for deployment.

**Build Location:** `/Users/samwa/Desktop/CODE ZERO/KIMI/Recommend Her/dist/`

---

## Option 1: VPS Deployment (Recommended - Ready to Use)

Your project includes a deployment guide to your VPS at `145.223.96.191`.

### Quick Deploy:
```bash
./deploy-vps.sh
```

### Manual Deploy:
```bash
# 1. Build
npm run build

# 2. SSH to server
ssh root@145.223.96.191

# 3. Create directory and upload files
mkdir -p /var/www/recommendher
# Upload dist/ folder contents to /var/www/recommendher

# 4. Configure Nginx
cat > /etc/nginx/sites-available/recommendher << 'EOF'
server {
    listen 80;
    server_name 145.223.96.191;
    root /var/www/recommendher;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/recommendher /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

**Result:** App will be live at http://145.223.96.191

---

## Option 2: InsForge Dashboard (Manual Upload)

Since the InsForge deployment API requires MCP tools or dashboard access:

1. **Go to your InsForge dashboard:**
   - URL: https://aku8v88g.us-east.insforge.app (or your custom domain)

2. **Navigate to Sites/Deployment section**

3. **Upload the build:**
   - Use the deployment package: `deploy-package-20260214-162527.zip`
   - Or upload the `dist/` folder contents directly

4. **Configure environment variables** in the dashboard:
   ```
   VITE_SUPABASE_URL=https://aku8v88g.us-east.insforge.app
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_APP_ENV=production
   ```

---

## Option 3: InsForge MCP Tools (If Available)

If your editor has InsForge MCP tools configured:

```javascript
// Use the create-deployment MCP tool
{
  "name": "recommendher",
  "source": "./dist",
  "backendUrl": "https://aku8v88g.us-east.insforge.app"
}
```

---

## Files Ready for Deployment

| File | Size | Description |
|------|------|-------------|
| `dist/` | ~1.7MB | Built application |
| `deploy-package-20260214-162527.zip` | 1.7MB | Zipped deployment package |
| `deploy-vps.sh` | - | VPS deployment script |

---

## Post-Deployment Checklist

- [ ] App loads correctly at the deployed URL
- [ ] Navigation between pages works (React Router)
- [ ] Supabase connection is working
- [ ] Contact forms submit correctly
- [ ] Images load properly

---

## Troubleshooting

### 404 on page refresh (VPS/Nginx)
Make sure Nginx is configured with:
```nginx
try_files $uri $uri/ /index.html;
```

### Environment variables not working
Ensure all `VITE_` prefixed env vars are set at build time.

### API connection errors
Verify the InsForge backend URL is correct and accessible.
