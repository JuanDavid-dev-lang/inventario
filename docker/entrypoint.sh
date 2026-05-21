#!/bin/bash
set -e

# Set default PORT if not specified
PORT=${PORT:-8080}

# Replace PORT in Apache configuration
sed -i "s/\${PORT}/$PORT/g" /etc/apache2/sites-available/000-default.conf
sed -i "s/\${PORT}/$PORT/g" /etc/apache2/ports.conf

# Start Apache
exec apache2-foreground
