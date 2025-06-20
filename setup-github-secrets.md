# Setup GitHub Secrets untuk Auto-Deployment

Untuk mengaktifkan auto-deployment dengan GitHub Actions, Anda perlu menambahkan secrets berikut di repository GitHub:

## Required Secrets

1. **VPS_HOST**: `103.117.56.159`
2. **VPS_USERNAME**: `deploy`
3. **VPS_PORT**: `22`
4. **SSH_PRIVATE_KEY**: Private key untuk akses SSH

## Cara Setup SSH Key

### 1. Generate SSH Key Pair (jika belum ada)

```bash
# Di local machine atau GitHub Actions runner
ssh-keygen -t rsa -b 4096 -C "github-actions@astrokabinet.id" -f ~/.ssh/astrokabinet_deploy
```

### 2. Copy Public Key ke Server

```bash
# Copy public key ke server
ssh-copy-id -i ~/.ssh/astrokabinet_deploy.pub deploy@103.117.56.159

# Atau manual copy
cat ~/.ssh/astrokabinet_deploy.pub | ssh deploy@103.117.56.159 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Add Private Key ke GitHub Secrets

1. Buka repository di GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add secrets:

```
Name: SSH_PRIVATE_KEY
Value: [isi dari file ~/.ssh/astrokabinet_deploy - copy seluruh content termasuk -----BEGIN dan -----END]

Name: VPS_HOST
Value: 103.117.56.159

Name: VPS_USERNAME  
Value: deploy

Name: VPS_PORT
Value: 22
```

## Fitur Auto-Deployment

### ✅ **Automatic Deployment**
- Trigger: Push ke branch `main` atau `production`
- Runs tests sebelum deploy
- Build Docker containers
- Deploy dengan health check

### ✅ **Automatic Rollback**
- Jika build gagal → rollback otomatis
- Jika health check gagal → rollback otomatis
- Backup otomatis sebelum deploy

### ✅ **Manual Rollback**
```bash
# Trigger manual rollback via GitHub Actions
# Go to Actions → Deploy AstroKabinet → Run workflow → Set rollback: true
```

### ✅ **Safety Features**
- Backup otomatis (keep 5 latest)
- Health check dengan retry
- Build retry mechanism
- Zero-downtime deployment

## Workflow Triggers

1. **Auto Deploy**: Push ke `main` branch
2. **Manual Deploy**: GitHub Actions → Run workflow
3. **Manual Rollback**: GitHub Actions → Run workflow → rollback: true

## Monitoring

Setelah setup, setiap push ke `main` akan:

1. ✅ Run tests
2. ✅ Build assets  
3. ✅ Create backup
4. ✅ Deploy to server
5. ✅ Health check
6. ✅ Rollback jika gagal

## Testing Deployment

```bash
# Test dengan push ke main branch
git add .
git commit -m "test auto deployment"
git push origin main

# Monitor di GitHub Actions tab
```

## Emergency Rollback

Jika website down dan perlu rollback cepat:

1. Go to GitHub → Actions
2. Click "Deploy AstroKabinet"  
3. Click "Run workflow"
4. Set "rollback" to `true`
5. Click "Run workflow"

Rollback akan selesai dalam 2-3 menit.
