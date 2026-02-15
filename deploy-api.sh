#!/bin/bash
# Deploy to InsForge using direct API

API_KEY="ik_73120ab8bd730f732dd95bbdc954e38a"
API_BASE_URL="https://stz6f3dz.us-east.insforge.app"
PROJECT_DIR="/Users/samwa/Desktop/CODE ZERO/KIMI/Recommend Her"

echo "🚀 Deploying to InsForge..."
echo "   API: $API_BASE_URL"
echo ""

# Create a temp directory for the deployment
TEMP_DIR=$(mktemp -d)
echo "📦 Preparing deployment package..."

# Copy project files (excluding node_modules and dist)
rsync -av "$PROJECT_DIR/" "$TEMP_DIR/" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --quiet

echo "   Files prepared in $TEMP_DIR"
echo ""

# Create a zip file
echo "📦 Creating zip archive..."
cd "$TEMP_DIR"
zip -r "$TEMP_DIR/deploy.zip" . -q
echo "   Archive size: $(du -h "$TEMP_DIR/deploy.zip" | cut -f1)"
echo ""

# Try to deploy via API
echo "📤 Uploading to InsForge..."

# First, let's try the deployment API
curl -X POST "$API_BASE_URL/api/v1/deployments" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@$TEMP_DIR/deploy.zip" \
  -F "buildCommand=npm run build" \
  -F "outputDirectory=dist" \
  -v 2>&1 | tee /tmp/deploy-response.txt

echo ""
echo "✅ Upload complete!"
echo "   Check /tmp/deploy-response.txt for details"

# Cleanup
rm -rf "$TEMP_DIR"
