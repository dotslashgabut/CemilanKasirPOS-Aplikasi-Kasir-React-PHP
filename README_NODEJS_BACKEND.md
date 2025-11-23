# Dokumentasi Backend Node.js - Cemilan KasirPOS

> **PERHATIAN:** Project ini sekarang menggunakan **PHP** sebagai backend utama. Dokumentasi ini dipertahankan hanya untuk referensi historis atau penggunaan alternatif jika Anda ingin mengembangkan versi Node.js.

Dokumen ini menjelaskan cara instalasi, konfigurasi, dan penggunaan backend Node.js (Legacy) untuk aplikasi Cemilan KasirPOS. Backend ini menggunakan **Express.js** dan **Sequelize ORM**.

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

* **Node.js** (v18 atau lebih baru disarankan)
* **MySQL Database** (melalui Laragon, XAMPP, atau instalasi standalone)

## 🚀 Instalasi & Setup

### 1. Navigasi ke Folder Server

Backend terletak di dalam folder `server` di root proyek.

```bash
cd server
```

### 2. Instalasi Dependencies

Jalankan perintah berikut untuk menginstal paket-paket yang diperlukan (Express, Sequelize, MySQL2, dll):

```bash
npm install
```

### 3. Konfigurasi Environment (.env)

Pastikan file `.env` ada di dalam folder `server`. Jika belum ada, buat file `.env` dan isi dengan konfigurasi berikut:

```env
# Konfigurasi Database
DB_NAME=cemilankasirpos
DB_USER=root
DB_PASS=
DB_HOST=localhost

# Konfigurasi Server
PORT=3001

# Keamanan (JWT)
JWT_SECRET=cemilan_secure_secret_key_2024
```

> **Catatan:** Sesuaikan `DB_USER` dan `DB_PASS` dengan konfigurasi MySQL lokal Anda.

## ▶️ Menjalankan Server

Untuk menjalankan server backend, gunakan perintah berikut di dalam folder `server`:

```bash
npm start
```

Server akan berjalan di `http://localhost:3001`.

Output sukses akan terlihat seperti ini:

```
Server running on port 3001
Database synced
```

## 🔌 Integrasi Frontend

Frontend React telah dikonfigurasi untuk terhubung ke backend ini. Pastikan file `.env` di **root project** (bukan di folder server) memiliki konfigurasi berikut:

```env
VITE_API_URL=http://localhost:3001/api
```

## 📂 Struktur Proyek Backend

```
server/
├── config/
│   └── database.js    # Koneksi Sequelize ke MySQL
├── models/
│   ├── index.js       # Definisi Model & Relasi
│   └── ...            # (Model diimpor dari backup sebelumnya)
├── index.js           # Entry point utama (Routes, Auth, Middleware)
├── package.json       # Dependencies & Scripts
└── .env               # Konfigurasi Environment
```

## 🔐 Fitur Utama

### 1. Autentikasi JWT

* Login endpoint: `POST /api/login`
* Semua endpoint CRUD dilindungi oleh middleware autentikasi.
* Frontend harus menyertakan header `Authorization: Bearer <token>` pada setiap request.

### 2. Auto-Sync Database

Server menggunakan `sequelize.sync({ alter: true })` yang secara otomatis memperbarui skema database MySQL agar sesuai dengan model yang didefinisikan di kode, tanpa menghapus data yang ada.

### 3. Kompatibilitas Password

Sistem mendukung dua jenis password untuk memudahkan migrasi:

* **Plain Text:** Untuk pengguna lama yang belum mereset password.
* **Bcrypt Hash:** Untuk keamanan standar. Sistem akan otomatis meng-hash password plain text saat login pertama kali (opsional, logika ada di `index.js`).

## 🛠 Troubleshooting

* **Error: "Cannot use import statement outside a module"**
  * Pastikan `package.json` di folder server memiliki baris `"type": "module"`.
* **Error: "Access denied for user 'root'@'localhost'"**
  * Periksa kembali username dan password database di file `server/.env`.
* **Error: "Port 3001 is already in use"**
  * Matikan proses Node.js yang berjalan sebelumnya atau ubah `PORT` di `.env`.

---

*Dibuat oleh Asisten AI Google DeepMind*
