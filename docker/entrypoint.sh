#!/bin/bash
set -euo pipefail

# Set default PORT if not specified
PORT="${PORT:-8080}"
echo "[ENTRYPOINT] Starting Apache on PORT: $PORT"

if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "[ENTRYPOINT] Invalid PORT value: $PORT"
    exit 1
fi

# Create a clean ports.conf. A bare port listens on all interfaces.
echo "Listen $PORT" > /etc/apache2/ports.conf
echo "[ENTRYPOINT] Updated ports.conf"

# Verify configuration syntax
echo "[ENTRYPOINT] Validating Apache configuration..."
if ! apache2ctl -t 2>&1 | tee /tmp/apache-config-test.log; then
    echo "[ENTRYPOINT] Apache configuration test failed!"
    cat /tmp/apache-config-test.log
    exit 1
fi
echo "[ENTRYPOINT] Apache configuration is valid"

echo "[ENTRYPOINT] Active Apache listeners:"
cat /etc/apache2/ports.conf

# Start Apache in foreground
echo "[ENTRYPOINT] Starting Apache in foreground mode..."
exec docker-php-entrypoint "$@"
