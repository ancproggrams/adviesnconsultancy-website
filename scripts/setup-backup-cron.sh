
#!/bin/bash

# Setup automated database backups with cron
# This script sets up daily backups at 2 AM

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-database.sh"
CRON_JOB="0 2 * * * $BACKUP_SCRIPT"

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"

# Add cron job
echo "Setting up daily database backup..."

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    echo "Backup cron job already exists"
else
    # Add new cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "Backup cron job added successfully"
fi

# Create log directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$PROJECT_ROOT/logs"

# Test backup script
echo "Testing backup script..."
if "$BACKUP_SCRIPT"; then
    echo "Backup script test completed successfully"
else
    echo "Backup script test failed"
    exit 1
fi

echo "Automated backup system setup complete!"
echo "Backups will run daily at 2:00 AM"
echo "Logs will be stored in: $PROJECT_ROOT/logs/backup.log"
echo "Backups will be stored in: $PROJECT_ROOT/backups/"
