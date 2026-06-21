#!/bin/sh
# =============================================================================
# Docker Entrypoint — DTC Platform Laravel App
# Menggunakan /bin/sh (bukan bash) agar kompatibel dengan Alpine Linux
# =============================================================================

set -e

echo "================================================"
echo "  DTC Platform — Container Startup"
echo "================================================"

# ── 0. Fix bind-mount permissions (critical for Docker Desktop on Windows/Mac)
# When the host directory is bind-mounted, it overlays the container's dirs.
# We ensure storage/ is writable regardless of host file ownership.
echo "[entrypoint] Fixing storage permissions..."
mkdir -p storage/logs \
         storage/framework/cache \
         storage/framework/sessions \
         storage/framework/views \
         bootstrap/cache
chmod -R 777 storage bootstrap/cache 2>/dev/null || true

# ── 1. Install/update Composer dependencies (dev mode) ─────────────────────
if [ "${APP_ENV}" = "local" ] || [ "${APP_ENV}" = "development" ]; then
    echo "[entrypoint] APP_ENV=${APP_ENV} — installing Composer deps..."
    composer install \
        --no-interaction \
        --prefer-dist \
        --optimize-autoloader 2>&1 || echo "[entrypoint] WARNING: composer install failed, continuing..."
fi

# ── 2. Tunggu database siap ─────────────────────────────────────────────────
DB_HOST_VAL="${DB_HOST:-postgres}"
DB_PORT_VAL="${DB_PORT:-5432}"
MAX_RETRIES=30
COUNT=0

echo "[entrypoint] Waiting for database at ${DB_HOST_VAL}:${DB_PORT_VAL}..."
until php -r "
try {
    \$pdo = new PDO(
        'pgsql:host=${DB_HOST_VAL};port=${DB_PORT_VAL};dbname=${DB_DATABASE:-dtc_platform}',
        '${DB_USERNAME:-postgres}',
        '${DB_PASSWORD:-}'
    );
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
    COUNT=$((COUNT + 1))
    if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
        echo "[entrypoint] ERROR: Database not ready after ${MAX_RETRIES} attempts. Exiting."
        exit 1
    fi
    echo "[entrypoint]   attempt ${COUNT}/${MAX_RETRIES} — retrying in 3s..."
    sleep 3
done
echo "[entrypoint] Database is ready ✓"

# ── 3. Generate APP_KEY jika kosong ─────────────────────────────────────────
APP_KEY_VAL=$(grep "^APP_KEY=" /var/www/html/.env 2>/dev/null | cut -d'=' -f2-)
if [ -z "$APP_KEY_VAL" ] || [ "$APP_KEY_VAL" = "" ]; then
    echo "[entrypoint] APP_KEY is empty — generating..."
    php artisan key:generate --no-interaction --force
    echo "[entrypoint] APP_KEY generated ✓"
else
    echo "[entrypoint] APP_KEY already set ✓"
fi

# ── 4. Jalankan migrasi database ────────────────────────────────────────────
echo "[entrypoint] Running database migrations..."
php artisan migrate --force --no-interaction
echo "[entrypoint] Migrations done ✓"

# ── 5. Cache config (production) / Clear cache (dev) ────────────────────────
if [ "${APP_ENV}" = "production" ]; then
    echo "[entrypoint] Caching for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
else
    echo "[entrypoint] Clearing caches for development..."
    php artisan config:clear  2>/dev/null || true
    php artisan route:clear   2>/dev/null || true
    php artisan view:clear    2>/dev/null || true
    php artisan cache:clear   2>/dev/null || true
fi

# ── 6. Storage symlink ───────────────────────────────────────────────────────
echo "[entrypoint] Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

# ── 7. Fix permissions ───────────────────────────────────────────────────────
echo "[entrypoint] Fixing permissions..."
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "================================================"
echo "  Startup complete — launching: $@"
echo "================================================"

exec "$@"
