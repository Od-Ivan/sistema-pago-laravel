#!/usr/bin/env bash

composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan config:cache
php artisan route:cache