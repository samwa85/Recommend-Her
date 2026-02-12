#!/bin/bash
# =============================================================================
# Setup Script for Email Notifications
# Recommend Her Application
# =============================================================================
# Run this script as root on the server (145.223.96.191)
# 
# Usage: 
#   chmod +x setup-email-notifications.sh
#   ./setup-email-notifications.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# =============================================================================
# USER INPUT
# =============================================================================

get_user_input() {
    log_step "Please provide the following information:"
    
    echo -n "Enter your Gmail address (e.g., you@gmail.com): "
    read -r GMAIL_USER
    
    echo -n "Enter your Gmail App Password (16 characters, no spaces): "
    read -rs GMAIL_APP_PASSWORD
    echo
    
    echo -n "Enter your Supabase PostgreSQL password: "
    read -rs DB_PASSWORD
    echo
    
    echo -n "Enter notification email (default: samwa85@gmail.com): "
    read -r NOTIFY_EMAIL
    NOTIFY_EMAIL=${NOTIFY_EMAIL:-"samwa85@gmail.com"}
    
    log_info "Configuration collected."
}

# =============================================================================
# INSTALL DEPENDENCIES
# =============================================================================

install_dependencies() {
    log_step "Installing dependencies..."
    
    apt-get update
    
    # Install msmtp (lightweight SMTP relay)
    if ! command -v msmtp &> /dev/null; then
        log_info "Installing msmtp..."
        apt-get install -y msmtp msmtp-mta
    else
        log_info "msmtp already installed."
    fi
    
    # Install PostgreSQL client
    if ! command -v psql &> /dev/null; then
        log_info "Installing postgresql-client..."
        apt-get install -y postgresql-client
    else
        log_info "postgresql-client already installed."
    fi
    
    # Install mailutils for testing (optional)
    if ! command -v mail &> /dev/null; then
        log_info "Installing mailutils..."
        apt-get install -y mailutils
    else
        log_info "mailutils already installed."
    fi
    
    log_info "Dependencies installed successfully."
}

# =============================================================================
# CONFIGURE MSMTP
# =============================================================================

configure_msmtp() {
    log_step "Configuring msmtp..."
    
    # Create msmtp configuration
    cat > /etc/msmtprc <<EOF
# =============================================================================
# msmtp Configuration for Recommend Her
# =============================================================================

# Set default values for all following accounts
defaults
auth on
tls on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile /var/log/msmtp.log

# Gmail account
account gmail
host smtp.gmail.com
port 587
from noreply@recommendher.org
tls_starttls on
user ${GMAIL_USER}
password ${GMAIL_APP_PASSWORD}

# Set default account
default gmail
EOF
    
    # Set secure permissions
    chmod 600 /etc/msmtprc
    
    # Create log file
    touch /var/log/msmtp.log
    chmod 644 /var/log/msmtp.log
    
    # Set msmtp as system mailer
    cat > /etc/mail.rc <<EOF
# Use msmtp as the default mail transfer agent
set sendmail=/usr/bin/msmtp
EOF
    
    log_info "msmtp configured successfully."
}

# =============================================================================
# CONFIGURE POSTGRESQL
# =============================================================================

configure_postgresql() {
    log_step "Configuring PostgreSQL connection..."
    
    # Create .pgpass file for passwordless authentication
    cat > /root/.pgpass <<EOF
# Supabase PostgreSQL connection
db.dcgko804wcgwow4s4ko40000.supabase.co:5432:postgres:postgres:${DB_PASSWORD}
EOF
    
    # Set secure permissions (required by PostgreSQL)
    chmod 600 /root/.pgpass
    
    log_info "PostgreSQL connection configured successfully."
}

# =============================================================================
# SETUP NOTIFICATION SCRIPT
# =============================================================================

setup_notification_script() {
    log_step "Setting up notification script..."
    
    # Copy and configure the notification script
    cat > /opt/notify-contact.sh <<'SCRIPT_EOF'
#!/bin/bash
# =============================================================================
# Contact Form Email Notification Script
# Recommend Her Application
# =============================================================================

set -euo pipefail

# Configuration
NOTIFY_EMAIL="__NOTIFY_EMAIL__"
FROM_EMAIL="noreply@recommendher.org"
FROM_NAME="Recommend Her"
DB_HOST="db.dcgko804wcgwow4s4ko40000.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if psql is available
if ! command -v psql &> /dev/null; then
    log "ERROR: psql is not installed."
    exit 1
fi

# Check if msmtp is available
if ! command -v msmtp &> /dev/null; then
    log "ERROR: msmtp is not installed."
    exit 1
fi

# Temporary file for query results
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Query for unnotified submissions
log "Querying for unnotified contact submissions..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -F '|' <<'PSQL_EOF' > "$TEMP_FILE"
SELECT 
    id,
    full_name,
    email,
    inquiry_type,
    COALESCE(organization, 'N/A'),
    message,
    to_char(created_at, 'YYYY-MM-DD HH24:MI:SS')
FROM public.contact_submissions
WHERE notified_at IS NULL
ORDER BY created_at ASC
LIMIT 50;
PSQL_EOF

# Check if there are any new submissions
if [ ! -s "$TEMP_FILE" ] || [ "$(wc -l < "$TEMP_FILE")" -eq 0 ]; then
    log "No new contact submissions found."
    exit 0
fi

# Count submissions
SUBMISSION_COUNT=$(wc -l < "$TEMP_FILE")
log "Found $SUBMISSION_COUNT new contact submission(s)."

# Build email content
EMAIL_SUBJECT="New Contact Form Submission(s) - Recommend Her"

EMAIL_BODY="From: ${FROM_NAME} <${FROM_EMAIL}>
To: ${NOTIFY_EMAIL}
Subject: ${EMAIL_SUBJECT}
Content-Type: text/plain; charset=UTF-8

============================================
RECOMMEND HER - NEW CONTACT FORM SUBMISSIONS
============================================

You have ${SUBMISSION_COUNT} new contact form submission(s) to review.

----------------------------------------
SUBMISSION DETAILS
----------------------------------------

"

# Process each submission
IDS_TO_MARK=()
COUNTER=1

while IFS='|' read -r id full_name email inquiry_type organization message created_at; do
    EMAIL_BODY+="
#${COUNTER}
---
Name: ${full_name}
Email: ${email}
Inquiry Type: ${inquiry_type}
Organization: ${organization}
Submitted: ${created_at}

Message:
${message}

"
    IDS_TO_MARK+=("'$id'")
    ((COUNTER++))
done < "$TEMP_FILE"

EMAIL_BODY+="
----------------------------------------
ACTION REQUIRED
----------------------------------------

Please review these submissions in the admin dashboard:
https://recommendher.org/admin

----------------------------------------
This is an automated notification from Recommend Her.
----------------------------------------
"

# Send email using msmtp
log "Sending notification email to ${NOTIFY_EMAIL}..."

if echo "$EMAIL_BODY" | msmtp "$NOTIFY_EMAIL"; then
    log "Email sent successfully."
    
    # Mark submissions as notified
    if [ ${#IDS_TO_MARK[@]} -gt 0 ]; then
        IDS_STRING=$(IFS=','; echo "{${IDS_TO_MARK[*]}}")
        log "Marking ${#IDS_TO_MARK[@]} submission(s) as notified..."
        
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<PSQL_EOF2
SELECT public.mark_contact_submissions_notified('${IDS_STRING}'::uuid[]);
PSQL_EOF2
        
        log "Submissions marked as notified."
    fi
else
    log "ERROR: Failed to send email notification."
    exit 1
fi

log "Notification process completed successfully."
exit 0
SCRIPT_EOF

    # Replace placeholder with actual email
    sed -i "s/__NOTIFY_EMAIL__/${NOTIFY_EMAIL}/g" /opt/notify-contact.sh
    
    # Make script executable
    chmod +x /opt/notify-contact.sh
    
    # Create log file
    touch /var/log/notify-contact.log
    chmod 644 /var/log/notify-contact.log
    
    log_info "Notification script installed to /opt/notify-contact.sh"
}

# =============================================================================
# SETUP CRON JOB
# =============================================================================

setup_cron() {
    log_step "Setting up cron job..."
    
    # Remove any existing entry
    crontab -l 2>/dev/null | grep -v "notify-contact.sh" || true
    
    # Add new cron job (run every 5 minutes)
    (crontab -l 2>/dev/null || true; echo "*/5 * * * * /opt/notify-contact.sh >> /var/log/notify-contact.log 2>&1") | crontab -
    
    log_info "Cron job added (runs every 5 minutes)"
}

# =============================================================================
# VERIFY SETUP
# =============================================================================

verify_setup() {
    log_step "Verifying setup..."
    
    # Test PostgreSQL connection
    log_info "Testing PostgreSQL connection..."
    if psql -h db.dcgko804wcgwow4s4ko40000.supabase.co -p 5432 -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
        log_info "PostgreSQL connection: OK"
    else
        log_error "PostgreSQL connection failed. Please check your credentials."
        exit 1
    fi
    
    # Test email sending
    log_info "Testing email sending..."
    if echo "Test email from Recommend Her" | msmtp "${NOTIFY_EMAIL}" 2>/dev/null; then
        log_info "Email sending: OK"
    else
        log_warn "Email test may have failed. Check /var/log/msmtp.log for details."
    fi
    
    log_info "Setup verification complete."
}

# =============================================================================
# PRINT SUMMARY
# =============================================================================

print_summary() {
    echo
    echo "========================================"
    echo "   SETUP COMPLETE - SUMMARY"
    echo "========================================"
    echo
    echo "Configuration files:"
    echo "  - msmtp config: /etc/msmtprc"
    echo "  - PostgreSQL pass: /root/.pgpass"
    echo "  - Notification script: /opt/notify-contact.sh"
    echo
    echo "Logs:"
    echo "  - Notification log: /var/log/notify-contact.log"
    echo "  - msmtp log: /var/log/msmtp.log"
    echo
    echo "Cron job:"
    echo "  - Runs every 5 minutes"
    echo "  - View with: crontab -l"
    echo
    echo "Test commands:"
    echo "  - Test email: echo 'Test' | msmtp ${NOTIFY_EMAIL}"
    echo "  - Test DB: psql -h db.dcgko804wcgwow4s4ko40000.supabase.co -U postgres -d postgres -c 'SELECT 1;'"
    echo "  - Run script manually: /opt/notify-contact.sh"
    echo "  - View logs: tail -f /var/log/notify-contact.log"
    echo
    echo "========================================"
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    echo "========================================"
    echo "Recommend Her - Email Notification Setup"
    echo "========================================"
    echo
    
    check_root
    get_user_input
    install_dependencies
    configure_msmtp
    configure_postgresql
    setup_notification_script
    setup_cron
    verify_setup
    print_summary
}

main "$@"
