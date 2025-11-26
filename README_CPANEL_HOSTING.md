# Panduan Hosting ke cPanel (Versi Node.js Backend)

Panduan ini menjelaskan cara meng-hosting aplikasi Cemilan KasirPOS menggunakan **Backend Node.js** ke shared hosting cPanel yang mendukung fitur **Setup Node.js App**.

## 📋 Prasyarat

1.  Akses ke cPanel hosting.
2.  Hosting mendukung **Node.js** (Fitur "Setup Node.js App").
3.  Domain atau subdomain yang aktif (misal: `tokocemilan.com`).
4.  Database MySQL yang sudah dibuat di cPanel.

## 🏗️ Langkah 1: Persiapan Database

1.  Login ke cPanel.
2.  Buka **MySQL Database Wizard**.
3.  Buat database baru (contoh: `u12345_cemilan`).
4.  Buat user database baru (contoh: `u12345_admin`) dan passwordnya.
5.  **PENTING**: Berikan hak akses **ALL PRIVILEGES** user tersebut ke database yang baru dibuat.
6.  Buka **phpMyAdmin**, pilih database tadi, lalu Import file `cemilankasirpos.sql` (atau file sql terbaru) yang ada di folder proyek ini.

## ⚙️ Langkah 2: Upload Backend (Node.js)

1.  Buka **File Manager** di cPanel.
2.  Buat folder baru di luar `public_html` agar lebih aman (misal: `/home/u12345/cemilan-backend`).
3.  Upload semua isi dari folder `server` di komputer Anda ke dalam folder tersebut.
    *   **JANGAN** upload folder `node_modules`.
    *   Pastikan `package.json`, `index.js`, folder `models`, `config`, dll terupload.
4.  Buat file `.env` di dalam folder backend tersebut (jika belum ada) dan isi dengan konfigurasi database:
    ```env
    DB_HOST=localhost
    DB_USER=u12345_admin
    DB_PASS=password_anda
    DB_NAME=u12345_cemilan
    JWT_SECRET=rahasia_super_aman_ganti_ini
    PORT=3000
    NODE_ENV=production
    ```

    > **PENTING (KEAMANAN):** Pastikan `NODE_ENV=production` ditambahkan. Ini akan menyembunyikan pesan error detail dari pengguna (mencegah kebocoran info sistem). Lihat `SECURITY_AUDIT.md` untuk detailnya.

## 🚀 Langkah 3: Konfigurasi Node.js di cPanel

1.  Di dashboard cPanel, cari dan buka menu **Setup Node.js App**.
2.  Klik **Create Application**.
3.  Isi form konfigurasi:
    *   **Node.js Version**: Pilih versi yang direkomendasikan (misal: 18.x atau 20.x).
    *   **Application Mode**: `Production`.
    *   **Application Root**: Masukkan path folder yang baru dibuat (misal: `cemilan-backend`).
    *   **Application URL**: Pilih domain Anda.
        *   Saran: Gunakan subdomain khusus untuk API, misal `api.tokocemilan.com`.
        *   Jika ingin menggunakan subfolder (misal `tokocemilan.com/api`), pastikan tidak bentrok dengan frontend.
    *   **Application Startup File**: `index.js`.
4.  Klik **Create**.
5.  Setelah aplikasi dibuat, klik tombol **Run NPM Install** untuk menginstall dependencies (ini akan membaca `package.json`).
6.  **Environment Variables**:
    *   Beberapa hosting mengharuskan setting environment variables lewat menu ini juga (tombol "Add Variable").
    *   Masukkan key-value pair dari `.env` Anda di sini jika file `.env` tidak terbaca otomatis.

## 🖥️ Langkah 4: Build & Upload Frontend (React)

1.  **Edit Environment Variable Frontend**:
    *   Buka file `.env.production` di komputer Anda.
    *   Ubah `VITE_API_URL` sesuai dengan URL aplikasi Node.js Anda tadi.
    *   Contoh jika pakai subdomain: `VITE_API_URL=https://api.tokocemilan.com/api`
    *   *Catatan: Backend Express kita melayani di `/api`, jadi pastikan URL diakhiri `/api` jika route group di `index.js` menggunakan prefix tersebut, atau sesuaikan dengan routing Anda.*

2.  **Build Project**:
    *   Buka terminal di root project.
    *   Jalankan: `npm run build`.
    *   Folder `dist` akan terupdate.

3.  **Upload ke cPanel**:
    *   Buka **File Manager**.
    *   Masuk ke folder `public_html` (atau folder subdomain frontend Anda).
    *   Hapus file lama jika ada.
    *   Upload **semua isi** dari folder `dist` ke sini.
    *   Anda harus melihat `index.html`, folder `assets`, dll.

4.  **Konfigurasi .htaccess untuk React Router**:
    *   Buat atau edit file `.htaccess` di folder frontend (`public_html`).
    *   Isi dengan kode berikut agar refresh halaman tidak 404:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /index.html [L]
    </IfModule>
    ```

## ✅ Langkah 5: Testing

1.  Buka website frontend Anda (misal: `https://tokocemilan.com`).
2.  Coba login.
3.  Jika berhasil, berarti Frontend sukses berkomunikasi dengan Backend Node.js.

## 🛡️ Troubleshooting

1.  **API Error / Network Error**:
    *   Cek Console browser (F12). Jika 404 atau 500 pada request ke API, cek URL API.
    *   Pastikan Backend Node.js statusnya "Started" di cPanel.
2.  **Database Connection Error**:
    *   Cek log aplikasi di menu "Setup Node.js App" (biasanya ada stderr.log).
    *   Pastikan user DB punya hak akses penuh.
3.  **Changes not reflecting**:
    *   Setiap kali mengubah kode backend (misal upload file baru), Anda harus klik **Restart** di menu Setup Node.js App.

## 🔒 Referensi Keamanan

Aplikasi ini telah diaudit keamanannya. Pastikan Anda mengikuti langkah-langkah di atas (terutama setting `NODE_ENV`) untuk memastikan deployment Anda aman.

Baca **[SECURITY_AUDIT.md](SECURITY_AUDIT.md)** untuk laporan lengkap dan detail perbaikan keamanan yang telah diterapkan.
