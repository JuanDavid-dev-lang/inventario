#!/bin/bash
set -e

# Set default PORT if not specified
PORT=${PORT:-8080}
echo "Starting Apache on PORT: $PORT"

# Update ports.conf with the actual port
echo "Listen 0.0.0.0:$PORT" > /etc/apache2/ports.conf
echo "Listen 127.0.0.1:$PORT" >> /etc/apache2/ports.conf

# Replace PORT placeholder in VirtualHost configuration
sed -i "s/\${PORT}/$PORT/g" /etc/apache2/sites-available/000-default.conf

# Verify Apache configuration
echo "Validating Apache configuration..."
apache2ctl configtest

# Start Apache in foreground
echo "Starting Apache..."
exec apache2-foreground
