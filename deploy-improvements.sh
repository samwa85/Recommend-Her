#!/bin/bash
# ============================================================================
# DEPLOYMENT SCRIPT FOR ROBUSTNESS IMPROVEMENTS
# Run this script to apply all improvements
# ============================================================================

set -e  # Exit on any error

echo "🚀 Starting deployment of robustness improvements..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# STEP 1: Check prerequisites
# ============================================================================
echo "📋 Checking prerequisites..."

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# ============================================================================
# STEP 2: Install dependencies
# ============================================================================
echo "📦 Installing dependencies..."

# Check if sonner is already installed
if ! npm list sonner &> /dev/null; then
    echo "Installing sonner for toast notifications..."
    npm install sonner
else
    echo "sonner already installed"
fi

# Check if date-fns is installed
if ! npm list date-fns &> /dev/null; then
    echo "Installing date-fns for date formatting..."
    npm install date-fns
else
    echo "date-fns already installed"
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# ============================================================================
# STEP 3: Build project to check for errors
# ============================================================================
echo "🔨 Building project..."
npm run build

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# ============================================================================
# STEP 4: Database migrations reminder
# ============================================================================
echo -e "${YELLOW}⚠️  IMPORTANT: Database Migrations Required${NC}"
echo ""
echo "You need to run these SQL files in your Supabase SQL Editor:"
echo ""
echo "  1. migrations/007_sponsor_anonymous_submissions.sql"
echo "  2. migrations/008_contact_submissions.sql"
echo "  3. migrations/009_rate_limiting.sql"
echo "  4. migrations/010_soft_deletes.sql"
echo ""
echo "Go to: https://app.supabase.com/project/_/sql"
echo ""

# ============================================================================
# STEP 5: Summary
# ============================================================================
echo "📊 DEPLOYMENT SUMMARY"
echo "===================="
echo ""
echo -e "${GREEN}✅ Code changes deployed:${NC}"
echo "  • Rate limiting (migration 009)"
echo "  • Input sanitization library"
echo "  • Toast notifications hook"
echo "  • Error tracking system"
echo "  • Retry mechanism with offline support"
echo "  • Soft deletes (migration 010)"
echo "  • Health check system"
echo "  • Enhanced form validation"
echo ""
echo -e "${YELLOW}⏳ Pending (requires manual action):${NC}"
echo "  • Run database migrations in Supabase"
echo "  • Update .env with production values"
echo "  • Optional: Set up Sentry for error tracking"
echo "  • Optional: Set up monitoring alerts"
echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run the 4 SQL migrations in Supabase"
echo "  2. Test the forms work correctly"
echo "  3. Deploy to production"
echo ""
