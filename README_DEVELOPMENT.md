# Panduan Pengembangan (Development Guide)

Dokumen ini berisi panduan untuk setup lingkungan pengembangan (development environment) untuk aplikasi Cemilan KasirPOS.

## Prasyarat (Prerequisites)

Pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:

1. **Node.js** (versi 18 atau lebih baru) - [Download](https://nodejs.org/)
2. **PHP** (versi 8.0 atau lebih baru) - [Download](https://www.php.net/)
3. **MySQL** (versi 5.7 atau 8.0) - [Download](https://dev.mysql.com/downloads/mysql/)
4. **Composer** (Opsional, jika ada dependensi PHP tambahan)
5. **Git** - [Download](https://git-scm.com/)

> **Rekomendasi:** Pengguna Windows disarankan menggunakan **Laragon** atau **XAMPP** yang sudah memaketkan Apache/Nginx, PHP, dan MySQL.

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/dotslashgabut/cemilan-kasirpos.git
cd cemilan-kasirpos
```

### 2. Setup Backend (PHP & MySQL)

1. **Database**:
   
   * Buat database baru di MySQL bernama `cemilankasirpos`.
   * Import file `cemilankasirpos.sql` ke dalam database tersebut. File ini berisi skema database lengkap dan data dummy awal.

2. **Konfigurasi Koneksi**:
   
   * Buka file `php_server/config.php`.
   * Sesuaikan konfigurasi database jika perlu (default: user `root`, password kosong).
   
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'cemilankasirpos');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   ```

3. **Menjalankan Server PHP**:
   
   * **Menggunakan Laragon/XAMPP (Disarankan)**: 
     
     * Pastikan folder project berada di dalam root folder web server (misal `C:\laragon\www\cemilan-kasirpos`). 
     * Aplikasi backend akan dapat diakses melalui URL seperti `http://localhost/cemilan-kasirpos/php_server/index.php`.
   
   * **Menggunakan PHP Built-in Server**:
     
     ```bash
     cd php_server
     php -S localhost:3001 index.php
     ```
     
     *Catatan: Jika menggunakan built-in server, Anda perlu menyesuaikan `VITE_API_URL` di frontend agar mengarah ke `http://localhost:3001/api`.*

### 3. Setup Frontend (React)

1. **Install Dependensi**:
   
   ```bash
   # Panduan Pengembangan (Development Guide)
   ```

Dokumen ini berisi panduan untuk setup lingkungan pengembangan (development environment) untuk aplikasi Cemilan KasirPOS.

## Prasyarat (Prerequisites)

Pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:

1. **Node.js** (versi 18 atau lebih baru) - [Download](https://nodejs.org/)
2. **PHP** (versi 8.0 atau lebih baru) - [Download](https://www.php.net/)
3. **MySQL** (versi 5.7 atau 8.0) - [Download](https://dev.mysql.com/downloads/mysql/)
4. **Composer** (Opsional, jika ada dependensi PHP tambahan)
5. **Git** - [Download](https://git-scm.com/)

> **Rekomendasi:** Pengguna Windows disarankan menggunakan **Laragon** atau **XAMPP** yang sudah memaketkan Apache/Nginx, PHP, dan MySQL.

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/username/cemilan-kasirpos.git
cd cemilan-kasirpos
```

### 2. Setup Backend (PHP & MySQL)

1. **Database**:
   
   * Buat database baru di MySQL bernama `cemilankasirpos`.
   * Import file `cemilankasirpos.sql` ke dalam database tersebut. File ini berisi skema database lengkap dan data dummy awal.

2. **Konfigurasi Koneksi**:
   
   * Buka file `php_server/config.php`.
   * Sesuaikan konfigurasi database jika perlu (default: user `root`, password kosong).
   
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'cemilankasirpos');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   ```

3. **Menjalankan Server PHP**:
   
   * **Menggunakan Laragon/XAMPP (Disarankan)**: 
     
     * Pastikan folder project berada di dalam root folder web server (misal `C:\laragon\www\cemilan-kasirpos`). 
     * Aplikasi backend akan dapat diakses melalui URL seperti `http://localhost/cemilan-kasirpos/php_server/index.php`.
   
   * **Menggunakan PHP Built-in Server**:
     
     ```bash
     cd php_server
     php -S localhost:3001 index.php
     ```
     
     *Catatan: Jika menggunakan built-in server, Anda perlu menyesuaikan `VITE_API_URL` di frontend agar mengarah ke `http://localhost:3001/api`.*

### 3. Setup Frontend (React)

1. **Install Dependensi**:
   
   ```bash
   npm install
   ```

2. **Konfigurasi Environment (Opsional)**:
   
   * Secara default, frontend dikonfigurasi untuk mencari backend di path Laragon tertentu.
   
   * Untuk mengubah URL API, buat file `.env.local` di root project dan tambahkan variabel `VITE_API_URL`.
   
   * Contoh untuk PHP Built-in Server:
     
     ```env
     VITE_API_URL=http://localhost:3001/api
     ```
   
   * Contoh untuk Laragon (jika nama folder berbeda):
     
     ```env
     VITE_API_URL=http://localhost/nama-folder-project/php_server/index.php/api
     ```

3. **Jalankan Development Server**:
   
   ```bash
   npm run dev
   ```
   
   Aplikasi akan berjalan di `http://localhost:3000`.

## Struktur Project

Struktur folder project ini sedikit unik karena file source code frontend berada langsung di root folder, bukan di dalam `src/`.

* `root` - Kode sumber Frontend (React, TypeScript).
  * `pages/` - Halaman aplikasi (Route components).
  * `components/` - Komponen UI reusable.
  * `services/` - Logika komunikasi dengan API (`api.ts`).
  * `hooks/` - Custom React Hooks.
  * `utils/` - Utility functions (ada juga di `src/utils`).
  * `types.ts` - Definisi tipe TypeScript.
  * `src/` - Folder tambahan berisi `vite-env.d.ts` dan utilities tambahan.
* `php_server/` - Kode sumber Backend (PHP Native).
  * `index.php` - Router utama API.
  * `config.php` - Konfigurasi database dan CORS.
  * `auth.php` - Logika autentikasi (JWT) dan Middleware.
  * `login.php` - Endpoint untuk login user.
  * `validator.php` - Helper untuk validasi input.
  * `rate_limit.php` - Proteksi rate limiting sederhana.
  * `generate_hashes.php` - Script utility untuk generate hash password.
  * `migrate_passwords.php` - Script untuk migrasi password lama ke hash baru.
  * `update_schema_*.php` - Script untuk update struktur database.
  * `.htaccess` - Konfigurasi Apache (Rewrite rules).

## Fitur Keamanan Backend

Backend PHP kini dilengkapi dengan beberapa fitur keamanan:

* **JWT Authentication**: Setiap request ke API (kecuali login) memerlukan header `Authorization: Bearer <token>`.
* **Password Hashing**: Password user disimpan menggunakan `password_hash()` (Bcrypt).
* **CORS Protection**: `config.php` membatasi origin yang diizinkan.
* **Input Sanitization**: Mencegah XSS dan SQL Injection dasar.
* **Rate Limiting**: Mencegah brute force attack.

## Workflow Pengembangan

1. Lakukan perubahan pada kode frontend di root folder (pages, components, dll).
2. Lakukan perubahan pada logika backend di folder `php_server`.
3. Gunakan browser untuk melihat perubahan secara real-time (HMR aktif untuk frontend).
4. **Testing**: Pastikan untuk menguji fitur CRUD dan transaksi untuk memastikan integrasi frontend-backend berjalan lancar.
5. **Database**: Jika mengubah struktur database, jangan lupa update `cemilankasirpos.sql` atau buat script migrasi.

## Troubleshooting

* **CORS Error**: Pastikan `php_server/config.php` memiliki URL frontend Anda (misal `http://localhost:3000`) di daftar `$allowed_origins`.
* **Database Connection Error**: Cek kredensial di `config.php` dan pastikan layanan MySQL berjalan.
* **Login Gagal**: Pastikan user `superadmin` ada di database. Anda bisa menggunakan `php_server/generate_hashes.php` untuk membuat hash password baru jika lupa.
