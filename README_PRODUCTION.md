# Panduan Produksi & Deployment (Production Guide)

Dokumen ini menjelaskan langkah-langkah persiapan sebelum build (build preparation) dan konfigurasi untuk deployment aplikasi ke server produksi (live server). Aplikasi ini menggunakan backend **PHP Native**.

## 1. Konfigurasi CORS (Cross-Origin Resource Sharing)

CORS adalah fitur keamanan browser yang membatasi bagaimana web page di satu domain bisa meminta resource dari domain lain.

### Kapan Anda Perlu Mengatur CORS?

*   **Skenario A: Satu Domain (Same Origin) - REKOMENDASI**
    *   Contoh: Frontend di `https://toko-saya.com` dan Backend di `https://api.toko-saya.com` (subdomain).
    *   **Tindakan:** Anda tetap perlu konfigurasi CORS karena subdomain dianggap berbeda origin.

*   **Skenario B: Beda Domain (Cross Origin)**
    *   Contoh: Frontend di Vercel (`https://toko-saya.vercel.app`) dan Backend di VPS/cPanel (`https://api.toko-saya.com`).
    *   **Tindakan:** Anda **WAJIB** mengatur CORS agar frontend diizinkan mengakses backend.

### Cara Mengatur CORS

Buka file `php_server/config.php` dan edit konfigurasi CORS.
Secara default, aplikasi dikonfigurasi untuk menerima request dari `http://localhost:5173` (development).

```php
// php_server/config.php

// Izinkan domain tertentu
$allowed_origins = ['https://toko-saya.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true"); // Wajib true untuk Cookie Auth
```

> **Penting:** Jangan gunakan wildcard `*` di produksi. Anda **WAJIB** menspesifikasikan domain secara eksplisit agar `Access-Control-Allow-Credentials: true` berfungsi dengan aman.

---

## 2. Persiapan Sebelum Build (Pre-build Steps)

Sebelum menjalankan perintah build, pastikan konfigurasi aplikasi sudah benar.

### A. Konfigurasi Environment Variables

1. **Backend (PHP Native)**:
    
    *   **Opsi A: Shared Hosting/cPanel**
        *   Edit file `php_server/config.php` (atau sesuaikan saat upload nanti).
        *   Pastikan `SHOW_DEBUG_ERRORS` diset ke `false` untuk keamanan.
        *   Konfigurasi database dilakukan langsung di file `config.php`.

2. **Frontend (React)**:
   
   Buat atau edit file `.env.production` di root project:
   ```env
   VITE_API_URL=https://api.toko-saya.com/api
   ```
   
   *   **Jika Backend di Subdomain:** Gunakan URL lengkap seperti contoh di atas.
   *   **Jika Backend di Path yang Sama:** Gunakan path relatif seperti `/api`.

### B. Cek URL API (`services/api.ts`)

Pastikan konfigurasi API menggunakan environment variable dengan benar:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

### C. Jalankan Build Frontend

Jalankan perintah berikut di terminal untuk mengubah kode React menjadi file statis (HTML/CSS/JS) yang siap di-hosting:

```bash
npm run build
```

Setelah selesai, akan muncul folder baru bernama **`dist`**.
Folder `dist` inilah yang berisi aplikasi frontend Anda yang sudah jadi.

---

## 3. Langkah Deployment

### Opsi A: Deployment Backend PHP (Shared Hosting / cPanel) - REKOMENDASI
    
Metode ini paling mudah dan murah, cocok untuk shared hosting standar.

1.  **Upload Backend**:
    *   Upload isi folder `php_server` ke folder publik di hosting Anda (misal `public_html/api`).
2.  **Konfigurasi Database**:
    *   Edit `config.php` dengan kredensial database hosting.
3.  **Frontend**:
    *   Build frontend (`npm run build`).
    *   Upload folder `dist` ke hosting (misal ke `public_html`).
    *   Pastikan `.env.production` saat build frontend mengarah ke URL PHP yang benar (misal `https://toko-saya.com/api`).
4.  **Panduan Detail**:
    *   Lihat **[README_CPANEL_HOSTING.md](README_CPANEL_HOSTING.md)**.



### Opsi B: Deployment dengan Docker

Lihat panduan lengkap di **[README_DOCKER.md](README_DOCKER.md)** untuk deployment menggunakan Docker dan Docker Compose.

### Opsi C: Deployment Backend PHP (VPS/Lainnya)

Jika Anda menggunakan VPS atau server lain untuk PHP:
1.  Pastikan Web Server (Apache/Nginx) dan PHP terinstall.
2.  Konfigurasi Virtual Host untuk mengarah ke folder backend.
3.  Pastikan module `mod_rewrite` aktif jika menggunakan Apache.

---

## 4. Setup Database Produksi

1.  Buat database MySQL baru di server produksi.
2.  Import file `cemilankasirpos_php_v02.sql` atau `cemilankasirpos_big_dummy_data.sql`.
3.  Pastikan kredensial database di `php_server/config.php` sudah benar.
4.  Verifikasi koneksi database dengan menjalankan backend dan cek log.

---

## 5. Checklist Keamanan Produksi

Before launching, pastikan:

### Backend (PHP)
- [ ] File `config.php` sudah dikonfigurasi dengan benar.
- [ ] `JWT_SECRET` di `auth.php` menggunakan string random yang kuat (via Environment Variable atau edit file).
- [ ] CORS hanya mengizinkan domain produksi Anda.
- [ ] `SHOW_DEBUG_ERRORS` diset ke `false`.
- [ ] File log dan json sensitif dilindungi dari akses publik.

### Frontend
- [ ] Hapus teks 'Default Login (Demo)' login page di `App.tsx`
  ```html
  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
     <p className="text-xs text-slate-400 mb-2">Default Login (Demo):</p>
     <div className="inline-flex gap-2 text-xs font-mono bg-slate-100 px-3 py-2 rounded-lg text-slate-600">
        <span>superadmin / password</span>
     </div>
  </div>
  ```
- [ ] `VITE_API_URL` mengarah ke URL backend produksi yang benar.
- [ ] Tidak ada console.log atau debug code yang tersisa.
- [ ] Build production sudah dijalankan (`npm run build`).

### Server & Database
- [ ] **Wajib HTTPS**: Gunakan SSL/TLS yang valid. Tanpa HTTPS, Cookies aman tidak akan dikirim oleh browser dan aplikasi **tidak akan bisa login**.
- [ ] HSTS akan otomatis aktif jika HTTPS terdeteksi.
- [ ] Firewall dikonfigurasi dengan benar (hanya port yang diperlukan terbuka).
- [ ] Database backup otomatis sudah disetup.
- [ ] Monitoring dan logging sudah aktif (Cek error logs server).

### Testing
- [ ] Test login dan autentikasi.
- [ ] Test semua fitur utama (POS, inventory, laporan).
- [ ] Test di berbagai browser (Chrome, Firefox, Safari).
- [ ] Test di perangkat mobile.

---

## 6. Troubleshooting Produksi

### Backend Tidak Bisa Diakses
- Cek log error PHP (biasanya `error_log` di folder yang sama atau log server).
- **Note**: Jika `php_error.log` tidak bisa dibuka di browser (403 Forbidden), itu normal (fitur keamanan). Cek via File Manager/FTP.
- Verifikasi konfigurasi database di `config.php`.

### CORS Error
- Pastikan domain frontend sudah ditambahkan di `config.php`.
- Cek apakah HTTPS/HTTP konsisten (jangan mix).

### Database Connection Error
- Verifikasi kredensial di `config.php`.
- Cek apakah MySQL service berjalan.
- Pastikan user database punya privilege yang cukup.

### 502 Bad Gateway (Nginx)
- Cek apakah PHP-FPM berjalan (jika pakai Nginx).
- Verifikasi konfigurasi `fastcgi_pass` di Nginx.

---

## 7. Maintenance & Updates

### Update Backend
```bash
# Di server
cd /path/to/php_server
git pull origin main
# Tidak perlu npm install atau restart service (kecuali PHP-FPM jika ada perubahan config php.ini)
```

### Update Frontend
```bash
# Di local
npm run build

# Upload isi folder dist ke server
# Atau gunakan CI/CD pipeline
```

### Backup Database
```bash
# Buat backup manual
mysqldump -u user -p database_name > backup_$(date +%Y%m%d).sql

# Atau setup cron job untuk backup otomatis
```

---

## 8. Referensi Keamanan

Untuk detail lebih lanjut mengenai audit keamanan dan perbaikan yang telah diterapkan (seperti sanitasi data user dan error handling), silakan baca dokumen:

**[SECURITY_AUDIT.md](SECURITY_AUDIT.md)**

