# Backend Dockerfile
# PHP 8.2 + Apache

FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath

# Enable Apache modules
RUN a2enmod rewrite headers

# Copiar configuración personalizada de Apache
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/html

# Copiar el código de la aplicación (añadido para que funcione la imagen)
COPY backend/ .

# Ajustar permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
