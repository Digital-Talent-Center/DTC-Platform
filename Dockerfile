# =============================================================================
# DTC Platform — Multi-Stage Dockerfile
# PHP 8.2 + Laravel 12 + Inertia.js/React + Vite
# =============================================================================

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: base — PHP-FPM Alpine with all required extensions
# ─────────────────────────────────────────────────────────────────────────────
FROM php:8.2-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libzip-dev \
    postgresql-dev \
    oniguruma-dev \
    icu-dev \
    shadow \
    supervisor \
    && rm -rf /var/cache/apk/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        zip \
        bcmath \
        pcntl \
        opcache \
        intl \
        mbstring

# Install Redis extension via PECL
# $PHPIZE_DEPS provides autoconf, g++, make needed by pecl/phpize on Alpine
RUN apk add --no-cache --virtual .pecl-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .pecl-deps \
    && rm -rf /tmp/pear

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/local/bin/composer

# Create non-root user (UID 1000 = typical Linux dev user)
RUN addgroup -g 1000 -S laravel \
    && adduser -u 1000 -S laravel -G laravel

WORKDIR /var/www/html


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: composer-deps — Install PHP dependencies (production only)
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS composer-deps

COPY composer.json composer.lock ./

# Install production dependencies only (no dev, no scripts)
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --optimize-autoloader \
    && composer clear-cache

# Copy full source to generate autoloader
COPY . .

RUN composer dump-autoload --optimize --no-dev


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: node-build — Build frontend assets with Vite
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS node-build

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install all Node dependencies (including devDependencies for build)
RUN npm ci --include=dev

# Copy source files needed for Vite build
COPY resources/ resources/
COPY public/ public/
COPY vite.config.js ./
COPY tsconfig.json ./
COPY components.json ./

# Run production build
RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: app — Production-ready image (small, non-root, no dev tools)
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS app

# Copy PHP config tuned for production
COPY docker/php/php.ini /usr/local/etc/php/conf.d/php-custom.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

# Copy application source
COPY --chown=laravel:laravel . .

# Bring in vendor from composer stage
COPY --from=composer-deps --chown=laravel:laravel /var/www/html/vendor ./vendor

# Bring in built frontend assets
COPY --from=node-build --chown=laravel:laravel /app/public/build ./public/build

# Copy entrypoint
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && sed -i 's/\r//' /usr/local/bin/entrypoint.sh

# Fix directory permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions \
              storage/framework/views bootstrap/cache \
    && chown -R laravel:laravel storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Switch to non-root user
USER laravel

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]


# ─────────────────────────────────────────────────────────────────────────────
# Stage 5: app-dev — Development image with Xdebug
# Entrypoint runs as root to fix bind-mount permissions,
# then PHP-FPM master also runs as root but workers drop to laravel user.
# This is the standard Docker pattern for bind mounts.
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS app-dev

# Install Xdebug for local debugging
# $PHPIZE_DEPS provides autoconf, g++, make needed by pecl/phpize on Alpine
RUN apk add --no-cache --virtual .pecl-deps $PHPIZE_DEPS linux-headers \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && apk del .pecl-deps \
    && rm -rf /tmp/pear

# Development PHP config
COPY docker/php/php-dev.ini /usr/local/etc/php/conf.d/php-custom.ini

# PHP-FPM pool config for dev (user=laravel, PHP-FPM master runs as root)
COPY docker/php/www-dev.conf /usr/local/etc/php-fpm.d/www.conf

# Copy entrypoint — runs as root, fixes permissions, then launches php-fpm
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    # Fix Windows CRLF line endings if present
    && sed -i 's/\r//' /usr/local/bin/entrypoint.sh

# Pre-create storage dirs owned by laravel so bind-mount works
RUN mkdir -p /var/www/html/storage/logs \
             /var/www/html/storage/framework/cache \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/bootstrap/cache \
    && chown -R laravel:laravel /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy composer files (actual install via bind-mount happens in entrypoint)
COPY --chown=laravel:laravel composer.json composer.lock ./

# Run as root so entrypoint can fix bind-mount permissions before switching
# PHP-FPM workers will still run as laravel user (configured in www-dev.conf)
# USER laravel — intentionally left as root for dev bind-mount compatibility

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

