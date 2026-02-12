#!/bin/bash
# =============================================================================
# Contact Form Email Notification Script
# Recommend Her Application
# =============================================================================
# This script queries the Supabase database for new (unnotified) contact form
# submissions and sends email notifications.
# 
# Usage: /opt/notify-contact.sh
# Cron: */5 * * * * /opt/notify-contact.sh >> /var/log/notify-contact.log 2>&1
# =============================================================================

set -euo pipefail

# Configuration
NOTIFY_EMAIL="samwa85@gmail.com"
FROM_EMAIL="noreply@recommendher.org"
FROM_NAME="Recommend Her"
DB_HOST="db.dcgko804wcgwow4s4ko40000.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
# Note: DB_PASSWORD should be set in /root/.pgpass or as environment variable

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if psql is available
if ! command -v psql &> /dev/null; then
    log "ERROR: psql is not installed. Please install postgresql-client."
    exit 1
fi

# Check if msmtp is available
if ! command -v msmtp &> /dev/null; then
    log "ERROR: msmtp is not installed. Please install msmtp."
    exit 1
fi

# Temporary file for query results
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Query for unnotified submissions
log "Querying for unnotified contact submissions..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -F '|' <<'EOF' > "$TEMP_FILE"
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
EOF

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
To stop receiving these emails, contact your system administrator.
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
        
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
SELECT public.mark_contact_submissions_notified('${IDS_STRING}'::uuid[]);
EOF
        
        log "Submissions marked as notified."
    fi
else
    log "ERROR: Failed to send email notification."
    exit 1
fi

log "Notification process completed successfully."
exit 0
