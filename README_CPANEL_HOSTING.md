# Panduan Hosting ke cPanel (Versi PHP Backend)

Panduan ini menjelaskan cara meng-hosting aplikasi Cemilan KasirPOS menggunakan **Backend PHP** ke shared hosting cPanel.

## 📋 Prasyarat

1.  Akses ke cPanel hosting.
2.  Domain atau subdomain yang aktif (misal: `tokocemilan.com`).
3.  Database MySQL yang sudah dibuat di cPanel.

## 🏗️ Langkah 1: Persiapan Database

1.  Login ke cPanel.
2.  Buka **MySQL Database Wizard**.
3.  Buat database baru (contoh: `u12345_cemilan`).
4.  Buat user database baru (contoh: `u12345_admin`) dan passwordnya.
5.  **PENTING**: Berikan hak akses **ALL PRIVILEGES** user tersebut ke database yang baru dibuat.
6.  Buka **phpMyAdmin**, pilih database tadi, lalu Import file SQL.
    *   **Opsi 1 (Data Standar)**: Import file `cemilankasirpos.sql` (struktur database + data default minimal).
    *   **Opsi 2 (Data Dummy)**: Import file `cemilankasirpos_dummy_data_500_produk.sql` jika Anda ingin langsung memiliki 500+ produk dan data transaksi contoh untuk testing.

## ⚙️ Langkah 2: Konfigurasi Backend (PHP)

1.  Buka file `php_server/config.php` di komputer Anda.
2.  Ubah isinya sesuai dengan database cPanel yang baru Anda buat:
    ```php
    define('DB_HOST', 'localhost'); // Biasanya tetap localhost
    define('DB_NAME', 'u12345_cemilan'); // Sesuaikan dengan nama DB di cPanel
    define('DB_USER', 'u12345_admin');   // Sesuaikan dengan user DB di cPanel
    define('DB_PASS', 'password_anda');  // Password user DB
    ```
3.  Simpan file tersebut.

## 🖥️ Langkah 3: Build Frontend (React)

1.  Tentukan di mana Anda akan menaruh file API PHP nanti.
    *   Jika di folder `public_html/api`, maka URL-nya: `https://tokocemilan.com/api`
    *   Jika di subdomain `api.tokocemilan.com`, maka URL-nya: `https://api.tokocemilan.com`
    
    *Kita asumsikan Anda menaruhnya di folder `api` (pilihan termudah).*

2.  Edit file `.env.production` di komputer Anda:
    ```env
    VITE_API_URL=https://tokocemilan.com/api
    ```
    *(Ganti `tokocemilan.com` dengan domain asli Anda)*

3.  Jalankan perintah build di terminal:
    ```bash
    npm run build
    ```
    Ini akan memperbarui folder `dist` dengan konfigurasi URL yang baru.

## 🚀 Langkah 4: Upload ke cPanel

1.  Buka **File Manager** di cPanel.
2.  Masuk ke folder `public_html`.
3.  **Upload Frontend**:
    *   Upload semua isi dari folder `dist` (hasil build tadi) ke `public_html`.
    *   Anda akan melihat file `index.html`, folder `assets`, dll di dalam `public_html`.
4.  **Upload Backend**:
    *   Buat folder baru bernama `api` di dalam `public_html`.
    *   Upload semua isi dari folder `php_server` (termasuk `config.php` yang sudah diedit tadi) ke dalam folder `public_html/api`.
    *   **PENTING: Konfigurasi .htaccess**
        *   Pastikan file `.htaccess` dari folder `php_server` ikut terupload ke dalam folder `api`.
        *   File ini mungkin tersembunyi. Pastikan opsi "Show Hidden Files" (biasanya di menu Settings pojok kanan atas File Manager) sudah dicentang.
        *   Isi file `.htaccess` yang benar untuk cPanel adalah sebagai berikut:

    ```apache
    <IfModule mod_rewrite.c>
        RewriteEngine On
        
        # Handle Authorization Header (Penting untuk Login)
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

## ✅ Langkah 5: Testing

1.  Buka website Anda (misal: `https://tokocemilan.com`).
2.  Coba login.
    *   Jika pakai `cemilankasirpos.sql`: User `superadmin`, Pass `password`.
    *   Jika pakai `cemilankasirpos_dummy_data_500_produk.sql`: User `superadmin`, Pass `password`.
3.  Jika berhasil login dan data muncul, berarti koneksi ke API PHP dan Database sukses!

## 5. Keamanan (PENTING)
- **HTTPS**: Pastikan website Anda menggunakan HTTPS (SSL). Sebagian besar cPanel menyediakan AutoSSL gratis (Let's Encrypt).
- **Password**: Segera ganti password default user (`owner`, `superadmin`, `kasir`) setelah instalasi.
- **Environment Variable**: Untuk keamanan maksimal, pindahkan `JWT_SECRET` dari `auth.php` ke environment variable server jika hosting Anda mendukungnya.
- **File .htaccess**: Pastikan file `.htaccess` terupload dengan benar untuk mengatur routing dan header keamanan.

## 6. Troubleshooting
- **404 Not Found**: Cek file `.htaccess`. Pastikan `RewriteEngine On` aktif.
- **Database Error**: Cek kembali `config.php`. Pastikan user database memiliki hak akses penuh ke database `cemilankasirpos`.
- **Login Gagal**: Pastikan Anda menggunakan password yang benar. Jika lupa, Anda bisa mereset password lewat database (perlu generate hash Bcrypt baru).
- **Halaman Blank**: Pastikan file `index.html` ada di root `public_html`.
- **Gagal Login (Token Error)**: Biasanya karena header Authorization diblokir server. Pastikan baris `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]` ada di `.htaccess`.
