#!/bin/sh
echo "=== Testing Redis Connection ==="
php -r "
try {
    \$r = new Redis();
    \$r->connect('redis', 6379);
    \$r->auth('redisadmin');
    echo 'Redis OK: ' . \$r->ping() . PHP_EOL;
} catch(Exception \$e) {
    echo 'Redis ERROR: ' . \$e->getMessage() . PHP_EOL;
}
"

echo ""
echo "=== Testing DB Connection ==="
php -r "
try {
    \$pdo = new PDO('pgsql:host=postgres;port=5432;dbname=dtc_platform', 'postgres', 'admin');
    echo 'DB OK' . PHP_EOL;
} catch(Exception \$e) {
    echo 'DB ERROR: ' . \$e->getMessage() . PHP_EOL;
}
"

echo ""
echo "=== ENV Variables in PHP-FPM context ==="
php -r "echo 'APP_KEY=' . (getenv('APP_KEY') ? 'SET (' . strlen(getenv('APP_KEY')) . ' chars)' : 'EMPTY') . PHP_EOL;"
php -r "echo 'APP_ENV=' . (getenv('APP_ENV') ?: 'EMPTY') . PHP_EOL;"

echo ""
echo "=== Laravel Route Check ==="
php artisan route:list --path=/ 2>&1 | head -5
