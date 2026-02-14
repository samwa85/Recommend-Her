#!/bin/bash
# ============================================================================
# Blog Posts Table Migration Script
# Run this to create the blog_posts table in your InsForge/Supabase database
# ============================================================================

set -e

echo "📝 Blog Posts Table Migration"
echo "=============================="
echo ""

# Check if we can connect to the database
# Using the InsForge PostgREST API

SUPABASE_URL="https://aku8v88g.us-east.insforge.app"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc4NDd9.449oNdP5vOg1mQHlANE5-YhjB_6uTIZ63sTN6pfnzSQ"

echo "⚠️  This migration needs to be run in the InsForge SQL Editor or via psql"
echo ""
echo "Since the blog_posts table doesn't exist, you need to run the migration file:"
echo "  migrations/009_blog_posts.sql"
echo ""
echo "Options to run this migration:"
echo ""
echo "1. INSFORGE SQL EDITOR (Recommended):"
echo "   - Go to: https://aku8v88g.us-east.insforge.app/dashboard/sql"
echo "   - Or check your InsForge dashboard for the SQL Editor"
echo "   - Copy and paste the contents of migrations/009_blog_posts.sql"
echo "   - Click Run"
echo ""
echo "2. PSQL (if you have direct database access):"
echo "   psql -h <db-host> -p 5432 -U postgres -d postgres -f migrations/009_blog_posts.sql"
echo ""
echo "3. SUPABASE DASHBOARD (if using Supabase):"
echo "   - Go to: https://app.supabase.com/project/_/sql"
echo "   - Copy and paste the contents of migrations/009_blog_posts.sql"
echo "   - Click Run"
echo ""
echo "📄 Migration file location: migrations/009_blog_posts.sql"
echo ""

# Display the SQL that needs to be run
echo "📝 SQL to execute:"
echo "=================="
cat migrations/009_blog_posts.sql | head -50
echo "..."
echo ""
echo "Full SQL file has $(wc -l < migrations/009_blog_posts.sql) lines"
