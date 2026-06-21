#!/bin/bash
# =============================================================================
# Docker Entrypoint — DTC Platform Laravel App
# Runs before php-fpm starts: composer install (dev), cache clear, migrate
# =============================================================================

set -e

echo "════════════════════════════════════════════════"
echo "  DTC Platform — Container Startup"
echo "════════════════════════════════════════════════"

# ── 1. Install/update Composer dependencies (dev only) ────────────────────────
if [ "${APP_ENV}" = "local" ] || [ "${APP_ENV}" = "development" ]; then
    echo "[entrypoint] Installing Composer dependencies (dev)..."
    composer install \
        --no-interaction \
        --prefer-dist \
        --optimize-autoloader 2>&1 || true
fi

# ── 2. Wait for database to be ready ─────────────────────────────────────────
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
MAX_RETRIES=30
COUNT=0

echo "[entrypoint] Waiting for database at ${DB_HOST}:${DB_PORT}..."
until php -r "
    \$pdo = new PDO(
        'pgsql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}',
        '${DB_USERNAME}',
        '${DB_PASSWORD}'
    );
    echo 'ok';
" 2>/dev/null | grep -q "ok"; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo "[entrypoint] ERROR: Database not ready after ${MAX_RETRIES} attempts. Exiting."
        exit 1
    fi
    echo "[entrypoint] Database not ready yet... attempt ${COUNT}/${MAX_RETRIES}"
    sleep 2
done
echo "[entrypoint] Database is ready ✓"

# ── 3. Generate APP_KEY if missing ────────────────────────────────────────────
if [ -z "${APP_KEY}" ]; then
    echo "[entrypoint] Generating APP_KEY..."
    php artisan key:generate --no-interaction --force
fi

# ── 4. Run migrations ─────────────────────────────────────────────────────────
echo "[entrypoint] Running database migrations..."
php artisan migrate --force --no-interaction

# ── 5. Cache configuration (production only) ─────────────────────────────────
if [ "${APP_ENV}" = "production" ]; then
    echo "[entrypoint] Caching config, routes, views for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
else
    echo "[entrypoint] Clearing caches for development..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear
fi

# ── 6. Fix storage symlink ────────────────────────────────────────────────────
echo "[entrypoint] Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

# ── 7. Fix permissions on runtime directories ─────────────────────────────────
echo "[entrypoint] Fixing storage permissions..."
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "════════════════════════════════════════════════"
echo "  Startup complete — launching: $@"
echo "════════════════════════════════════════════════"

# Hand off to CMD (php-fpm)
exec "$@"
