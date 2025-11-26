# Dokumentasi Backend PHP - Cemilan KasirPOS

Dokumen ini menjelaskan cara instalasi, konfigurasi, dan penggunaan backend **PHP Native** untuk aplikasi Cemilan KasirPOS. Backend ini adalah alternatif dari backend Node.js dan cocok untuk lingkungan shared hosting tradisional atau server yang sudah menjalankan PHP.

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
*   **PHP** (v8.0 atau lebih baru disarankan)
*   **MySQL Database** (melalui Laragon, XAMPP, atau instalasi standalone)
*   **Web Server** (Apache/Nginx) atau bisa menggunakan PHP Built-in Server

## 🚀 Instalasi & Setup

### 1. Navigasi ke Folder Server
Backend terletak di dalam folder `php_server` di root proyek.

```bash
cd php_server
```

### 2. Konfigurasi Database (`config.php`)
Buka file `config.php` dan sesuaikan kredensial database Anda:

```php
// config.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'cemilankasirpos'); // Pastikan nama database sesuai
define('DB_USER', 'root');
define('DB_PASS', ''); // Isi password jika ada
```

### 3. Konfigurasi Keamanan (`auth.php`)
Buka file `auth.php` dan ganti `JWT_SECRET` dengan string acak yang aman untuk produksi:

```php
// auth.php
$jwt_secret = getenv('JWT_SECRET') ?: 'ganti_dengan_string_rahasia_yang_panjang_dan_acak';
```

## ▶️ Menjalankan Server

### Opsi A: PHP Built-in Server (Development)
Untuk pengembangan lokal tanpa web server eksternal (seperti Apache/Nginx), Anda bisa menggunakan server bawaan PHP:

```bash
cd php_server
php -S localhost:8000
```
Server akan berjalan di `http://localhost:8000`.

### Opsi B: Menggunakan XAMPP / Laragon
1.  Pindahkan atau symlink folder `php_server` ke direktori `htdocs` (XAMPP) atau `www` (Laragon).
2.  Akses melalui URL, misalnya: `http://localhost/cemilan-kasirpos/php_server/index.php`.

## 🔌 Integrasi Frontend

Frontend React perlu tahu ke mana harus mengirim request API. Edit file `.env` di **root project** (bukan di folder server):

**Jika menggunakan PHP Built-in Server:**
```env
VITE_API_URL=http://localhost:8000
```
*Catatan: Jika error 404, coba `http://localhost:8000/index.php`*

**Jika menggunakan XAMPP/Laragon:**
```env
VITE_API_URL=http://localhost/path/ke/php_server/index.php/api
```

## 📂 Struktur Proyek Backend

```
php_server/
├── config.php         # Konfigurasi Database & CORS
├── auth.php           # Middleware Autentikasi & JWT
├── index.php          # Router Utama & CRUD Generik
├── logic.php          # Logika Bisnis Kompleks (Transaksi, Stok, dll)
├── login.php          # Handler Login
├── validator.php      # Validasi Input
└── ...
```

## 🔐 Fitur Utama

### 1. Kompatibilitas Penuh dengan Frontend
Backend PHP ini dirancang untuk meniru API response dari backend Node.js, sehingga frontend React dapat bekerja tanpa perubahan kode (hanya ganti URL API).

### 2. Logika Bisnis (`logic.php`)
File `logic.php` menangani operasi kompleks seperti:
*   **Transaksi Penjualan**: Mengurangi stok otomatis & mencatat arus kas.
*   **Pembelian Stok**: Menambah stok otomatis & mencatat pengeluaran.
*   **Cascade Delete**: Menghapus transaksi akan otomatis menghapus data arus kas terkait.

### 3. Keamanan
*   **JWT Authentication**: Menggunakan token JSON Web Token untuk sesi login.
*   **Password Hashing**: Mendukung verifikasi password `bcrypt`.
*   **Auto-Upgrade Password**: Jika user login dengan password plain-text (legacy), sistem otomatis meng-update-nya menjadi hash `bcrypt` yang aman.
*   **Rate Limiting**: Mencegah brute-force pada endpoint login.

## 🛠 Troubleshooting

*   **Error: "CORS Policy Blocked"**
    *   Pastikan `config.php` sudah mengatur header `Access-Control-Allow-Origin` dengan benar.
    *   Pastikan URL frontend sesuai dengan yang diizinkan (atau `*` untuk development).
*   **Error: "Database connection failed"**
    *   Cek kredensial di `config.php`.
    *   Pastikan ekstensi `pdo_mysql` aktif di `php.ini`.
*   **Error: "Route not found" atau 404**
    *   Jika menggunakan Apache, pastikan `.htaccess` aktif dan `mod_rewrite` dinyalakan.
    *   Jika menggunakan PHP Built-in Server, pastikan menjalankannya dari dalam folder `php_server`.

---
*Dibuat untuk Cemilan KasirPOS Nusantara*
