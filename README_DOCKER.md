# Panduan Docker Deployment (Versi PHP Backend)

Panduan ini menjelaskan cara menjalankan aplikasi Cemilan KasirPOS menggunakan Docker dan Docker Compose dengan **Backend PHP**.

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
│  - Proxy /api → Backend Container           │
└────────────┬────────────────────────────────┘
             │
       ┌─────┴──────┐
       │            │
┌──────▼──────┐  ┌──▼────────────────────┐
│  Backend    │  │   MySQL Database      │
│  (PHP 8.2)  │  │   - Port 3306         │
│  - Apache   │  │   - Persistent Vol    │
└─────────────┘  └───────────────────────┘
```

## 📁 Struktur File Docker

Buat file-file berikut di root project:

### 1. `Dockerfile` (Frontend)

File ini akan mem-build React app dan menyajikannya menggunakan Nginx.

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

# Build static files (Pastikan .env.production mengarah ke /api)
# Kita akan set VITE_API_URL saat build atau biarkan relative path
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

### 2. `nginx.conf` (Frontend Config)

Buat file `nginx.conf` di root project untuk konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Serve React App
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to PHP Backend
    location /api {
        # 'backend' adalah nama service di docker-compose
        proxy_pass http://backend:80/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. `Dockerfile.backend` (Backend PHP)

File ini akan menjalankan server Apache dengan PHP.

```dockerfile
FROM php:8.2-apache

# Install extensions yang dibutuhkan
RUN docker-php-ext-install pdo pdo_mysql

# Enable mod_rewrite untuk routing API
RUN a2enmod rewrite

# Copy source code backend ke web root
COPY php_server/ /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port 80 (Apache default)
EXPOSE 80
```

### 4. `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Frontend (Nginx + React)
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

  # Backend (PHP + Apache)
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    volumes:
      - ./php_server:/var/www/html # Development: Hot reload PHP
    environment:
      - DB_HOST=mysql
      - DB_NAME=cemilankasirpos
      - DB_USER=root
      - DB_PASS=rootpassword
      - JWT_SECRET=rahasia_docker_secure
    depends_on:
      - mysql
    networks:
      - app-network

  # Database (MySQL)
  mysql:
    image: mysql:8.0
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: cemilankasirpos
    volumes:
      - mysql_data:/var/lib/mysql
      - ./cemilankasirpos.sql:/docker-entrypoint-initdb.d/init.sql # Auto import SQL
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql_data:
```

## 🚀 Cara Menjalankan

1.  **Persiapan Database**:
    Pastikan file `cemilankasirpos.sql` ada di root project agar otomatis di-import saat container MySQL pertama kali dibuat.

2.  **Jalankan Docker Compose**:
    ```bash
    docker-compose up -d --build
    ```

3.  **Akses Aplikasi**:
    Buka browser dan akses `http://localhost`.

## ⚙️ Konfigurasi Tambahan

### Koneksi Database (PENTING)

Agar backend PHP bisa terhubung ke container MySQL, Anda perlu menyesuaikan `php_server/config.php` agar membaca Environment Variables, atau Docker akan meng-override-nya jika Anda memodifikasi kode PHP-nya.

Modifikasi `php_server/config.php` Anda menjadi seperti ini untuk mendukung Docker:

```php
<?php
// Database Configuration
// Prioritize Environment Variables (Docker), fallback to local defaults
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'cemilankasirpos');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// ... sisa konfigurasi ...
?>
```

### Reset Database di Docker

Jika Anda ingin mereset database Docker ke awal:

```bash
# Hapus container dan volume
docker-compose down -v

# Jalankan ulang (akan import ulang SQL)
docker-compose up -d
```

## 🐛 Troubleshooting

### 1. API Error / 404 Not Found
- Pastikan `mod_rewrite` aktif di container backend (sudah ada di Dockerfile).
- Pastikan file `.htaccess` ada di folder `php_server`.
- Cek logs backend: `docker-compose logs backend`.

### 2. Database Connection Error
- Pastikan `php_server/config.php` sudah dimodifikasi untuk membaca `getenv('DB_HOST')` dkk.
- Pastikan container `mysql` sudah running dan sehat.

### 3. Changes not reflecting (PHP)
- Jika Anda menggunakan volume `./php_server:/var/www/html`, perubahan di file PHP lokal akan langsung terlihat. Jika tidak, Anda perlu rebuild: `docker-compose build backend`.
