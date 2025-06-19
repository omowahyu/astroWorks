#!/bin/bash

# AstroKabinet Simple Caddy Deployment Script
# Usage: ./deploy-caddy-simple.sh

set -e

echo "🚀 AstroKabinet Simple Caddy Deployment"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "composer.json" ]; then
    echo "❌ Error: composer.json not found. Are you in the right directory?"
    exit 1
fi

# Stop any existing Python server
echo "🛑 Stopping existing Python server..."
sudo pkill -f "python3 -m http.server" || true

# Install Caddy if not exists
if ! command -v caddy &> /dev/null; then
    echo "📦 Installing Caddy..."
    sudo apt update
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install caddy
fi

# Create simple Caddyfile for static files
echo "📝 Creating simple Caddyfile..."
cat > Caddyfile.static << 'EOF'
{
    admin off
    auto_https off
}

:80 {
    root * /var/www/astrokabinet.id/public
    
    encode gzip
    
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "no-referrer-when-downgrade"
        X-XSS-Protection "1; mode=block"
        -Server
    }
    
    @static {
        file
        path *.css *.js *.ico *.png *.jpg *.jpeg *.gif *.svg *.woff *.woff2 *.ttf *.eot *.pdf *.html
    }
    header @static {
        Cache-Control "public, max-age=31536000, immutable"
    }
    
    file_server
    
    log {
        output stdout
        format console
        level INFO
    }
    
    try_files {path} {path}/ /index.html
}
EOF

# Stop existing Caddy
echo "🛑 Stopping existing Caddy..."
sudo systemctl stop caddy || true

# Copy Caddyfile to Caddy directory
echo "📋 Setting up Caddyfile..."
sudo cp Caddyfile.static /etc/caddy/Caddyfile

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown caddy:caddy /etc/caddy/Caddyfile
sudo chmod 644 /etc/caddy/Caddyfile

# Start Caddy
echo "🔄 Starting Caddy..."
sudo systemctl start caddy
sudo systemctl enable caddy

# Wait for Caddy to start
echo "⏳ Waiting for Caddy to start..."
sleep 5

# Health check
echo "🏥 Performing health check..."
if curl -f -m 10 http://localhost > /dev/null 2>&1; then
    echo "✅ Caddy deployment successful!"
    echo "🌐 Website is accessible at http://astrokabinet.id"
    
    # Show status
    sudo systemctl status caddy --no-pager -l
else
    echo "❌ Health check failed!"
    echo "📋 Caddy logs:"
    sudo journalctl -u caddy --no-pager -l
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "📊 Status: $(curl -s -o /dev/null -w '%{http_code}' http://localhost)"
