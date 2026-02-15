#!/bin/bash
# Deploy script for my20i hosting
# This prepares the dist folder for manual upload

echo "=== Building Production Site ==="
npm run build

echo ""
echo "=== Creating deploy package ==="
mkdir -p deploy
cp -r dist/* deploy/
cp dist/.htaccess deploy/ 2>/dev/null || true

echo ""
echo "=== Deploy Package Ready ==="
echo "Files in ./deploy folder:"
ls -la deploy/

echo ""
echo "=== NEXT STEPS ==="
echo "1. Upload ALL files from the 'deploy' folder to your my20i public_html/"
echo "2. Make sure .htaccess is uploaded (it's hidden!)"
echo ""
echo "FTP Settings:"
echo "  Server: ftp.recommendher.africa"
echo "  Username: your my20i username"
echo "  Password: your my20i password"
echo "  Port: 21"
