# Dokumentasi Backend PHP - Cemilan KasirPOS

Dokumen ini menjelaskan cara instalasi, konfigurasi, dan penggunaan backend **PHP** yang merupakan backend **UTAMA** untuk aplikasi Cemilan KasirPOS.

## 📋 Prasyarat

Untuk menjalankan backend PHP, Anda memerlukan lingkungan server lokal seperti:

* **Laragon** (Disarankan untuk Windows)
* **XAMPP** / **WAMP**
* **PHP 7.4** atau lebih baru
* **MySQL Database**

## 📂 Struktur Folder

Backend PHP terletak di folder `php_server/`.

```
php_server/
├── config.php         # Konfigurasi Database & CORS
├── index.php          # Router Utama & Logika API
├── auth.php           # Middleware Autentikasi (JWT/Session)
├── login.php          # Endpoint Login
├── .htaccess          # Konfigurasi Apache (Rewrite Rules)
└── ...                # Skrip utilitas lainnya
```

## ⚙️ Konfigurasi

### 1. Database

Buka file `php_server/config.php` dan sesuaikan kredensial database Anda:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'cemilankasirpos');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### 2. Web Server (Apache/Nginx)

Pastikan folder `php_server` dapat diakses melalui web server lokal Anda.

* **Laragon:** Biasanya otomatis dapat diakses di `http://nama-folder.test/php_server`.
* **Manual:** Pastikan `DocumentRoot` mengarah ke folder proyek atau buat alias.

## 🔗 Koneksi Frontend ke Backend

Agar frontend React dapat berkomunikasi dengan backend PHP, ikuti langkah berikut:

### 1. Ubah Konfigurasi Frontend

Edit file `.env` di **root project** (folder utama aplikasi React):

Ubah baris `VITE_API_URL` menjadi:

```env
# Mengarah ke server PHP lokal (sesuaikan dengan URL Laragon/XAMPP Anda)
VITE_API_URL=http://localhost/cemilan-app/php_server/index.php/api
```

*Atau jika menggunakan Virtual Host Laragon:*

```env
VITE_API_URL=http://cemilan-app.test/php_server/index.php/api
```

### 2. Restart Frontend

Hentikan terminal frontend (Ctrl+C) dan jalankan ulang:

```bash
npm run dev
```

## 🔐 Fitur Keamanan PHP

Backend PHP ini juga telah dilengkapi dengan:

* **JWT Authentication:** Token berbasis sesi untuk keamanan API.
* **CORS Protection:** Membatasi akses hanya dari frontend yang diizinkan (diatur di `config.php`).
* **Rate Limiting:** Mencegah spam request (di `rate_limit.php`).

## ⚠️ Catatan Penting

* Backend PHP ini menggunakan **PDO** untuk koneksi database.
* Pastikan ekstensi `pdo_mysql` aktif di `php.ini`.
* Jika mengalami error 404 pada API, pastikan `.htaccess` aktif dan `mod_rewrite` diaktifkan di Apache.

---

*Dibuat oleh Asisten AI Google DeepMind*
