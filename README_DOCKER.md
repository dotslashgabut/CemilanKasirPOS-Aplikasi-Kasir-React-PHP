# Panduan Docker Deployment (Frontend React + Backend PHP)

Panduan ini menjelaskan cara menjalankan aplikasi Cemilan KasirPOS menggunakan **Docker** dengan konfigurasi **Frontend React** dan **Backend PHP Native**.

## 📋 Prasyarat

- Docker Engine 20.10+ ([Install Docker](https://docs.docker.com/engine/install/))
- Docker Compose v2.0+ ([Install Docker Compose](https://docs.docker.com/compose/install/))
- Git (untuk clone repository)

## 🐳 Arsitektur Docker

Aplikasi ini menggunakan 3 container:

```
┌─────────────────────────────────────────────┐
│         Nginx (Frontend Container)          │
│  - Port 80 (HTTP)                           │
│  - Serve React Static Files                 │
│  - Proxy /api → PHP Backend                 │
└────────────┬────────────────────────────────┘
             │
       ┌─────┴──────┐
       │            │
┌──────▼──────┐  ┌──▼────────────────────┐
│  PHP Backend│  │   MySQL Database      │
│  (Apache)   │  │   - Port 3306         │
│  - Port 80  │  │   - Persistent Vol    │
└─────────────┘  └───────────────────────┘
```

## 📁 Struktur File Docker

Buat (atau update) file-file berikut di root project:

### 1. `nginx.conf` (Konfigurasi Nginx Frontend)

Buat file `nginx.conf` di root folder:

```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to PHP Backend
    location /api {
        proxy_pass http://php-backend:80/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. `Dockerfile` (Frontend)

```dockerfile
# Stage 1: Build React App
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build static files (Pastikan VITE_API_URL kosong atau relative path agar diproxy nginx)
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. `Dockerfile.php` (Backend)

Buat file `Dockerfile.php` di root folder:

```dockerfile
FROM php:8.2-apache

# Install extension yang dibutuhkan (mysqli, pdo_mysql)
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable mod_rewrite for Apache
RUN a2enmod rewrite

# Copy source code ke folder /var/www/html/api
# Kita copy ke subfolder /api agar URL nya cocok dengan proxy nginx (/api -> /var/www/html/api)
WORKDIR /var/www/html/api
COPY php_server/ .

# Set permissions
RUN chown -R www-data:www-data /var/www/html/api
```

### 4. `docker-compose.yml`

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: cemilan-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: cemilankasirpos_php_v02
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

  php-backend:
    build:
      context: .
      dockerfile: Dockerfile.php
    container_name: cemilan-php-backend
    restart: always
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASS: ${MYSQL_ROOT_PASSWORD:-root}
      DB_NAME: cemilankasirpos_php_v02
    depends_on:
      - mysql
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: cemilan-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - php-backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql_data:
```

## 🚀 Cara Menjalankan

1.  **Setup Database Config**:
    *   Pastikan file `php_server/config.php` mendukung environment variables atau edit `Dockerfile.php` untuk menyuntikkan konfigurasi.
    *   *Tips:* Untuk Docker, sebaiknya update `php_server/config.php` agar membaca ENV variables:
        ```php
        define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
        define('DB_USER', getenv('DB_USER') ?: 'root');
        define('DB_PASS', getenv('DB_PASS') ?: '');
        define('DB_NAME', getenv('DB_NAME') ?: 'cemilankasirpos_php_v02');
        ```

2.  **Jalankan Docker Compose**:
    ```bash
    docker-compose up -d --build
    ```

3.  **Akses Aplikasi**:
    *   Buka browser: `http://localhost`

## 🛠️ Maintenance

```bash
# Stop aplikasi
docker-compose down

# Lihat logs
docker-compose logs -f php-backend
```

## 🔒 Catatan Keamanan

*   Pastikan password database diubah di `docker-compose.yml` untuk production.
*   Gunakan `NODE_ENV=production` saat build frontend (sudah default di Dockerfile).
