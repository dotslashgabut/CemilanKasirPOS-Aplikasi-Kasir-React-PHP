# Dokumentasi Backend PHP - Cemilan KasirPOS

Dokumen ini menjelaskan cara instalasi, konfigurasi, dan penggunaan backend **PHP Native** untuk aplikasi Cemilan KasirPOS. Backend ini adalah **opsi utama** yang direkomendasikan untuk pengguna shared hosting (cPanel) karena kemudahan deployment dan kompatibilitas yang luas.

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
define('DB_NAME', 'cemilankasirpos_php_v02'); // Pastikan nama database sesuai
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
Backend PHP ini dirancang untuk menyediakan API yang dibutuhkan oleh frontend React.

### 2. Logika Bisnis (`logic.php` & `index.php`)
Backend menangani logika bisnis krusial untuk menjaga integritas data:
*   **Transaksi Penjualan**: 
    *   Mengurangi stok produk secara otomatis.
    *   Mencatat arus kas masuk (Cash In).
    *   Mendukung pembayaran parsial (Tempo) dan multi-payment history.
*   **Pembelian Stok**: 
    *   Menambah stok produk otomatis.
    *   Mencatat arus kas keluar (Cash Out) atau hutang supplier.
*   **Stock Opname**: 
    *   Menggunakan tabel `stock_adjustments` untuk melacak koreksi stok manual (selisih stok fisik vs sistem).
*   **Batch Operations**: 
    *   Endpoint khusus untuk insert data dalam jumlah besar (Bulk Import) dengan validasi per item.

### 3. Keamanan (Diperbarui)
*   **JWT Authentication**: Token JWT ditandatangani dengan algoritma HS256. Mendukung lewat Header `Authorization: Bearer` atau `HttpOnly Cookies`.
*   **RBAC (Role-Based Access Control)**:
    *   `SUPERADMIN`: Akses penuh.
    *   `OWNER`: Akses manajemen tapi tidak bisa hapus user critical.
    *   `CASHIER` & `GUDANG`: Restricted access. Hanya bisa lihat data transaksi mereka sendiri (Data Isolation) dan tidak bisa ubah master data.
*   **Rate Limiting**: `rate_limit.php` menggunakan mekanisme *file locking* (`flock`) pada `login_attempts.json` untuk mencegah brute-force login tanpa race condition.
*   **Input Validation**: Semua input JSON dibersihkan (`strip_tags`), divalidasi tipe datanya, dan dicocokkan dengan Schema putih (`filterDataBySchema`).

## 🛠 Troubleshooting

*   **Error: "CORS Policy Blocked"**
    *   Pastikan `config.php` sudah mengatur header `Access-Control-Allow-Origin` dengan benar.
    *   Pastikan URL frontend sesuai dengan yang diizinkan (atau `*` untuk development).
*   **Error: "Database connection failed"**
    *   Cek kredensial di `config.php` atau file `.env`.
    *   Pastikan ekstensi `pdo_mysql` aktif di `php.ini`.
*   **Error: "Route not found" atau 404**
    *   Jika menggunakan Apache, pastikan `.htaccess` aktif dan `mod_rewrite` dinyalakan.
    *   Jika menggunakan PHP Built-in Server, pastikan menjalankannya dari dalam folder `php_server`.
*   **Tidak bisa akses Log Error di Browser**
    *   Ini adalah fitur keamanan. File `.log` dan `.json` diblokir dari akses browser.
    *   Silakan buka file `php_error.log` secara manual lewat File Explorer atau File Manager cPanel.

---
*Dibuat untuk Cemilan KasirPOS Nusantara*
