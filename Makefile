.PHONY: help build setup start stop restart status logs clean migrate seed artisan composer npm test

# Default target
help:
	@echo "AstroWorks Podman Pod Management"
	@echo "================================"
	@echo ""
	@echo "Available commands:"
	@echo "  build     - Build the application image"
	@echo "  setup     - Setup and start the complete pod"
	@echo "  start     - Start the pod"
	@echo "  stop      - Stop the pod"
	@echo "  restart   - Restart the pod"
	@echo "  status    - Show pod and container status"
	@echo "  logs      - Show logs (use CONTAINER=name for specific container)"
	@echo "  clean     - Clean up all resources"
	@echo "  migrate   - Run database migrations"
	@echo "  seed      - Run database seeders"
	@echo "  fresh     - Fresh migration with seed"
	@echo "  artisan   - Run artisan command (use CMD='command here')"
	@echo "  composer  - Run composer command (use CMD='command here')"
	@echo "  npm       - Run npm command (use CMD='command here')"
	@echo "  test      - Run tests"
	@echo "  shell     - Open shell in app container"
	@echo "  db-shell  - Open PostgreSQL shell"
	@echo ""
	@echo "Examples:"
	@echo "  make artisan CMD='make:controller UserController'"
	@echo "  make composer CMD='require laravel/sanctum'"
	@echo "  make logs CONTAINER=astroworks-app"

# Build application image
build:
	@echo "Building application image..."
	podman build -t astroworks-app:latest .

# Setup complete pod
setup:
	@echo "Setting up AstroWorks pod..."
	chmod +x podman-setup.sh
	./podman-setup.sh

# Start pod
start:
	@echo "Starting AstroWorks pod..."
	podman pod start astroworks-pod

# Stop pod
stop:
	@echo "Stopping AstroWorks pod..."
	podman pod stop astroworks-pod

# Restart pod
restart:
	@echo "Restarting AstroWorks pod..."
	podman pod restart astroworks-pod

# Show status
status:
	@echo "=== Pod Status ==="
	podman pod ps
	@echo ""
	@echo "=== Container Status ==="
	podman ps --pod
	@echo ""
	@echo "=== Application URLs ==="
	@echo "Application: http://localhost:8000"
	@echo "PostgreSQL: localhost:5432"

# Show logs
logs:
ifdef CONTAINER
	podman logs -f $(CONTAINER)
else
	@echo "Available containers:"
	@podman ps --format "table {{.Names}}"
	@echo ""
	@echo "Usage: make logs CONTAINER=container_name"
endif

# Clean up all resources
clean:
	@echo "Cleaning up all resources..."
	./podman-setup.sh cleanup

# Database migrations
migrate:
	@echo "Running database migrations..."
	podman exec astroworks-app php artisan migrate

# Database seeders
seed:
	@echo "Running database seeders..."
	podman exec astroworks-app php artisan db:seed

# Fresh migration with seed
fresh:
	@echo "Running fresh migration with seed..."
	podman exec astroworks-app php artisan migrate:fresh --seed

# Run artisan command
artisan:
ifdef CMD
	podman exec astroworks-app php artisan $(CMD)
else
	@echo "Usage: make artisan CMD='your-artisan-command'"
	@echo "Example: make artisan CMD='make:controller UserController'"
endif

# Run composer command
composer:
ifdef CMD
	podman exec astroworks-app composer $(CMD)
else
	@echo "Usage: make composer CMD='your-composer-command'"
	@echo "Example: make composer CMD='require laravel/sanctum'"
endif

# Run npm command
npm:
ifdef CMD
	podman exec astroworks-app npm $(CMD)
else
	@echo "Usage: make npm CMD='your-npm-command'"
	@echo "Example: make npm CMD='run build'"
endif

# Run tests
test:
	@echo "Running tests..."
	podman exec astroworks-app php artisan test

# Open shell in app container
shell:
	@echo "Opening shell in app container..."
	podman exec -it astroworks-app /bin/bash

# Open PostgreSQL shell
db-shell:
	@echo "Opening PostgreSQL shell..."
	podman exec -it astroworks-postgres psql -U astroworks -d astroworks

# Development helpers
dev-setup: setup
	@echo "Setting up development environment..."
	make artisan CMD="key:generate"
	make migrate
	make seed

# Update application
update:
	@echo "Updating application..."
	make composer CMD="install --optimize-autoloader"
	make npm CMD="ci"
	make npm CMD="run build"
	make migrate
	make artisan CMD="config:clear"
	make artisan CMD="cache:clear"

# Backup database
backup:
	@echo "Creating database backup..."
	podman exec astroworks-postgres pg_dump -U astroworks astroworks > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql"

# System service management
install-service:
	@echo "Installing systemd service..."
	sudo cp astroworks.service /etc/systemd/system/
	sudo systemctl daemon-reload
	sudo systemctl enable astroworks.service
	@echo "Service installed. Use 'sudo systemctl start astroworks' to start"

remove-service:
	@echo "Removing systemd service..."
	sudo systemctl stop astroworks.service || true
	sudo systemctl disable astroworks.service || true
	sudo rm -f /etc/systemd/system/astroworks.service
	sudo systemctl daemon-reload

# Health check
health:
	@echo "Checking application health..."
	@curl -f http://localhost:8000 > /dev/null 2>&1 && echo "✓ Application is running" || echo "✗ Application is not responding"
	@podman exec astroworks-postgres pg_isready -U astroworks -d astroworks > /dev/null 2>&1 && echo "✓ PostgreSQL is running" || echo "✗ PostgreSQL is not responding"