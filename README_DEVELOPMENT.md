# Panduan Pengembangan (Development Guide)

Dokumen ini berisi panduan untuk setup lingkungan pengembangan (development environment) untuk aplikasi Cemilan KasirPOS menggunakan **Backend Node.js (Express + Sequelize)**.

## 📋 Prasyarat (Prerequisites)

Pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:

1. **Node.js** (versi 18 atau lebih baru) - [Download](https://nodejs.org/)
2. **MySQL** (versi 5.7 atau 8.0) - [Download](https://dev.mysql.com/downloads/mysql/)
3. **Git** - [Download](https://git-scm.com/)
4. **Code Editor** - Disarankan [VS Code](https://code.visualstudio.com/)

> **Rekomendasi:** Pengguna Windows disarankan menggunakan **Laragon** atau **XAMPP** untuk manajemen database MySQL yang lebih mudah.

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/dotslashgabut/cemilan-kasirpos.git
cd cemilan-kasirpos
```

### 2. Setup Backend (Node.js & MySQL)

Backend terletak di folder `server` dan menggunakan:
- **Express.js** - Web framework
- **Sequelize** - ORM untuk MySQL
- **JWT** - Autentikasi
- **bcryptjs** - Password hashing

#### A. Setup Database

1. **Buat Database**:
   ```sql
   CREATE DATABASE cemilankasirpos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Import Data (Opsional)**:
   * Untuk data : Import `cemilankasirpos.sql`
   * **Catatan**: Server akan otomatis membuat tabel jika belum ada (Auto-Sync via Sequelize).

#### B. Instalasi Dependensi Backend

```bash
cd server
npm install
```

Dependensi yang akan terinstall:
- `express` - Web framework
- `sequelize` & `mysql2` - Database ORM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password encryption
- `cors` - Cross-Origin Resource Sharing
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables

#### C. Konfigurasi Environment

Buat file `.env` di dalam folder `server` dengan isi:

```env
# Database Configuration
DB_NAME=cemilankasirpos
DB_USER=root
DB_PASS=
DB_HOST=localhost

# Server Configuration
PORT=3001
PORT=3001
NODE_ENV=development
# Set ke 'production' untuk menyembunyikan detail error (stack traces)

# Security
JWT_SECRET=rahasia_development_123_ganti_di_production
```

**Catatan Penting**:
- Sesuaikan `DB_USER` dan `DB_PASS` dengan konfigurasi MySQL Anda
- Kosongkan `DB_PASS` jika menggunakan default XAMPP/Laragon
- `JWT_SECRET` harus diganti dengan string random yang kuat di production

#### D. Jalankan Server

```bash
npm start
```

Server akan berjalan di `http://localhost:3001`.

**Verifikasi Backend**:
- Buka browser dan akses `http://localhost:3001/api/health` (jika ada health check endpoint)
- Atau cek terminal untuk pesan "Server running on port 3001"

### 2.1. Alternative: Setup Backend (PHP Native)

Jika Anda lebih memilih menggunakan PHP (misalnya karena keterbatasan hosting), ikuti langkah ini:

1.  **Pastikan PHP & MySQL Terinstall**:
    *   Gunakan XAMPP, Laragon, atau install PHP manual.
    *   Pastikan ekstensi `pdo_mysql` aktif di `php.ini`.

2.  **Setup Database**:
    *   Sama seperti langkah Node.js di atas, buat database `cemilankasirpos` dan import file SQL.

3.  **Konfigurasi**:
    *   Edit file `php_server/config.php` sesuai kredensial database Anda.

4.  **Jalankan Server**:
    ```bash
    cd php_server
    php -S localhost:8000
    ```

5.  **Dokumentasi Lengkap**:
    *   Lihat **[README_PHP_BACKEND.md](./README_PHP_BACKEND.md)** untuk detail lengkap.

### 3. Setup Frontend (React + Vite)

Buka terminal baru (biarkan terminal backend tetap berjalan).

#### A. Instalasi Dependensi Frontend

```bash
# Kembali ke root project
cd ..
# atau jika dari terminal baru: cd cemilan-kasirpos

npm install
```

Frontend menggunakan:
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts & graphs
- **Dexie** - IndexedDB wrapper

#### B. Konfigurasi Environment

Buat atau edit file `.env` di root project:

```env
VITE_API_URL=http://localhost:3001/api
```

#### C. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.
(atau yang tampil di terminal)

**Verifikasi Frontend**:
- Buka browser dan akses `http://localhost:5173`
- Halaman login seharusnya muncul
- Coba login dengan kredensial default (jika ada di database)

## 📁 Struktur Project

```
cemilan-kasirpos/
├── components/               # Komponen UI reusable
├── pages/                    # Halaman aplikasi
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── POS.tsx
│   ├── Inventory.tsx
│   └── ...
├── services/                 # API services & business logic
│   └── api.ts               # Axios instance & API calls
├── hooks/                    # Custom React hooks
├── utils/                    # Utility functions
├── server/                   # Backend (Node.js + Express)
│   ├── config/               # Konfigurasi
│   │   └── database.js      # Sequelize connection
│   ├── models/               # Sequelize models
│   │   └── index.js         # Model definitions & associations
│   ├── index.js             # Entry point & route handlers
│   ├── .env                 # Environment variables (jangan commit!)
│   └── package.json         # Backend dependencies
│
├── public/                   # Static assets
├── App.tsx                  # Main app component
├── index.tsx                # Entry point
├── types.ts                 # TypeScript type definitions
├── .env                     # Frontend environment variables
├── package.json             # Frontend dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## 🔧 Workflow Pengembangan

### Backend Development

1. **Membuat Model Baru**:
   - Tambahkan definisi model di `server/models/index.js`
   - Sequelize akan otomatis membuat tabel saat server restart (jika `sync()` aktif)

2. **Menambah API Endpoint**:
   - Edit `server/index.js`
   - Tambahkan route handler baru
   - Restart server untuk melihat perubahan

3. **Testing API**:
   - Gunakan Postman, Thunder Client, atau curl
   - Contoh: `curl http://localhost:3001/api/products`

4. **Hot Reload** (Opsional):
   ```bash
   # Install nodemon sebagai dev dependency
   npm install --save-dev nodemon
   
   # Edit package.json, tambahkan script:
   "dev": "nodemon index.js"
   
   # Jalankan dengan:
   npm run dev
   ```

### Frontend Development

1. **Membuat Halaman Baru**:
   - Buat file di `pages/`
   - Tambahkan routing di `App.tsx`
   - Vite HMR akan langsung update browser

2. **Membuat Komponen**:
   - Buat file di `components/`
   - Import dan gunakan di halaman

3. **API Integration**:
   - Tambahkan fungsi API di `services/api.ts`
   - Gunakan `async/await` untuk API calls
   - Handle error dengan try-catch

4. **Styling**:
   - Gunakan Tailwind CSS classes
   - Custom styles di file `.css` jika diperlukan

### Database Management

1. **Melihat Data**:
   - Gunakan phpMyAdmin (XAMPP/Laragon)
   - Atau MySQL Workbench
   - Atau command line: `mysql -u root -p`

2. **Reset Database**:
   ```sql
   DROP DATABASE cemilankasirpos;
   CREATE DATABASE cemilankasirpos;
   -- Import ulang file .sql
   ```

3. **Backup Database**:
   ```bash
   mysqldump -u root -p cemilankasirpos > backup.sql
   ```

## 🐛 Troubleshooting

### Backend Issues

**❌ Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solusi**:
- Pastikan MySQL service berjalan
- Cek kredensial di `server/.env`
- Verifikasi database sudah dibuat
- Test koneksi: `mysql -u root -p`

**❌ Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solusi**:
- Cari proses yang menggunakan port: `netstat -ano | findstr :3001` (Windows)
- Kill proses tersebut atau ubah `PORT` di `.env`

**❌ JWT Secret Error**
```
Error: secretOrPrivateKey must have a value
```
**Solusi**:
- Pastikan `JWT_SECRET` ada di `server/.env`

**❌ CORS Error**
```
Access to fetch at 'http://localhost:3001/api/...' has been blocked by CORS policy
```
**Solusi**:
- Cek konfigurasi CORS di `server/index.js`
- Pastikan `http://localhost:5173` ada di `corsOptions.origin`

### Frontend Issues

**❌ API URL Not Configured**
```
Error: Network Error
```
**Solusi**:
- Pastikan `VITE_API_URL` ada di `.env`
- Restart dev server setelah edit `.env`

**❌ Module Not Found**
```
Error: Cannot find module 'lucide-react'
```
**Solusi**:
- Jalankan `npm install` di root project
- Hapus `node_modules` dan `package-lock.json`, lalu `npm install` lagi

**❌ Port 5173 Already in Use**
**Solusi**:
- Vite akan otomatis menggunakan port lain (5174, 5175, dst)
- Atau kill proses yang menggunakan port 5173

### General Issues

**❌ Changes Not Reflecting**
- **Backend**: Restart server (atau gunakan nodemon)
- **Frontend**: Vite HMR biasanya otomatis, coba hard refresh (Ctrl+Shift+R)
- **Environment Variables**: Restart server/dev setelah edit `.env`

**❌ Permission Denied (Linux/Mac)**
```bash
sudo chown -R $USER:$USER .
```

## 📚 Resources & Documentation

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🔐 Default Credentials (Development)

Jika menggunakan file SQL dengan dummy data:
- **Admin**: username/password sesuai data di database
- **Kasir**: username/password sesuai data di database

> **Penting**: Ganti semua password default sebelum deployment ke production!

## 🛡️ Catatan Keamanan (Security Note)

Aplikasi ini memiliki fitur keamanan yang bergantung pada environment variable `NODE_ENV`.

*   **Development (`NODE_ENV=development`)**: Error akan ditampilkan secara detail (stack trace) untuk memudahkan debugging.
*   **Production (`NODE_ENV=production`)**: Error detail akan disembunyikan dan diganti dengan pesan generik untuk keamanan.

> Pastikan Anda membaca **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)** untuk memahami audit keamanan dan praktik terbaik sebelum melakukan deployment.

## 📝 Git Workflow

```bash
# Buat branch baru untuk fitur
git checkout -b feature/nama-fitur

# Commit perubahan
git add .
git commit -m "feat: deskripsi perubahan"

# Push ke remote
git push origin feature/nama-fitur

# Buat Pull Request di GitHub
```

## 🎯 Next Steps

Setelah development environment berjalan:
1. Pelajari struktur kode yang ada
2. Coba fitur-fitur yang sudah ada
3. Baca dokumentasi API di `server/index.js`
4. Mulai develop fitur baru atau fix bugs
5. Lihat `README_PRODUCTION.md` untuk panduan deployment
