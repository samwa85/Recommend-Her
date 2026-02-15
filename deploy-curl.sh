#!/bin/bash
# Deploy to InsForge using curl

INSFORGE_URL="https://aku8v88g.us-east.insforge.app"
SITE_NAME="recommendher"
DIST_DIR="./dist"

echo "🚀 Deploying to InsForge..."
echo "   Backend: $INSFORGE_URL"
echo "   Site: $SITE_NAME"
echo ""

# Create a temporary zip file
echo "📦 Zipping dist folder..."
zip -r /tmp/deploy.zip "$DIST_DIR" -x "*.DS_Store" -q

# Get file size
FILE_SIZE=$(stat -f%z /tmp/deploy.zip 2>/dev/null || stat -c%s /tmp/deploy.zip 2>/dev/null)
echo "   Size: $FILE_SIZE bytes"
echo ""

# Try different deployment endpoints
echo "📤 Uploading..."

# Try the sites/deploy endpoint with multipart/form-data
curl -X POST "$INSFORGE_URL/api/v1/sites/deploy" \
  -H "Content-Type: multipart/form-data" \
  -F "name=$SITE_NAME" \
  -F "files=@/tmp/deploy.zip;type=application/zip" \
  -v 2>&1 | tee /tmp/deploy-response.txt

echo ""
echo "✅ Upload complete. Check /tmp/deploy-response.txt for details."

# Cleanup
rm -f /tmp/deploy.zip
