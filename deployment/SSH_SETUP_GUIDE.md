# SSH Setup Guide for GitHub Actions Deployment

## Step 1: Generate SSH Key Pair

On your local machine or server, generate a new SSH key pair specifically for deployment:

```bash
# Generate SSH key pair (use RSA format for better compatibility)
ssh-keygen -t rsa -b 4096 -C "github-actions@astrokabinet.id" -f ~/.ssh/astrokabinet_deploy -N ""

# This creates two files:
# ~/.ssh/astrokabinet_deploy (private key) - for GitHub secrets
# ~/.ssh/astrokabinet_deploy.pub (public key) - for server
```

## Step 2: Set up the Server

### 2.1: Create deployer user (if not exists)
```bash
# Connect to your server as root or sudo user
ssh astro@103.117.56.159

# Create deployer user
sudo useradd -m -s /bin/bash deployer
sudo usermod -aG www-data deployer

# Set up SSH directory for deployer
sudo mkdir -p /home/deployer/.ssh
sudo chmod 700 /home/deployer/.ssh
sudo chown deployer:deployer /home/deployer/.ssh
```

### 2.2: Add public key to server
```bash
# Copy your public key content
cat ~/.ssh/astrokabinet_deploy.pub

# On the server, add it to authorized_keys
sudo nano /home/deployer/.ssh/authorized_keys
# Paste the public key content here

# Set correct permissions
sudo chmod 600 /home/deployer/.ssh/authorized_keys
sudo chown deployer:deployer /home/deployer/.ssh/authorized_keys
```

### 2.3: Give deployer necessary permissions
```bash
# Allow deployer to manage the web directory
sudo chown -R deployer:www-data /var/www/astrokabinet.id
sudo chmod -R 755 /var/www/astrokabinet.id

# Allow deployer to restart services (create sudoers file)
sudo tee /etc/sudoers.d/deployer > /dev/null <<EOF
deployer ALL=(ALL) NOPASSWD: /bin/chown
deployer ALL=(ALL) NOPASSWD: /bin/chmod
deployer ALL=(ALL) NOPASSWD: /usr/sbin/service php8.2-fpm restart
deployer ALL=(ALL) NOPASSWD: /usr/sbin/service nginx restart
deployer ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart php8.2-fpm
deployer ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
EOF
```

## Step 3: Test SSH Connection

```bash
# Test the connection from your local machine
ssh -i ~/.ssh/astrokabinet_deploy deployer@103.117.56.159

# If successful, you should be able to connect without password
```

## Step 4: Set up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Required Secrets:

1. **SSH_PRIVATE_KEY**
   ```bash
   # Copy the ENTIRE private key content (including headers)
   cat ~/.ssh/astrokabinet_deploy
   ```
   Copy everything from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----`

2. **REMOTE_HOST**
   ```
   103.117.56.159
   ```

3. **REMOTE_USER**
   ```
   deployer
   ```

4. **REMOTE_TARGET**
   ```
   /var/www/astrokabinet.id
   ```

5. **ENV** (Production environment variables)
   ```env
   APP_NAME=AstroKabinet
   APP_ENV=production
   APP_KEY=base64:YOUR_APP_KEY_HERE
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

   MAIL_MAILER=smtp
   MAIL_HOST=localhost
   MAIL_PORT=587
   MAIL_USERNAME=null
   MAIL_PASSWORD=null
   MAIL_FROM_ADDRESS="noreply@astrokabinet.id"
   MAIL_FROM_NAME="${APP_NAME}"

   VITE_APP_NAME="${APP_NAME}"
   VITE_APP_URL="${APP_URL}"

   WHATSAPP_NUMBER=6281234567890
   BANK_NAME=BCA
   BANK_ACCOUNT_NAME=PT Astro Kabinet Indonesia
   BANK_ACCOUNT_NUMBER=1234567890
   ```

## Step 5: Troubleshooting

### If SSH still fails:

1. **Check SSH key format**:
   ```bash
   # Ensure the private key starts with:
   -----BEGIN OPENSSH PRIVATE KEY-----
   # or
   -----BEGIN RSA PRIVATE KEY-----
   ```

2. **Test SSH connection manually**:
   ```bash
   ssh -i ~/.ssh/astrokabinet_deploy -v deployer@103.117.56.159
   ```

3. **Check server SSH logs**:
   ```bash
   sudo tail -f /var/log/auth.log
   ```

4. **Verify file permissions on server**:
   ```bash
   ls -la /home/deployer/.ssh/
   # Should show:
   # drwx------ 2 deployer deployer 4096 ... .
   # -rw------- 1 deployer deployer  xxx ... authorized_keys
   ```

## Step 6: Alternative SSH Deploy Action

If the current action still fails, we can switch to a more reliable one. Update your `.github/workflows/deploy.yml`:

```yaml
- name: Deploy to Server
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.REMOTE_HOST }}
    username: ${{ secrets.REMOTE_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      # Remove old files and sync new ones
      rm -rf /tmp/astrokabinet-deploy
      mkdir -p /tmp/astrokabinet-deploy
      
- name: Copy files to server
  uses: appleboy/scp-action@v0.1.7
  with:
    host: ${{ secrets.REMOTE_HOST }}
    username: ${{ secrets.REMOTE_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    source: "."
    target: "/tmp/astrokabinet-deploy"
    
- name: Deploy application
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.REMOTE_HOST }}
    username: ${{ secrets.REMOTE_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      # Move files to web directory
      sudo rsync -av --delete /tmp/astrokabinet-deploy/ ${{ secrets.REMOTE_TARGET }}/
      cd ${{ secrets.REMOTE_TARGET }}
      
      # Continue with Laravel deployment commands...
```
