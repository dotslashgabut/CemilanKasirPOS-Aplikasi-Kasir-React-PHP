# Panduan Menjalankan Aplikasi Secara Lokal (Universal)

Panduan ini dirancang untuk membantu Anda menjalankan aplikasi **Cemilan KasirPOS** di komputer lokal menggunakan berbagai environment server seperti **XAMPP, Laragon, WAMP, MAMP**, atau sekadar menggunakan **PHP Built-in Server**.

## 📋 Prasyarat Sistem

Pastikan komputer Anda sudah terinstall:

1.  **Node.js** (Versi 18 atau lebih baru) - [Download Node.js](https://nodejs.org/)
2.  **PHP** (Versi 7.4 atau 8.x) - [Download PHP](https://www.php.net/)
3.  **MySQL / MariaDB** - Biasanya sudah termasuk dalam paket XAMPP/Laragon.
4.  **Git** (Opsional, untuk clone repository).
5.  **Browser Modern**: Pastikan browser Anda mengizinkan **Third-party Cookies** atau setidaknya cookies untuk Localhost, karena sistem login menggunakan **HttpOnly Cookies**.

---

## 🚀 Langkah 1: Persiapan Database

1.  Buka aplikasi manajemen database Anda (phpMyAdmin, HeidiSQL, DBeaver, dll).
    *   **phpMyAdmin**: Biasanya di `http://localhost/phpmyadmin`.
2.  Buat database baru dengan nama: `cemilankasirpos_php_v02`.
3.  Import file SQL:
    *   Cari file `cemilankasirpos_php_v02.sql` di folder utama project ini.
    *   Import file tersebut ke dalam database `cemilankasirpos_php_v02` yang baru dibuat.

---

## ⚙️ Langkah 2: Setup Backend (PHP)

Backend aplikasi ini menggunakan PHP Native dan terletak di folder `php_server`.

### 1. Konfigurasi Koneksi Database
Buka file `php_server/config.php` dengan text editor (VS Code, Notepad, dll) dan sesuaikan bagian ini:

```php
// php_server/config.php

define('DB_HOST', 'localhost');
define('DB_NAME', 'cemilankasirpos_php_v02'); // Pastikan nama DB sesuai
define('DB_USER', 'root');            // User default XAMPP/Laragon biasanya 'root'
define('DB_PASS', '');                // Password default biasanya kosong
```

### 2. Menjalankan Server Backend

Pilih **SATU** metode di bawah ini yang sesuai dengan tools yang Anda gunakan:

#### 👉 Opsi A: PHP Built-in Server (Paling Mudah & Direkomendasikan)
Metode ini tidak memerlukan setup Apache/Nginx yang rumit. Cocok untuk development cepat.

1.  Buka Terminal / Command Prompt.
2.  Masuk ke folder `php_server`:
    ```bash
    cd php_server
    ```
3.  Jalankan server PHP di port 8000:
    ```bash
    php -S localhost:8000
    ```
4.  **Selesai!** Backend Anda aktif di: `http://localhost:8000`.

#### 👉 Opsi B: Menggunakan XAMPP / WAMP / MAMP
1.  Pindahkan folder project `cemilan-kasirpos` ke dalam folder `htdocs` (XAMPP) atau `www` (WAMP).
    *   Contoh: `C:\xampp\htdocs\cemilan-kasirpos\`
2.  Pastikan **Apache** dan **MySQL** sudah di-start di Control Panel.
3.  **Selesai!** Backend Anda aktif di: `http://localhost/cemilan-kasirpos/php_server/`.

#### 👉 Opsi C: Menggunakan Laragon
1.  Pindahkan folder project ke `C:\laragon\www\cemilan-kasirpos\`.
2.  Reload Laragon.
3.  **Selesai!** Backend Anda aktif di: `http://cemilan-kasirpos.test/php_server/` (atau `http://localhost/cemilan-kasirpos/php_server/`).

---

## 💻 Langkah 3: Setup Frontend (React)

Frontend dibangun menggunakan React + Vite.

1.  Buka Terminal baru (jangan tutup terminal backend jika pakai Opsi A).
2.  Pastikan Anda berada di **root folder** project `cemilan-kasirpos`.
3.  Install dependencies (hanya perlu sekali di awal):
    ```bash
    npm install
    ```

4.  **Konfigurasi URL Backend (.env)**:
    *   Buat file bernama `.env` di root folder (sejajar dengan `package.json`).
    *   Isi file `.env` tersebut sesuai dengan **Opsi Backend** yang Anda pilih di Langkah 2:

    **Jika pakai Opsi A (PHP Built-in Server):**
    ```env
    VITE_API_URL=http://localhost:8000
    ```

    **Jika pakai Opsi B (XAMPP/WAMP):**
    ```env
    # Sesuaikan path folder jika berbeda
    VITE_API_URL=http://localhost/cemilan-kasirpos/php_server/index.php/api
    ```
    *(Tips: Tambahkan `/index.php/api` untuk memastikan routing berjalan lancar tanpa konfigurasi .htaccess tambahan)*

    **Jika pakai Opsi C (Laragon Pretty URL):**
    ```env
    VITE_API_URL=http://cemilan-kasirpos.test/php_server/index.php/api
    ```

5.  Jalankan Frontend:
    ```bash
    npm run dev
    ```
6.  Buka browser dan akses alamat yang muncul (biasanya `http://localhost:5173`).

---

## 🛠 Troubleshooting (Masalah Umum)

### 1. Error: "Network Error" atau Data Tidak Muncul
*   **Cek URL API**: Pastikan `VITE_API_URL` di file `.env` sudah benar dan sesuai dengan alamat backend Anda.
*   **Restart Frontend**: Setiap kali mengubah file `.env`, Anda **wajib** mematikan server frontend (Ctrl+C) dan menjalankannya lagi (`npm run dev`).
*   **Cek CORS**: Buka Console browser (F12). Jika ada error "CORS policy", pastikan `php_server/config.php` mengizinkan origin frontend Anda.

### 2. Error: "Database connection failed"
*   Pastikan MySQL service sedang berjalan (hijau di XAMPP/Laragon).
*   Cek kembali username, password, dan nama database di `php_server/config.php`.

### 3. Error: "404 Not Found" saat akses API
*   Jika menggunakan XAMPP/Laragon, pastikan file `.htaccess` di dalam folder `php_server` ada dan module `mod_rewrite` di Apache aktif.
*   Jika ragu, gunakan **Opsi A (PHP Built-in Server)** karena lebih minim konfigurasi.

### 4. Login Gagal / Password Salah
*   Gunakan user default jika baru import database:
    *   **Username**: `superadmin`
    *   **Password**: `password` (atau sesuai data dummy yang Anda miliki).
*   Jika password di database masih plain-text, sistem akan otomatis meng-hash saat login pertama sukses.

---
**Selamat Menggunakan Cemilan KasirPOS!** 🍬
