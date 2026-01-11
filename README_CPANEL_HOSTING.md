# Panduan Hosting ke cPanel (Frontend React + Backend PHP)

Panduan ini menjelaskan cara meng-hosting aplikasi Cemilan KasirPOS menggunakan **Backend PHP Native** (Rekomendasi Utama) ke shared hosting cPanel.



## 📋 Prasyarat

1.  Akses ke cPanel hosting.
2.  Hosting mendukung **PHP 7.4** atau **PHP 8.x**.
3.  Domain atau subdomain yang aktif **Wajib HTTPS/SSL** (misal: `https://tokocemilan.com`). Tanpa HTTPS, fitur login tidak akan berfungsi karena browser menolak cookie aman.
4.  Database MySQL yang sudah dibuat di cPanel.

## 🏗️ Langkah 1: Persiapan Database

1.  Login ke cPanel.
2.  Buka **MySQL Database Wizard**.
3.  Buat database baru (contoh: `u12345_cemilan`).
4.  Buat user database baru (contoh: `u12345_admin`) dan passwordnya.
5.  **PENTING**: Berikan hak akses **ALL PRIVILEGES** user tersebut ke database yang baru dibuat.
6.  Buka **phpMyAdmin**, pilih database tadi, lalu Import file `cemilankasirpos_php_v02.sql` (atau file sql terbaru) yang ada di folder proyek ini.

## ⚙️ Langkah 2: Upload Backend (PHP)

1.  Buka **File Manager** di cPanel.
2.  Masuk ke folder `public_html`.
3.  Buat folder baru bernama `api`.
4.  Upload semua file dari folder `php_server` di komputer Anda ke dalam folder `public_html/api` tersebut.
    *   Pastikan file `index.php`, `config.php`, `auth.php`, dll terupload.
5.  **Konfigurasi Database (.env)**:
    *   Di **File Manager**, masuk ke dalam folder `api` (tempat Anda upload file PHP).
    *   Buat file baru bernama `.env`.
    *   Salin isi dari `.env.example` ke file `.env` ini.
    *   Edit file `.env` dan sesuaikan dengan database cPanel Anda:
    ```ini
    DB_HOST=localhost
    DB_NAME=u12345_cemilan  # Sesuaikan nama DB
    DB_USER=u12345_admin    # Sesuaikan user DB
    DB_PASS=password_anda
    
    # Ganti dengan string acak
    JWT_SECRET=rahasia_aman_12345
    ALLOWED_ORIGINS=https://tokocemilan.com
    ```
    *   Simpan perubahan.

## 🖥️ Langkah 3: Build & Upload Frontend (React)

1.  **Edit Environment Variable Frontend**:
    *   Buka file `.env.production` di komputer Anda (atau buat jika belum ada).
    *   Ubah `VITE_API_URL` agar mengarah ke folder API PHP Anda.
    *   Contoh: `VITE_API_URL=https://tokocemilan.com/api`
    *   *Catatan: Pastikan URL ini benar dan bisa diakses.*

2.  **Build Project**:
    *   Buka terminal di root project.
    *   Jalankan: `npm run build`.
    *   Folder `dist` akan terupdate dengan file hasil build.

3.  **Upload ke cPanel**:
    *   Buka **File Manager**.
    *   Masuk ke folder `public_html`.
    *   Upload **semua isi** dari folder `dist` ke sini (sejajar dengan folder `api` yang tadi dibuat).
    *   Struktur folder Anda di `public_html` akan terlihat seperti ini:
        *   `/api` (Folder backend PHP)
        *   `/assets` (Folder aset frontend)
        *   `index.html` (File utama frontend)
        *   `vite.svg`
        *   ...

4.  **Konfigurasi .htaccess untuk React Router**:
    *   Buat atau edit file `.htaccess` di folder `public_html`.
    *   Isi dengan kode berikut agar refresh halaman tidak 404:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteCond %{REQUEST_URI} !^/api/ [NC]
      RewriteRule . /index.html [L]
    </IfModule>
    ```
    *   *Perhatikan baris `RewriteCond %{REQUEST_URI} !^/api/ [NC]`: Ini penting agar request ke folder `/api` tidak dialihkan ke React.*

## ✅ Langkah 4: Testing

1.  Buka website frontend Anda (misal: `https://tokocemilan.com`).
2.  Coba login (Default: `superadmin` / `password`).
3.  Jika berhasil login dan data tampil, berarti Frontend sukses berkomunikasi dengan Backend PHP.

---

