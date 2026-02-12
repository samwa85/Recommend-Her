# Email Notification Setup for Recommend Her

This directory contains all the files needed to set up email notifications for the Recommend Her contact form.

## Overview

When someone submits the contact form on the website, a record is stored in the `contact_submissions` table in Supabase. This notification system:

1. Checks for new (unnotified) submissions every 5 minutes
2. Sends an email summary to `samwa85@gmail.com`
3. Marks notified submissions to prevent duplicates

## Files in this Directory

| File | Description |
|------|-------------|
| `setup-email-notifications.sh` | **Main setup script** - Run this on the server |
| `notify-contact.sh` | The notification script (installed to `/opt/notify-contact.sh`) |
| `msmtprc` | msmtp configuration template |
| `.pgpass` | PostgreSQL password file template |
| `../migrations/011_add_contact_notification.sql` | Database migration |

## Prerequisites

1. **Gmail Account** with 2-Factor Authentication enabled
2. **Gmail App Password** (not your regular password)
3. **Supabase PostgreSQL password**

### How to Create a Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Sign in with your Google account
3. Select "Mail" as the app
4. Select "Other (Custom name)" and name it "Recommend Her Server"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. **Remove spaces** when using it: `abcdefghijklmnop`

## Quick Setup (Recommended)

### Step 1: Apply Database Migration

First, run the database migration to add the `notified_at` column:

```bash
# Connect to Supabase and run the migration
psql -h db.dcgko804wcgwow4s4ko40000.supabase.co -p 5432 -U postgres -d postgres \
  -f migrations/011_add_contact_notification.sql
```

Or run the SQL directly in the Supabase dashboard SQL editor.

### Step 2: Upload Setup Script to Server

```bash
# Upload the setup script to your server
scp server-setup/setup-email-notifications.sh root@145.223.96.191:/root/

# SSH into the server
ssh root@145.223.96.191
```

### Step 3: Run the Setup Script

```bash
# Make the script executable and run it
cd /root
chmod +x setup-email-notifications.sh
./setup-email-notifications.sh
```

The script will:
- Install `msmtp`, `postgresql-client`, and `mailutils`
- Configure msmtp with your Gmail credentials
- Configure PostgreSQL connection
- Install the notification script to `/opt/notify-contact.sh`
- Set up a cron job to run every 5 minutes
- Test the configuration

### Step 4: Enter Your Credentials

During the setup, you'll be prompted for:
- Gmail address
- Gmail App Password (16 characters, no spaces)
- Supabase PostgreSQL password
- Notification email (default: samwa85@gmail.com)

## Manual Setup (Alternative)

If you prefer to set up manually, follow these steps:

### 1. Install Dependencies

```bash
apt-get update
apt-get install -y msmtp msmtp-mta postgresql-client mailutils
```

### 2. Configure msmtp

Create `/etc/msmtprc`:

```bash
cat > /etc/msmtprc << 'EOF'
defaults
auth on
tls on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile /var/log/msmtp.log

account gmail
host smtp.gmail.com
port 587
from noreply@recommendher.org
tls_starttls on
user YOUR_GMAIL@gmail.com
password YOUR_APP_PASSWORD

default gmail
EOF

chmod 600 /etc/msmtprc
```

### 3. Configure PostgreSQL Password

Create `/root/.pgpass`:

```bash
cat > /root/.pgpass << 'EOF'
db.dcgko804wcgwow4s4ko40000.supabase.co:5432:postgres:postgres:YOUR_DB_PASSWORD
EOF

chmod 600 /root/.pgpass
```

### 4. Install Notification Script

```bash
cp server-setup/notify-contact.sh /opt/notify-contact.sh
chmod +x /opt/notify-contact.sh
touch /var/log/notify-contact.log
```

Edit `/opt/notify-contact.sh` and update the `NOTIFY_EMAIL` variable if needed.

### 5. Set Up Cron Job

```bash
# Add cron job
crontab -e

# Add this line:
*/5 * * * * /opt/notify-contact.sh >> /var/log/notify-contact.log 2>&1
```

## Testing

### Test Email Sending

```bash
echo "Test email from Recommend Her" | msmtp samwa85@gmail.com
```

Check the log:
```bash
tail -f /var/log/msmtp.log
```

### Test Database Connection

```bash
psql -h db.dcgko804wcgwow4s4ko40000.supabase.co -p 5432 -U postgres -d postgres -c "SELECT 1;"
```

### Test Notification Script

```bash
/opt/notify-contact.sh
```

### Check Cron Logs

```bash
tail -f /var/log/notify-contact.log
```

## Troubleshooting

### Email Not Sending

1. Check msmtp log: `tail /var/log/msmtp.log`
2. Verify Gmail App Password is correct (not your regular password)
3. Ensure "Less secure app access" is NOT required when using App Passwords
4. Check if 2-Factor Authentication is enabled on your Google account

### Database Connection Failed

1. Verify `.pgpass` file has correct permissions: `chmod 600 /root/.pgpass`
2. Check the password is correct
3. Ensure the Supabase database is accessible from your server IP

### Script Not Running via Cron

1. Check cron is running: `systemctl status cron`
2. Check cron logs: `grep CRON /var/log/syslog`
3. Ensure script is executable: `chmod +x /opt/notify-contact.sh`
4. Test script manually to see errors

### Gmail Authentication Issues

If you see "Authentication failed":
- Make sure you're using an App Password, not your regular Gmail password
- Ensure the App Password has no spaces: `abcd efgh ijkl mnop` → `abcdefghijklmnop`
- Verify 2-Factor Authentication is enabled on your Google account

## Security Notes

- **Never commit passwords to git**
- The `.pgpass` and `msmtprc` files should have `600` permissions
- Use App Passwords instead of your main Gmail password
- Consider using a dedicated Gmail account for sending notifications

## Alternative: Using SendGrid (Free Tier)

If Gmail doesn't work for you, consider SendGrid:

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create an API key
3. Update `/etc/msmtprc`:

```
defaults
auth on
tls on
tls_starttls on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile /var/log/msmtp.log

account sendgrid
host smtp.sendgrid.net
port 587
from noreply@recommendher.org
user apikey
password YOUR_SENDGRID_API_KEY

default sendgrid
```

## Alternative: Using AWS SES

For production use with higher volumes, consider AWS SES:

1. Set up AWS SES in your AWS account
2. Verify your domain or email
3. Create SMTP credentials
4. Update `/etc/msmtprc` with SES SMTP settings

## Monitoring

To monitor the notification system:

```bash
# Watch notification logs
tail -f /var/log/notify-contact.log

# Watch msmtp logs
tail -f /var/log/msmtp.log

# Check cron execution
grep notify-contact /var/log/syslog

# Check recent submissions
psql -h db.dcgko804wcgwow4s4ko40000.supabase.co -p 5432 -U postgres -d postgres -c "SELECT id, full_name, email, inquiry_type, notified_at FROM contact_submissions ORDER BY created_at DESC LIMIT 10;"
```

## Uninstall

To remove the notification system:

```bash
# Remove cron job
crontab -l | grep -v notify-contact | crontab -

# Remove scripts and configs
rm -f /opt/notify-contact.sh
rm -f /etc/msmtprc
rm -f /root/.pgpass

# Remove logs (optional)
rm -f /var/log/notify-contact.log
rm -f /var/log/msmtp.log
```

The database column `notified_at` can be removed if needed:

```sql
ALTER TABLE public.contact_submissions DROP COLUMN notified_at;
DROP FUNCTION IF EXISTS public.mark_contact_submissions_notified(uuid[]);
DROP VIEW IF EXISTS public.v_unnotified_contact_submissions;
```
