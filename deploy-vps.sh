#!/bin/bash
# ============================================================================
# VPS Deployment Script for RecommendHer
# Target: root@145.223.96.191
# ============================================================================

set -e

echo "🚀 Starting RecommendHer Deployment to VPS"
echo "   Server: 145.223.96.191"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v ssh &> /dev/null; then
    echo -e "${RED}❌ SSH is not installed${NC}"
    exit 1
fi

if ! command -v rsync &> /dev/null; then
    echo -e "${YELLOW}⚠️  rsync not found, will use scp instead${NC}"
    USE_SCP=true
else
    USE_SCP=false
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# Build the app
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Deploy to server
echo "📤 Deploying to VPS..."
SERVER="root@145.223.96.191"
REMOTE_DIR="/var/www/recommendher"

echo "   Creating remote directory..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

if [ "$USE_SCP" = true ]; then
    echo "   Uploading files (using scp)..."
    scp -r dist/* $SERVER:$REMOTE_DIR/
else
    echo "   Uploading files (using rsync)..."
    rsync -avz --delete dist/ $SERVER:$REMOTE_DIR/
fi

echo -e "${GREEN}✅ Files uploaded${NC}"
echo ""

# Setup Nginx if not already configured
echo "⚙️  Configuring Nginx..."
ssh $SERVER "
if [ ! -f /etc/nginx/sites-available/recommendher ]; then
    cat > /etc/nginx/sites-available/recommendher << 'EOF'
server {
    listen 80;
    server_name 145.223.96.191;
    root /var/www/recommendher;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
}
EOF
    ln -sf /etc/nginx/sites-available/recommendher /etc/nginx/sites-enabled/
    nginx -t && systemctl restart nginx
fi
"

echo -e "${GREEN}✅ Nginx configured${NC}"
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "Your app is now deployed at:"
echo "   http://145.223.96.191"
echo ""
echo "To check server status:"
echo "   ssh root@145.223.96.191 'systemctl status nginx'"
echo ""
