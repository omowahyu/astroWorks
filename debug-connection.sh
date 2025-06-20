#!/bin/bash

# AstroKabinet Connection Debug Script
# Script untuk mendiagnosis masalah koneksi website

echo "🔍 AstroKabinet Connection Debug"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Starting connection diagnostics..."

# 1. Check Docker containers
print_status "1. Checking Docker containers..."
docker-compose -f docker-compose.production.yml ps

echo ""

# 2. Check container logs
print_status "2. Checking container logs..."
echo "--- Nginx logs ---"
docker-compose -f docker-compose.production.yml logs --tail=10 nginx

echo ""
echo "--- Laravel app logs ---"
docker-compose -f docker-compose.production.yml logs --tail=10 app

echo ""

# 3. Check port bindings
print_status "3. Checking port bindings..."
netstat -tlnp | grep :80
netstat -tlnp | grep :443

echo ""

# 4. Test internal connectivity
print_status "4. Testing internal connectivity..."
echo "Testing Laravel app container:"
docker-compose -f docker-compose.production.yml exec -T app curl -I http://localhost:8000 || echo "Laravel app not responding"

echo ""
echo "Testing Nginx container:"
docker-compose -f docker-compose.production.yml exec -T nginx curl -I http://localhost:80 || echo "Nginx not responding"

echo ""

# 5. Check DNS resolution
print_status "5. Checking DNS resolution..."
nslookup astrokabinet.id
dig astrokabinet.id

echo ""

# 6. Test external connectivity
print_status "6. Testing external connectivity..."
echo "Testing from server:"
curl -I http://astrokabinet.id || echo "HTTP connection failed"
curl -I https://astrokabinet.id || echo "HTTPS connection failed"

echo ""

# 7. Check firewall
print_status "7. Checking firewall status..."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw status
elif command -v iptables >/dev/null 2>&1; then
    sudo iptables -L -n | grep -E "(80|443)"
else
    echo "No common firewall tools found"
fi

echo ""

# 8. Check if domain points to this server
print_status "8. Checking domain configuration..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short astrokabinet.id)

echo "Server IP: $SERVER_IP"
echo "Domain IP: $DOMAIN_IP"

if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    print_status "✅ Domain correctly points to this server"
else
    print_warning "⚠️ Domain does not point to this server"
    echo "Expected: $SERVER_IP"
    echo "Actual: $DOMAIN_IP"
fi

echo ""

# 9. Recommendations
print_status "9. Troubleshooting recommendations..."

if ! docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    print_error "Some containers are not running. Try: docker-compose -f docker-compose.production.yml up -d"
fi

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    print_warning "Update your DNS records to point astrokabinet.id to $SERVER_IP"
fi

echo ""
print_status "Debug completed!"
echo ""
echo "Quick fixes to try:"
echo "1. Restart containers: docker-compose -f docker-compose.production.yml restart"
echo "2. Check logs: docker-compose -f docker-compose.production.yml logs -f"
echo "3. Rebuild: docker-compose -f docker-compose.production.yml up -d --build"
