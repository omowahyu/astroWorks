# GitHub Secrets Configuration

To set up CI/CD deployment, you need to configure the following secrets in your GitHub repository:

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**
4. Click **New repository secret**

## Required Secrets

### SSH_PRIVATE_KEY
The private SSH key for the deployer user.

**To generate:**
```bash
# On your local machine or server
ssh-keygen -t rsa -b 4096 -C "deployer@astrokabinet.id" -f ~/.ssh/astrokabinet_deploy

# Copy the private key content
cat ~/.ssh/astrokabinet_deploy
```

**Value:** Paste the entire private key content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

### REMOTE_HOST
**Value:** `103.117.56.159`

### REMOTE_USER
**Value:** `deployer`

### REMOTE_TARGET
**Value:** `/var/www/astrokabinet.id`

### ENV
The complete production environment file content.

**Value:** Copy the entire content from `.env.production` file:

```env
APP_NAME=AstroKabinet
APP_ENV=production
APP_DEBUG=false
APP_URL=https://astrokabinet.id

APP_LOCALE=id
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=id_ID

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=astroworks
DB_USERNAME=astro
DB_PASSWORD=QjytaT#YL6

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=.astrokabinet.id
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database

CACHE_STORE=redis
CACHE_PREFIX=astrokabinet_cache

REDIS_CLIENT=phpredis
REDIS_HOST=localhost
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail Configuration (update with production SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@astrokabinet.id
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@astrokabinet.id"
MAIL_FROM_NAME="${APP_NAME}"

# AWS S3 Configuration (optional for file storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=ap-southeast-1
AWS_BUCKET=astrokabinet-storage
AWS_USE_PATH_STYLE_ENDPOINT=false

# CORS Configuration
SANCTUM_STATEFUL_DOMAINS=astrokabinet.id,www.astrokabinet.id,admin.astrokabinet.id,dashboard.astrokabinet.id
FRONTEND_URL=https://astrokabinet.id
ADMIN_URL=https://admin.astrokabinet.id

# Vite Configuration
VITE_APP_NAME="${APP_NAME}"
VITE_APP_URL="${APP_URL}"

# Payment Settings (will be managed via admin panel)
WHATSAPP_NUMBER=6281234567890
BANK_NAME=BCA
BANK_ACCOUNT_NAME=PT Astro Kabinet Indonesia
BANK_ACCOUNT_NUMBER=1234567890
```

## SSH Key Setup on Server

After generating the SSH key pair, you need to add the public key to the server:

```bash
# Copy the public key
cat ~/.ssh/astrokabinet_deploy.pub

# On the server, add it to authorized_keys for deployer user
sudo mkdir -p /home/deployer/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT" | sudo tee -a /home/deployer/.ssh/authorized_keys
sudo chown -R deployer:deployer /home/deployer/.ssh
sudo chmod 700 /home/deployer/.ssh
sudo chmod 600 /home/deployer/.ssh/authorized_keys
```

## Testing the Setup

After configuring all secrets, test the deployment by:

1. Making a small change to your code
2. Committing and pushing to the `main` branch
3. Check the Actions tab in GitHub to see the deployment progress
4. Verify the site is accessible at https://astrokabinet.id

## Troubleshooting

If deployment fails:

1. Check the GitHub Actions logs
2. Verify all secrets are correctly set
3. Ensure the deployer user has proper permissions on the server
4. Check server logs: `sudo tail -f /var/log/nginx/error.log`
