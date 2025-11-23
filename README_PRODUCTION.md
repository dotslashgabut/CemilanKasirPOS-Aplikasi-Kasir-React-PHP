# Panduan Produksi & Deployment (Production Guide)

Dokumen ini menjelaskan langkah-langkah persiapan sebelum build (build preparation) dan konfigurasi untuk deployment aplikasi ke server produksi (live server).

## 1. Konfigurasi CORS (Cross-Origin Resource Sharing)

CORS adalah fitur keamanan browser yang membatasi bagaimana web page di satu domain bisa meminta resource dari domain lain.

### Kapan Anda Perlu Mengatur CORS?

*   **Skenario A: Satu Domain (Same Origin) - REKOMENDASI**
    *   Contoh: Frontend di `https://toko-saya.com` dan Backend di `https://toko-saya.com/php_server`.
    *   **Tindakan:** Anda **TIDAK PERLU** pusing soal CORS. Browser mengizinkan request ke domain yang sama secara otomatis.
    *   *Catatan: Pastikan `php_server/config.php` tetap memiliki localhost untuk keperluan testing lokal.*

*   **Skenario B: Beda Domain (Cross Origin)**
    *   Contoh: Frontend di Vercel (`https://toko-saya.vercel.app`) dan Backend di Hosting cPanel (`https://api.toko-saya.com`).
    *   **Tindakan:** Anda **WAJIB** mengatur CORS agar frontend diizinkan mengakses backend.

### Cara Mengatur CORS

Buka file `php_server/config.php` dan edit bagian `$allowed_origins`.

```php
// php_server/config.php

$allowed_origins = [
    'http://localhost:5173',      // Default (Development Vite)
    'http://localhost:3000',      // Default (Development Preview)
    'https://toko-saya.com',      // <-- TAMBAHKAN DOMAIN PRODUKSI ANDA DI SINI
];
```

> **Penting:** Jangan gunakan wildcard `*` di produksi karena kurang aman. Spesifikasikan domain Anda.

---

## 2. Persiapan Sebelum Build (Pre-build Steps)

Sebelum menjalankan perintah build, pastikan konfigurasi aplikasi sudah benar.

### A. Cek URL API (`src/services/api.ts`)

Aplikasi menggunakan logika otomatis untuk menentukan URL API.
*   **Development**: Menggunakan `VITE_API_URL` dari `.env` atau fallback ke localhost.
*   **Production**: Menggunakan path relatif `/php_server/index.php/api`.

Jika Anda menggunakan **Skenario A (Satu Domain)**, Anda tidak perlu mengubah apa pun di kode.

Jika Anda menggunakan **Skenario B (Beda Domain)**, Anda perlu memastikan `VITE_API_URL` diatur di environment variable saat build, atau edit `src/services/api.ts` secara manual.

### B. Jalankan Build

Jalankan perintah berikut di terminal untuk mengubah kode React menjadi file statis (HTML/CSS/JS) yang siap di-hosting:

```bash
npm install # Pastikan dependensi terinstall
npm run build
```

Setelah selesai, akan muncul folder baru bernama **`dist`**. Folder inilah yang berisi aplikasi frontend Anda.

---

## 3. Langkah Deployment (Contoh: cPanel / Shared Hosting)

Ini adalah metode paling umum dan mudah (Skenario A).

1.  **Siapkan File:**
    *   Folder `dist` (hasil build frontend).
    *   Folder `php_server` (backend).

2.  **Upload ke File Manager (public_html):**
    *   Upload **isi** dari folder `dist` (file `index.html`, folder `assets`, dll) langsung ke dalam `public_html`.
    *   Upload folder `php_server` ke dalam `public_html`, sehingga strukturnya menjadi `public_html/php_server`.

    **Struktur Akhir di Server:**
    ```
    public_html/
    ├── assets/          <-- dari dist
    ├── index.html       <-- dari dist
    ├── favicon.ico      <-- dari dist
    └── php_server/      <-- folder backend
        ├── index.php
        ├── config.php
        └── ...
    ```

3.  **Setup Database:**
    *   Buat database MySQL baru di cPanel.
    *   Import file `cemilankasirpos.sql` ke database tersebut.
    *   Edit `public_html/php_server/config.php` dan masukkan detail database (DB_NAME, DB_USER, DB_PASS) dari hosting Anda.

4.  **Selesai!**
    *   Buka domain Anda (misal `https://toko-saya.com`). Aplikasi seharusnya berjalan normal.

---

## 4. Checklist Keamanan Produksi

Sebelum launching, pastikan:

1.  [ ] **Database Password**: Di `config.php`, pastikan `DB_PASS` diisi dengan password yang kuat.
2.  [ ] **CORS**: Di `config.php`, pastikan `$allowed_origins` hanya berisi domain Anda.
3.  [ ] **Error Reporting**: Pastikan error PHP tidak ditampilkan ke pengguna (set `display_errors = Off` di php.ini hosting).
4.  [ ] **HTTPS**: Gunakan SSL/HTTPS agar login dan transaksi aman.
5.  [ ] **Ganti Password Default**: Login sebagai `superadmin` dan segera ganti password defaultnya.
6.  [ ] **Hapus File Setup**: Hapus file `cemilankasirpos.sql` dari server jika ikut terupload, agar tidak didownload orang lain.

## 5. Troubleshooting

*   **Login Gagal (Network Error)**:
    *   Cek Console browser (F12). Jika ada error 404 pada request ke `/php_server/...`, berarti letak folder `php_server` salah.
    *   Jika error 500, cek `php_server/php_error.log` (jika ada) atau pastikan kredensial database benar.
*   **Halaman Blank Putih**:
    *   Pastikan semua file dari folder `dist` terupload dengan benar.
    *   Cek Console browser untuk melihat error JavaScript.
