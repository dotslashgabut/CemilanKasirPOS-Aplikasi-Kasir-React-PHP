# Panduan Konfigurasi Environment untuk Laragon Virtual Host

## Problem yang Terjadi
Ketika menjalankan hasil build di Laragon dengan virtual host, aplikasi tidak dapat terhubung ke API karena masih menggunakan URL localhost development.

## File Environment yang Diperlukan

### 1. `.env.local` - Untuk Development
```
VITE_API_URL=http://localhost:8000/cemilan-app/php_server/index.php/api
```
- Digunakan saat menjalankan `npm run dev`
- Menggunakan localhost dengan port 8000

### 2. `.env.production` - Untuk Production Build
```
VITE_API_URL=http://cemilan-app.test/php_server/index.php/api
```
- Digunakan saat menjalankan `npm run build`
- Menggunakan virtual host Laragon Anda

## Langkah-langkah Setup

### A. Cek Virtual Host Anda di Laragon

1. Buka Menu Laragon → Virtual Hosts → (lihat nama virtual host Anda)
2. Biasanya berformat:
   - `nama-project.test`
   - `nama-project.local`
   - `nama-project.dev`

3. Atau cek file hosts Windows di: `C:\Windows\System32\drivers\etc\hosts`
   - Cari baris yang berisi IP dan nama domain virtual host

### B. Update File `.env.production`

Sesuaikan `VITE_API_URL` dengan struktur virtual host Anda:

**Jika virtual host root-nya mengarah ke folder project:**
```
# Misal: C:\laragon\www\cemilan-kasirpos
VITE_API_URL=http://cemilan-kasir.test/php_server/index.php/api
```

**Jika virtual host mengarah ke parent folder:**
```
# Misal: C:\laragon\www (parent), project di C:\laragon\www\cemilan-kasirpos
VITE_API_URL=http://localhost/cemilan-kasirpos/php_server/index.php/api
```

### C. Build Ulang Project

Setelah update `.env.production`:

```bash
# 1. Install dependencies (jika belum)
npm install

# 2. Build production
npm run build

# 3. Folder `dist` akan berisi hasil build dengan env production
```

### D. Deploy ke Laragon

**Option 1: Copy folder dist**
```
Copy isi folder `dist` ke document root virtual host Anda
Misal: C:\laragon\www\cemilan-kasir.test\
```

**Option 2: Ubah virtual host untuk point ke folder dist**
```
Edit virtual host config di Laragon untuk point ke:
C:\path\to\project\cemilan-kasirpos\dist
```

### E. Cek Konfigurasi PHP Backend

Pastikan file `php_server/config.php` sudah benar untuk production:

**CORS Settings:**
```php
// Allow dari domain virtual host Anda
header("Access-Control-Allow-Origin: http://cemilan-app.test");
```

**Database Connection:**
```php
// Pastikan credentials database Laragon sudah benar
```

## Testing

### 1. Test API Endpoint
Buka browser dan akses langsung:
```
http://nama-virtual-host-anda/php_server/index.php/api/products
```

Seharusnya return JSON data.

### 2. Test Frontend
Buka:
```
http://nama-virtual-host-anda
```

Seharusnya aplikasi bisa load dan connect ke API.

### 3. Check Console Browser
Tekan F12 → Console tab
- Jika ada CORS error → fix di `php_server/config.php`
- Jika 404 API → URL API salah di `.env.production`
- Jika 500 error → cek `php_server/php_error.log`

## Common Issues & Fixes

### Issue 1: CORS Error
**Symptom:** "Access to XMLHttpRequest... has been blocked by CORS policy"

**Fix:** Update `php_server/config.php`
```php
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://cemilan-app.test',  // Tambahkan virtual host Anda
];
```

### Issue 2: 404 Not Found API
**Symptom:** API endpoint return 404

**Fix:** 
1. Cek `.htaccess` di folder `php_server`
2. Pastikan Apache mod_rewrite enabled di Laragon
3. Cek path di `.env.production` sudah benar

### Issue 3: Blank Page after Build
**Symptom:** Build berhasil tapi halaman putih/blank

**Fix:**
1. Cek Console browser untuk error
2. Pastikan `base` di `vite.config.ts` sudah benar:
   ```typescript
   export default defineConfig({
     base: '/',  // atau sesuaikan dengan subfolder jika ada
   })
   ```

## Quick Reference Commands

```bash
# Development
npm run dev              # Menggunakan .env.local

# Production Build
npm run build            # Menggunakan .env.production

# Preview build locally
npm run preview          # Test build sebelum deploy

# Clean build
rm -rf dist node_modules
npm install
npm run build
```

## Checklist Debugging

- [ ] Virtual host sudah dibuat dan aktif di Laragon
- [ ] File `.env.production` URL sudah sesuai virtual host
- [ ] Build ulang dengan `npm run build`
- [ ] Hasil build di folder `dist` sudah ter-deploy
- [ ] PHP backend config CORS sudah include virtual host
- [ ] Test akses API langsung via browser (return JSON)
- [ ] Cek console browser untuk error
- [ ] Cek `php_server/php_error.log` untuk error backend

## Contoh Konfigurasi Lengkap

Untuk virtual host: `http://cemilan-kasir.test`

**.env.production:**
```
VITE_API_URL=http://cemilan-kasir.test/php_server/index.php/api
```

**php_server/config.php (excerpt):**
```php
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://cemilan-kasir.test'
];
```

**Deploy:**
```
Document root: C:\laragon\www\cemilan-kasir.test
Copy: dist/* → C:\laragon\www\cemilan-kasir.test\
PHP files: tetap di C:\laragon\www\cemilan-kasir.test\php_server\
```
