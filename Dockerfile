# Multi-purpose container: Backend (PHP) + Frontend (Node.js/Vue)
FROM php:8.2-apache as production

# Install Node.js and system dependencies
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && apt-get install -y \
    nodejs \
    git \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Clone the entire repository to get backend and frontend
RUN git clone --depth 1 https://github.com/JuanDavid-dev-lang/inventario.git temp_repo && \
    cp -r temp_repo/backend ./backend && \
    cp -r temp_repo/frontend ./frontend && \
    rm -rf temp_repo

# Install frontend dependencies and build
RUN cd frontend && npm install && npm run build && cd ..

# Copy frontend build to Apache public directory
RUN cp -r frontend/dist/* . 2>/dev/null || true

# Copy backend PHP files to Apache public directory
RUN cp -r backend/public/* . 2>/dev/null || true

# Copy Apache configuration if exists
RUN if [ -f "backend/../docker/apache.conf" ]; then \
    cp backend/../docker/apache.conf /etc/apache2/sites-available/000-default.conf; \
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
