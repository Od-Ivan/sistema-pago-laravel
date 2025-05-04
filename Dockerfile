# Usa imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instala dependencias del sistema
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev libonig-dev libxml2-dev nodejs npm \
    && docker-php-ext-install zip pdo pdo_mysql mbstring exif pcntl bcmath gd

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia los archivos de tu proyecto
COPY . /var/www/html

# Cambia permisos
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# Expone el puerto de Laravel
EXPOSE 8000

# Instala dependencias Laravel y React
RUN cd /var/www/html && \
    composer install && \
    npm install && \
    npm run build && \
    php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear && \
    php artisan key:generate

# Comando para iniciar el servidor
CMD php artisan serve --host=0.0.0.0 --port=8000
