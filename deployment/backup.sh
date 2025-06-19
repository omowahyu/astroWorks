#!/bin/bash

# AstroKabinet Backup Script
# Backup database dan storage sebelum deployment

set -e

echo "💾 Creating backup before deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/var/backups/astrokabinet"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="astroworks"
DB_USER="astro"
DB_PASS="QjytaT#YL6"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
print_status "Creating backup directory..."
sudo mkdir -p $BACKUP_DIR
sudo chown -R $USER:$USER $BACKUP_DIR

# Backup database
print_status "Backing up database..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/database_backup_$DATE.sql
cp $BACKUP_DIR/database_backup_$DATE.sql $BACKUP_DIR/database_backup.sql

# Backup storage directory
print_status "Backing up storage files..."
if [ -d "./storage" ]; then
    tar -czf $BACKUP_DIR/storage_backup_$DATE.tar.gz ./storage
    # Keep latest backup as storage_backup.tar.gz
    cp $BACKUP_DIR/storage_backup_$DATE.tar.gz $BACKUP_DIR/storage_backup.tar.gz
    
    # Also create a directory backup for easy restore
    rm -rf $BACKUP_DIR/storage
    cp -r ./storage $BACKUP_DIR/storage
fi

# Backup .env file
print_status "Backing up environment file..."
if [ -f "./.env.production" ]; then
    cp ./.env.production $BACKUP_DIR/env_backup_$DATE
    cp ./.env.production $BACKUP_DIR/env_backup
fi

# Create backup info file
print_status "Creating backup info..."
cat > $BACKUP_DIR/backup_info_$DATE.txt <<EOF
Backup created: $(date)
Database: $DB_NAME
Files backed up:
- Database: database_backup_$DATE.sql
- Storage: storage_backup_$DATE.tar.gz
- Environment: env_backup_$DATE

Backup location: $BACKUP_DIR
EOF

# Clean old backups (keep last 5)
print_status "Cleaning old backups..."
cd $BACKUP_DIR
ls -t database_backup_*.sql | tail -n +6 | xargs -r rm
ls -t storage_backup_*.tar.gz | tail -n +6 | xargs -r rm
ls -t env_backup_* | grep -v "env_backup$" | tail -n +6 | xargs -r rm
ls -t backup_info_*.txt | tail -n +6 | xargs -r rm

print_status "✅ Backup completed successfully!"
echo "Backup location: $BACKUP_DIR"
echo "Latest backup files:"
echo "- Database: database_backup.sql"
echo "- Storage: storage_backup.tar.gz"
echo "- Environment: env_backup"
echo ""
echo "Timestamped backups:"
echo "- Database: database_backup_$DATE.sql"
echo "- Storage: storage_backup_$DATE.tar.gz"
echo "- Environment: env_backup_$DATE"
