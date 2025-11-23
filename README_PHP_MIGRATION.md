# Panduan Migrasi ke PHP

Dokumen ini menjelaskan cara menjalankan aplikasi Cemilan KasirPOS menggunakan backend PHP alih-alih Node.js.

## Persiapan

1.  **Web Server**: Pastikan Anda memiliki web server yang mendukung PHP (seperti Apache atau Nginx) dan MySQL. (Contoh: XAMPP, Laragon).
2.  **Database**: Pastikan database `cemilankasirpos` sudah ada dan struktur tabelnya sudah benar (gunakan `cemilankasirpos.sql` jika perlu).

## Langkah-langkah Migrasi

### 1. Backend (PHP)

Kami telah menyediakan folder `php_server` yang berisi kode backend PHP sederhana.

1.  Salin isi folder `php_server` ke direktori web server Anda (misalnya `C:/laragon/www/cemilan-api`).
2.  Buka file `config.php` di folder tersebut dan sesuaikan konfigurasi database jika perlu:
    ```php
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'cemilankasirpos');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    ```
3.  **PENTING: Konfigurasi .htaccess**
    *   Pastikan file `.htaccess` ada di dalam folder `php_server` (atau folder tujuan di web server).
    *   File ini sangat krusial untuk routing API.
    *   Isi file `.htaccess` yang direkomendasikan:
    ```apache
    <IfModule mod_rewrite.c>
        RewriteEngine On
        
        # Handle Authorization Header
        RewriteCond %{HTTP:Authorization} .
        RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

        # Redirect Trailing Slashes...
        RewriteRule ^(.*)/$ /$1 [L,R=301]

        # Handle Front Controller...
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^ index.php [L]
    </IfModule>
    ```

4.  Tes API dengan membuka browser ke `http://localhost/cemilan-api/api/products` (sesuaikan path dengan lokasi Anda). Anda harusnya melihat output JSON.

### 2. Frontend (React)

Anda perlu membangun (build) aplikasi React agar bisa dijalankan tanpa Node.js.

1.  Buat file `.env.production` di root folder proyek ini (sejajar dengan `package.json`) dan isi dengan URL API PHP Anda:
    ```env
    VITE_API_URL=http://localhost/cemilan-api/api
    ```
    *Catatan: Sesuaikan URL di atas dengan alamat di mana Anda menaruh file PHP tadi.*

2.  Jalankan perintah build:
    ```bash
    npm run build
    ```

3.  Setelah proses selesai, akan muncul folder `dist`.
4.  Salin seluruh isi folder `dist` ke direktori web server Anda (misalnya `C:/laragon/www/cemilan-app`).

### 3. Menjalankan Aplikasi

Sekarang Anda memiliki dua bagian di web server:
1.  **Backend**: `http://localhost/cemilan-api`
2.  **Frontend**: `http://localhost/cemilan-app`

Buka `http://localhost/cemilan-app` di browser. Aplikasi sekarang berjalan menggunakan backend PHP.

## Struktur Folder PHP Server

*   `config.php`: Konfigurasi koneksi database.
*   `index.php`: Router utama dan logika CRUD (Create, Read, Update, Delete).
*   `.htaccess`: Mengarahkan semua request ke `index.php`.

## Catatan Penting

*   Backend PHP yang disediakan adalah implementasi dasar yang meniru fungsi backend Node.js sebelumnya.
*   Pastikan ekstensi `pdo_mysql` aktif di konfigurasi PHP (`php.ini`).
