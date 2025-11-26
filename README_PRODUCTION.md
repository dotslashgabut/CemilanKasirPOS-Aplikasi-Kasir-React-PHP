# Panduan Produksi & Deployment (Production Guide)

Dokumen ini menjelaskan langkah-langkah persiapan sebelum build (build preparation) dan konfigurasi untuk deployment aplikasi ke server produksi (live server) menggunakan **Backend Node.js**.

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

Buka file `server/index.js` dan edit konfigurasi CORS di bagian middleware.
Secara default, aplikasi dikonfigurasi untuk menerima request dari `http://localhost:5173` (development).

```javascript
// server/index.js

const corsOptions = {
  origin: [
    'http://localhost:5173',           // Development
    'https://toko-saya.com',           // <-- TAMBAHKAN DOMAIN PRODUKSI ANDA DI SINI
    'https://www.toko-saya.com',       // <-- Dengan www jika diperlukan
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

> **Penting:** Jangan gunakan wildcard `*` di produksi karena kurang aman. Spesifikasikan domain Anda secara eksplisit.

---

## 2. Persiapan Sebelum Build (Pre-build Steps)

Sebelum menjalankan perintah build, pastikan konfigurasi aplikasi sudah benar.

### A. Konfigurasi Environment Variables

1. **Backend (Node.js)**:
   
   Buat atau edit file `.env.production` di folder `server`:
   ```env
   DB_NAME=nama_database_produksi
   DB_USER=user_database_produksi
   DB_PASS=password_database_produksi
   DB_HOST=localhost
   PORT=3001
   JWT_SECRET=rahasia_super_aman_ganti_ini_dengan_string_random
   NODE_ENV=production
   ```
   
   > **CRITICAL SECURITY NOTE:** 
   > Pastikan `NODE_ENV=production` selalu diset di server produksi. 
   > Setting ini mengaktifkan fitur keamanan yang **menyembunyikan detail error (stack traces)** dari pengguna akhir. 
   > Jika tidak diset, informasi sensitif sistem bisa bocor melalui pesan error. Lihat `SECURITY_AUDIT.md` untuk detailnya.

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
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
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

### Opsi A: Deployment ke VPS (Ubuntu/Debian)

Metode ini menggunakan PM2 untuk menjalankan Node.js dan Nginx sebagai reverse proxy.

1.  **Setup Backend:**
    ```bash
    # Upload folder server ke VPS (misal: /var/www/cemilan-backend)
    cd /var/www/cemilan-backend
    npm install --production
    
    # Install PM2 (Process Manager)
    npm install -g pm2
    
    # Jalankan aplikasi dengan PM2
    pm2 start index.js --name cemilan-api
    pm2 save
    pm2 startup
    ```

2.  **Setup Nginx:**
    ```nginx
    # /etc/nginx/sites-available/cemilan
    server {
        listen 80;
        server_name api.toko-saya.com;

        location /api {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Setup Frontend:**
    ```bash
    # Upload isi folder dist ke /var/www/html atau folder web server Anda
    ```

4.  **Setup SSL dengan Certbot:**
    ```bash
    sudo certbot --nginx -d toko-saya.com -d api.toko-saya.com
    ```

### Opsi B: Deployment ke cPanel (Shared Hosting)

Lihat panduan lengkap di **[README_CPANEL_HOSTING.md](README_CPANEL_HOSTING.md)** untuk deployment menggunakan fitur "Setup Node.js App" di cPanel.

Ringkasan langkah:
1.  Upload folder `server` ke hosting (di luar `public_html`).
2.  Setup aplikasi Node.js melalui menu cPanel.
3.  Konfigurasi environment variables.
4.  Upload hasil build frontend (`dist`) ke `public_html`.

### Opsi C: Deployment dengan Docker

Lihat panduan lengkap di **[README_DOCKER.md](README_DOCKER.md)** untuk deployment menggunakan Docker dan Docker Compose.

### Opsi D: Deployment Backend PHP (Shared Hosting / VPS)

Jika Anda menggunakan backend PHP, proses deployment jauh lebih sederhana, terutama di Shared Hosting.

1.  **Upload File**:
    *   Upload isi folder `php_server` ke folder publik di hosting Anda (misal `public_html/api` atau subdomain).
2.  **Konfigurasi Database**:
    *   Edit `config.php` dengan kredensial database hosting.
3.  **Frontend**:
    *   Build frontend (`npm run build`).
    *   Upload folder `dist` ke hosting.
    *   Pastikan `.env.production` saat build frontend mengarah ke URL PHP yang benar (misal `https://api.toko-saya.com/index.php/api`).
4.  **Detail**:
    *   Lihat **[README_PHP_BACKEND.md](./README_PHP_BACKEND.md)**.

---

## 4. Setup Database Produksi

1.  Buat database MySQL baru di server produksi.
2.  Import file `cemilankasirpos.sql` atau `cemilankasirpos_big_dummy_data.sql`.
3.  Pastikan kredensial database di `server/.env.production` sudah benar.
4.  Verifikasi koneksi database dengan menjalankan backend dan cek log.

---

## 5. Checklist Keamanan Produksi

Sebelum launching, pastikan:

### Backend (Node.js)
- [ ] File `.env` tidak ter-commit ke Git (sudah ada di `.gitignore`).
- [ ] `JWT_SECRET` menggunakan string random yang kuat (minimal 32 karakter).
- [ ] `DB_PASS` menggunakan password database yang kuat.
- [ ] CORS hanya mengizinkan domain produksi Anda (tidak menggunakan `*`).
- [ ] `NODE_ENV=production` sudah diset.
- [ ] Rate limiting sudah aktif (cek `server/index.js`).
- [ ] Helmet.js sudah aktif untuk security headers.

### Frontend
- [ ] `VITE_API_URL` mengarah ke URL backend produksi yang benar.
- [ ] Tidak ada console.log atau debug code yang tersisa.
- [ ] Build production sudah dijalankan (`npm run build`).

### Server & Database
- [ ] Gunakan **HTTPS** (SSL/TLS) untuk semua koneksi.
- [ ] Firewall dikonfigurasi dengan benar (hanya port yang diperlukan terbuka).
- [ ] Database backup otomatis sudah disetup.
- [ ] Monitoring dan logging sudah aktif (PM2, CloudWatch, dll).

### Testing
- [ ] Test login dan autentikasi.
- [ ] Test semua fitur utama (POS, inventory, laporan).
- [ ] Test di berbagai browser (Chrome, Firefox, Safari).
- [ ] Test di perangkat mobile.

---

## 6. Troubleshooting Produksi

### Backend Tidak Bisa Diakses
- Cek apakah Node.js process berjalan (`pm2 status` atau cek cPanel).
- Cek log error (`pm2 logs` atau stderr.log di cPanel).
- Verifikasi port dan firewall settings.

### CORS Error
- Pastikan domain frontend sudah ditambahkan di `corsOptions` di `server/index.js`.
- Cek apakah HTTPS/HTTP konsisten (jangan mix).

### Database Connection Error
- Verifikasi kredensial di `.env.production`.
- Cek apakah MySQL service berjalan.
- Pastikan user database punya privilege yang cukup.

### 502 Bad Gateway (Nginx)
- Cek apakah backend Node.js berjalan di port yang benar.
- Verifikasi konfigurasi `proxy_pass` di Nginx.

---

## 7. Maintenance & Updates

### Update Backend
```bash
# Di server
cd /var/www/cemilan-backend
git pull origin main
npm install
pm2 restart cemilan-api
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

