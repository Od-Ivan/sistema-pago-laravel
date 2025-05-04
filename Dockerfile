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
WORKDIR /var/www/html

RUN composer install

RUN npm install

RUN npm run build || echo "Falló build pero seguimos"

RUN php artisan config:clear || echo "Error limpiando config"
RUN php artisan route:clear || echo "Error limpiando rutas"
RUN php artisan view:clear || echo "Error limpiando vistas"
RUN php artisan key:generate || echo "Error generando clave"


# Comando para iniciar el servidor
CMD php artisan serve --host=0.0.0.0 --port=8000
