#!/bin/bash
# =============================================================================
# Deploy Script - Copy Setup Files to Server
# Recommend Her Application
# =============================================================================
# Run this script from your local machine to copy setup files to the server
# 
# Prerequisites:
#   - You have SSH access to root@145.223.96.191
#   - Server password: M@P&S1m@p&s1@
#
# Usage:
#   chmod +x deploy-to-server.sh
#   ./deploy-to-server.sh
# =============================================================================

SERVER_IP="145.223.96.191"
SERVER_USER="root"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "========================================"
echo "Recommend Her - Deploy to Server"
echo "========================================"
echo

# Check if scp is available
if ! command -v scp &> /dev/null; then
    log_error "scp command not found. Please install OpenSSH client."
    exit 1
fi

# Create temporary directory on server
log_step "Creating temporary directory on server..."
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "${SERVER_USER}@${SERVER_IP}" "mkdir -p /root/email-setup" 2>/dev/null

if [ $? -ne 0 ]; then
    log_error "Failed to connect to server. Please check:"
    log_error "  - Server IP is correct: ${SERVER_IP}"
    log_error "  - SSH is enabled on the server"
    log_error "  - You have the correct credentials"
    exit 1
fi

log_info "Server connection successful."

# Copy setup script
log_step "Copying setup script..."
scp -o StrictHostKeyChecking=no "${SCRIPT_DIR}/setup-email-notifications.sh" "${SERVER_USER}@${SERVER_IP}:/root/email-setup/"
if [ $? -ne 0 ]; then
    log_error "Failed to copy setup script."
    exit 1
fi
log_info "Setup script copied successfully."

# Copy database migration
log_step "Copying database migration..."
scp -o StrictHostKeyChecking=no "${PROJECT_DIR}/migrations/011_add_contact_notification.sql" "${SERVER_USER}@${SERVER_IP}:/root/email-setup/"
if [ $? -ne 0 ]; then
    log_error "Failed to copy database migration."
    exit 1
fi
log_info "Database migration copied successfully."

# Make setup script executable on server
log_step "Setting permissions on server..."
ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "chmod +x /root/email-setup/setup-email-notifications.sh"

log_info "Deployment complete!"
echo
echo "========================================"
echo "NEXT STEPS"
echo "========================================"
echo
echo "1. SSH into the server:"
echo "   ssh root@${SERVER_IP}"
echo
echo "2. Apply the database migration:"
echo "   cd /root/email-setup"
echo "   psql -h db.dcgko804wcgwow4s4ko40000.supabase.co -p 5432 -U postgres -d postgres -f 011_add_contact_notification.sql"
echo
echo "3. Run the setup script:"
echo "   cd /root/email-setup"
echo "   ./setup-email-notifications.sh"
echo
echo "4. Enter your credentials when prompted:"
echo "   - Gmail address"
echo "   - Gmail App Password (16 chars, no spaces)"
echo "   - Supabase PostgreSQL password"
echo
echo "========================================"
