#!/bin/bash
set -e

# Set default PORT if not specified
PORT=${PORT:-8080}
echo "[ENTRYPOINT] Starting Apache on PORT: $PORT"

# Ensure Apache can write to log directory
mkdir -p /var/log/apache2
chown -R www-data:www-data /var/log/apache2
chmod -R 755 /var/log/apache2

# Create a clean ports.conf
echo "Listen 0.0.0.0:$PORT" > /etc/apache2/ports.conf
echo "[ENTRYPOINT] Updated ports.conf"

# Replace PORT in VirtualHost configuration using escaped slashes
sed -i "s|\${PORT}|$PORT|g" /etc/apache2/sites-available/000-default.conf
echo "[ENTRYPOINT] Updated apache.conf VirtualHost"

# Verify configuration syntax
echo "[ENTRYPOINT] Validating Apache configuration..."
if ! apache2ctl configtest 2>&1 | tee /tmp/apache-config-test.log; then
    echo "[ENTRYPOINT] Apache configuration test failed!"
    cat /tmp/apache-config-test.log
    exit 1
fi
echo "[ENTRYPOINT] Apache configuration is valid"

# Check if the configuration file contains the right port
echo "[ENTRYPOINT] Checking VirtualHost configuration:"
grep -A 2 "<VirtualHost" /etc/apache2/sites-available/000-default.conf

# Start Apache in foreground
echo "[ENTRYPOINT] Starting Apache in foreground mode..."
exec apache2-foreground
