# Deploy to my20i - recommendher.africa

## ✅ Production Build Ready

The production build is located in the `dist/` folder. This is what needs to be deployed to my20i.

## 🚀 Deployment Methods

### Method 1: Change Document Root (RECOMMENDED)

In your my20i control panel:

1. Go to **Hosting Settings** or **Document Root**
2. Change from:
   ```
   /public_html
   ```
   To:
   ```
   /public_html/dist
   ```
3. Save changes
4. Clear browser cache and visit https://recommendher.africa

### Method 2: FTP Upload

If you cannot change the document root:

1. **Build the project** (already done - files are in `dist/`)

2. **Connect via FTP** to `ftp.recommendher.africa`

3. **Delete all files** in `public_html/` (BACKUP FIRST!)

4. **Upload ALL contents** from `dist/` folder to `public_html/`:
   ```
   public_html/
   ├── .htaccess          ← IMPORTANT: For SPA routing
   ├── index.html         ← Production build
   ├── assets/
   │   ├── index-XXXX.js
   │   ├── index-XXXX.css
   │   └── ... (other JS chunks)
   ├── images/
   ├── robots.txt
   ├── site.webmanifest
   └── sitemap.xml
   ```

5. **Verify `.htaccess` is uploaded** - This enables React Router to work

### Method 3: Git Deployment with Build Step

If my20i supports Node.js builds:

1. In Git settings, add **Build Command**:
   ```bash
   npm install && npm run build
   ```

2. Set **Deploy Directory** to `dist/`

## 🔧 Files Included in dist/

| File | Purpose |
|------|---------|
| `index.html` | Main HTML with production JS/CSS references |
| `.htaccess` | Apache rewrite rules for SPA routing |
| `assets/` | All JavaScript and CSS bundles |
| `images/` | Static images |
| `robots.txt` | SEO crawler instructions |
| `site.webmanifest` | PWA manifest |
| `sitemap.xml` | SEO sitemap |

## ✅ Verification Checklist

After deployment, verify:

- [ ] https://recommendher.africa loads without errors
- [ ] Navigation links work (Home, For Talent, For Sponsors, etc.)
- [ ] Direct URL access works (e.g., https://recommendher.africa/for-talent)
- [ ] Page refreshes on sub-routes work (this confirms .htaccess is working)

## 🐛 Troubleshooting

### Blank Screen
- Check browser console for 404 errors on JS files
- Ensure `assets/` folder was uploaded correctly
- Verify file permissions (644 for files, 755 for folders)

### 404 on Page Refresh
- `.htaccess` file is missing or not being read
- Contact my20i to enable `mod_rewrite`

### Wrong Content Showing
- Server is serving root `index.html` instead of `dist/index.html`
- Change document root to `public_html/dist` or upload `dist/` contents directly to `public_html/`

## 📞 Need Help?

Check the browser console (F12) for specific errors and share them if issues persist.
