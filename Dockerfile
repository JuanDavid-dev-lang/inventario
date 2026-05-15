# Multi-purpose container: Backend (PHP) + Frontend (Node.js/Vue)
FROM php:8.2-apache

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy entire project (backend + frontend)
COPY . .

# Install PHP dependencies if composer.lock exists
RUN if [ -f "backend/composer.lock" ]; then \
    apt-get update && apt-get install -y git unzip && \
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    cd backend && composer install --no-dev --optimize-autoloader && cd ..; \
    fi

# Install and build frontend
RUN cd frontend && npm install && npm run build && cd ..

# Copy frontend build to Apache public directory
RUN cp -r frontend/dist/* /var/www/html/ 2>/dev/null || true

# Copy backend PHP files to Apache public directory
RUN cp -r backend/public/* /var/www/html/ 2>/dev/null || true

# Copy Apache configuration if exists
RUN if [ -f "docker/apache.conf" ]; then \
    cp docker/apache.conf /etc/apache2/sites-available/000-default.conf; \
    fi

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start Apache
CMD ["apache2-foreground"]
