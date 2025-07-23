
#!/bin/bash

# Database backup script for Advies N Consultancy
# This script creates daily backups with rotation

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
DATABASE_URL=${DATABASE_URL:-"postgresql://localhost:5432/advies_n_consultancy"}
RETENTION_DAYS=7
MAX_BACKUPS=30
LOG_FILE="$PROJECT_ROOT/logs/backup.log"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="database_backup_${DATE}.sql"

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send notification (can be extended to email/slack)
send_notification() {
    local status=$1
    local message=$2
    log_message "$status: $message"
    # Future: Add email/slack notification here
}

# Function to cleanup old backups
cleanup_old_backups() {
    log_message "Starting cleanup of old backups..."
    
    # Remove backups older than retention period
    find "$BACKUP_DIR" -name "database_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "database_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Keep only max number of backups
    local backup_count=$(ls -1 "$BACKUP_DIR"/database_backup_*.sql* 2>/dev/null | wc -l)
    if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
        local files_to_remove=$((backup_count - MAX_BACKUPS))
        ls -1t "$BACKUP_DIR"/database_backup_*.sql* | tail -n "$files_to_remove" | xargs rm -f
        log_message "Removed $files_to_remove old backup files"
    fi
    
    log_message "Cleanup completed"
}

# Function to check database connectivity
check_database_connection() {
    log_message "Checking database connection..."
    
    if command -v psql >/dev/null 2>&1; then
        if psql "$DATABASE_URL" -c "SELECT version();" >/dev/null 2>&1; then
            log_message "Database connection successful"
            return 0
        else
            log_message "ERROR: Cannot connect to database"
            return 1
        fi
    else
        log_message "ERROR: psql command not found"
        return 1
    fi
}

# Function to create backup
create_backup() {
    log_message "Starting database backup..."
    
    # Create backup
    if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"; then
        log_message "Database backup created successfully: $BACKUP_FILE"
        
        # Compress backup
        if gzip "$BACKUP_DIR/$BACKUP_FILE"; then
            log_message "Backup compressed successfully: ${BACKUP_FILE}.gz"
            
            # Verify compressed file
            if [ -f "$BACKUP_DIR/${BACKUP_FILE}.gz" ]; then
                local file_size=$(stat -c%s "$BACKUP_DIR/${BACKUP_FILE}.gz")
                log_message "Backup file size: $file_size bytes"
                
                if [ "$file_size" -gt 0 ]; then
                    send_notification "SUCCESS" "Database backup completed successfully"
                    return 0
                else
                    send_notification "ERROR" "Backup file is empty"
                    return 1
                fi
            else
                send_notification "ERROR" "Compressed backup file not found"
                return 1
            fi
        else
            send_notification "ERROR" "Failed to compress backup"
            return 1
        fi
    else
        send_notification "ERROR" "Failed to create database backup"
        return 1
    fi
}

# Function to validate backup
validate_backup() {
    local backup_file="$BACKUP_DIR/${BACKUP_FILE}.gz"
    
    log_message "Validating backup file..."
    
    if [ -f "$backup_file" ]; then
        # Check if file can be decompressed
        if gzip -t "$backup_file" 2>/dev/null; then
            log_message "Backup file validation successful"
            return 0
        else
            log_message "ERROR: Backup file is corrupted"
            return 1
        fi
    else
        log_message "ERROR: Backup file not found"
        return 1
    fi
}

# Function to monitor disk space
check_disk_space() {
    local backup_dir_usage=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    local available_space=$(df -h "$(dirname "$BACKUP_DIR")" | awk 'NR==2 {print $4}')
    
    log_message "Backup directory usage: $backup_dir_usage"
    log_message "Available disk space: $available_space"
    
    # Check if available space is less than 1GB
    local available_kb=$(df "$(dirname "$BACKUP_DIR")" | awk 'NR==2 {print $4}')
    if [ "$available_kb" -lt 1048576 ]; then # 1GB in KB
        send_notification "WARNING" "Low disk space: $available_space remaining"
    fi
}

# Main execution
main() {
    log_message "=== Database Backup Started ==="
    
    # Check prerequisites
    if ! check_database_connection; then
        send_notification "ERROR" "Database connection failed"
        exit 1
    fi
    
    # Check disk space
    check_disk_space
    
    # Create backup
    if create_backup; then
        # Validate backup
        if validate_backup; then
            # Cleanup old backups
            cleanup_old_backups
            log_message "=== Database Backup Completed Successfully ==="
        else
            send_notification "ERROR" "Backup validation failed"
            exit 1
        fi
    else
        send_notification "ERROR" "Backup creation failed"
        exit 1
    fi
}

# Run main function
main "$@"
