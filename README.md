# Cemilan KasirPOS Nusantara

![Static Badge](https://img.shields.io/badge/build-passing-green?style=for-the-badge)

**Bug:** Unknown

**🍬 Cemilan KasirPOS Nusantara**

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend Options**: 
  - Option 1: [Node.js (Express)](./README_NODEJS_BACKEND.md) (Recommended for performance)
  - Option 2: [PHP Native](./README_PHP_BACKEND.md) (Recommended for shared hosting)
- **Database**: [MySQL](https://www.mysql.com/) (Compatible with both backends)

Dibuat dengan bantuan [Google AI Studio App](https://aistudio.google.com/apps), [Google Antigravity](https://antigravity.google/), Agent model: Gemini 3 Pro dan Claude Sonnet 4.5

Fitur AI di aplikasi ini yang menggunakan Gemini API, kami belum sempat mencobanya.

> Untuk versi Cemilan KasirPOS dengan pendekatan database yang berbeda, seperti localStorage, IndexedDB-Dexie, hybrid database (IndexedDB-Dexie + MySQL), dapat dicek di laman rilis repo Cemilan KasirPOS Nusantara - Testing https://github.com/dotslashgabut/cemilan-kasirpos-test/releases

> Video tutorialnya cek aja nanti di [DotSlashGabut YouTube](https://www.youtube.com/@dotslashgabut), _belum sempet bikin_

**🍵 Traktir Kami Cendol**

> via Saweria [**https://saweria.co/dotslashgabut**](https://saweria.co/dotslashgabut)

> via Ko-fi [**https://ko-fi.com/dotslashgabut**](https://ko-fi.com/dotslashgabut)

> _Semoga sistem POS (Point of Sale) - Aplikasi Kasir ini bermanfaat bagi semuanya, terutama warung kecil dan UMKM. Terima Kasih._

## 📃 Panduan singkat instalasi dan penggunaan aplikasi Cemilan KasirPOS

Aplikasi ini dirilis dalam dua file arsip berbeda. Untuk file arsip dengan nama 'full', itu sudah termasuk node module yang diperlukan, siap pakai. Sedangkan untuk file arsip dengan nama 'test', belum termasuk node modul, file-filenya sama seperti yang ada di repository, diperlukan penginstalan modul-modulnya.

Panduan instalasi dan penggunaan untuk Development, selengkapnya bisa dibaca di **[README_DEVELOPMENT.md](./README_DEVELOPMENT.md)**, dan untuk Production bisa dibaca di **[README_PRODUCTION.md](./README_PRODUCTION.md)**

## 🍬 Cemilan KasirPOS Nusantara

Cemilan KasirPOS is a modern, feature-rich Point of Sale (POS) application designed for small to medium-sized businesses in Indonesia. Built with React, TypeScript, and Vite, it offers a fast and responsive interface for managing sales, inventory, customers, and finances.

[🇮🇩 Baca versi Bahasa Indonesia di bawah](#-bahasa-indonesia)

## 🚀 Features

### Point of Sale (POS)

- **Efficient Checkout**: Fast product selection with search and barcode support.
- **Flexible Pricing**: Support for multiple price tiers (Eceran, Umum, Grosir, Promo) per product.
- **Payment Methods**: Accept Cash, Bank Transfer, and Tempo (Credit).
- **Partial Payments**: Support for down payments and installments for credit transactions.
- **Cart Management**: Easy addition, modification, and removal of items.

### Product Management

- **Inventory Tracking**: Real-time stock monitoring with low stock alerts.
- **Product Organization**: Categorize products for easy management.
- **Barcode Generator**: Built-in tool to generate and print barcodes for products.
- **Cost Tracking**: Track HPP (Harga Pokok Penjualan) to calculate profits accurately.

### Finance & Accounting

- **Transaction History**: Detailed log of all sales and purchases.
- **Accounts Receivable (Piutang)**: Track and manage customer debts with installment history.
- **Accounts Payable (Utang)**: Manage supplier debts and purchase history.
- **Cash Flow**: Monitor incoming and outgoing operational expenses.
- **Profit & Loss**: View estimated profit and loss reports.
- **Sold Items Report**: Dedicated report for tracking sold items with export and print capabilities.
- **Returns Management**: Process sales returns and purchase returns with automatic stock adjustment.

### User & People Management

- **Role-Based Access Control**:
  - **Superadmin**: Full access to all system features.
  - **Owner**: Administrative access but restricted from critical system settings.
  - **Cashier**: Restricted access focused on sales and basic operations.
- **Customer Database**: Manage customer profiles and assign default price tiers.
- **Supplier Management**: Keep track of supplier details for purchasing.

### Settings & Customization

- **Store Profile**: Customize store name, address, contact info, and receipt footer.
- **Print Layouts**: Support for various receipt formats (58mm, 80mm, A4) for invoices and delivery notes.
- **Bank Accounts**: Manage bank accounts for transfer payments.

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend**: Node.js (Express) OR PHP Native
- **Database**: MySQL

## 💾 Data Persistence

This application uses **MySQL** as the primary database for robust data storage, scalability, and multi-device access.

### Architecture

```
┌─────────────────────────────────────────────────┐
│           React Components (UI Layer)           │
│  - Dashboard, POS, Finance, Products, etc.      │
└──────────────────┬──────────────────────────────┘
                   │ useData (Reactive Hook)
                   │
┌──────────────────▼──────────────────────────────┐
│         StorageService (Business Logic)         │
│  - Abstraction Layer                            │
│  - Handles data fetching and updates            │
└──────────────────┬──────────────────────────────┘
                   │ HTTP API Calls
                   │
┌──────────────────▼──────────────────────────────┐
│            ApiService (API Layer)               │
│  - Communicates with Backend                    │
└──────────────────┬──────────────────────────────┘
                   │ REST API
                   │
┌──────────────────▼──────────────────────────────┐
│       Backend Server (Node.js OR PHP)           │
│  - API Endpoints (server/ or php_server/)       │
│  - Express/Sequelize OR PHP Native              │
└──────────────────┬──────────────────────────────┘
                   │ SQL
                   │
┌──────────────────▼──────────────────────────────┐
│             MySQL Database                      │
│  - Persistent Storage                           │
└─────────────────────────────────────────────────┘
```

### Database Schema

The application uses the following tables:

| Table            | Primary Key | Indexes                     | Description                   |
| ---------------- | ----------- | --------------------------- | ----------------------------- |
| `products`       | `id`        | `name`, `sku`, `categoryId` | Product catalog and inventory |
| `categories`     | `id`        | `name`                      | Product categories            |
| `customers`      | `id`        | `name`, `phone`             | Customer database             |
| `suppliers`      | `id`        | `name`                      | Supplier contacts             |
| `transactions`   | `id`        | `date`, `customerId`        | Sales transactions            |
| `purchases`      | `id`        | `date`, `supplierId`        | Purchase orders               |
| `cashflow`       | `id`        | `date`, `type`              | Cash flow entries             |
| `users`          | `id`        | `username`                  | User accounts                 |
| `banks`          | `id`        | -                           | Bank accounts for transfers   |
| `store_settings` | `id`        | -                           | Application settings          |

## 📦 Installation & Development Setup

 Follow these steps to set up the project for development.

### Prerequisites

* **Node.js**: Version 18 or higher.

* **MySQL**: Ensure MySQL server is installed and running.
  
  ### 1. Database Setup
1. Create a new MySQL database (e.g., `cemilan_db`).

2. Import the schema from `cemilankasirpos.sql` (optional, as Sequelize will sync tables, but good for initial structure).
   
   ### 2. Backend Setup (Node.js)

3. Navigate to the server directory:
   
   ```bash
   cd server
   ```

4. Install dependencies:
   
   ```bash
   npm install
   ```

5. Configure Environment Variables:
   
   * Create a `.env` file in the `server/` directory.
   
   * Add the following configuration (adjust to your local setup):
     
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASS=
     DB_NAME=cemilan_db
     JWT_SECRET=your_super_secret_jwt_key_change_this
     PORT=3001
     ```

6. Start the Backend Server:
   
   ```bash
   npm start
   ```
   
   * The server will run on `http://localhost:3001`.
   * It will automatically sync the database tables.
   
   ### 3. Frontend Setup (React)

7. Open a new terminal and navigate to the project root.

8. Install dependencies:
   
   ```bash
   npm install
   ```

9. Start the Frontend Application:
   
   ```bash
   npm run dev
   ```

10. Open your browser and visit `http://localhost:5173` (or the URL shown in the terminal).

See [README_DEVELOPMENT.md](./README_DEVELOPMENT.md) for detailed setup instructions.

## 🏗️ Project Structure

```
/
├── components/   # Reusable UI components
├── pages/        # Main application pages (POS, Dashboard, Finance, etc.)
├── services/     # API and storage services
├── hooks/        # Custom React hooks (useData, etc.)
├── utils/        # Utility functions and helpers
├── server/       # Backend Node.js/Express API files
├── types.ts      # TypeScript type definitions
├── App.tsx       # Main application component
├── index.tsx     # Entry point
├── vite.config.ts
└── cemilankasirpos.sql # Database schema
```

## 👥 User Roles

- **SUPERADMIN**: Has absolute control over the system, including managing other admins.
- **OWNER**: Can manage products, view reports, and change store settings.
- **CASHIER**: Can perform sales transactions and view products but cannot modify stock or view sensitive financial data (like HPP).

### 🔒 Security Features (New)

- **Authentication**: Secure login using **JWT (JSON Web Tokens)**.
- **Password Hashing**: Passwords are encrypted using **Bcrypt** (never stored in plain text).
- **Role-Based Access Control (RBAC)**:
  - **Superadmin**: Full access, including user management and deleting data.
  - **Owner**: Full access except user management and critical system resets.
  - **Cashier**: Restricted to POS and basic sales operations.
- **Rate Limiting**: Brute-force protection on login endpoints.
- **CORS Protection**: Restricted API access to trusted domains.
- **Production Error Handling**: Detailed error messages are hidden in production to prevent information leakage.
- **Data Sanitization**: Sensitive data (like password hashes) is automatically stripped from API responses.

> For a detailed security report, see **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)**.

### Default Login Credentials

> **Note:** Upon first login, the system will automatically encrypt the default password.

- **Username**: `superadmin`
- **Password**: `password`

## 🚀 Deployment Guides

This application can be deployed in various ways:

### 📖 Available Guides:

1. **[Development Guide](./README_DEVELOPMENT.md)** - Panduan untuk setup lingkungan pengembangan (development environment) untuk aplikasi Cemilan KasirPOS menggunakan Backend Node.js (Express + Sequelize)
2. **[Production Guide](./README_PRODUCTION.md)** - Langkah-langkah persiapan sebelum build (build preparation) dan konfigurasi untuk deployment aplikasi ke server produksi (live server) menggunakan Backend Node.js
3. **[cPanel Hosting Guide](./README_CPANEL_HOSTING.md)** - Panduan deploy ke shared hosting menggunakan cPanel
4. **[Docker Deployment](./README_DOCKER.md)** - Panduan menjalankan aplikasi menggunakan Docker dan Docker Compose
5. **[Production & CORS Guide](./README_PRODUCTION.md)** - Langkah-langkah detail build dan konfigurasi CORS

## 📝 License

This application was built with the assistance of several AI LLMs, primarily the Gemini 3 Pro and Claude 4.5 Sonnet model.

---

# 🇮🇩 Bahasa Indonesia

Cemilan KasirPOS adalah aplikasi Point of Sale (POS) modern yang kaya fitur, dirancang untuk usaha kecil hingga menengah di Indonesia. Dibangun dengan React, TypeScript, dan Vite, aplikasi ini menawarkan antarmuka yang cepat dan responsif untuk mengelola penjualan, inventaris, pelanggan, dan keuangan.

## 🚀 Fitur

### Point of Sale (POS) / Kasir

- **Checkout Efisien**: Pemilihan produk cepat dengan pencarian dan dukungan barcode.
- **Harga Fleksibel**: Mendukung berbagai tingkatan harga (Eceran, Umum, Grosir, Promo) per produk.
- **Metode Pembayaran**: Menerima Tunai, Transfer Bank, dan Tempo (Kredit).
- **Pembayaran Parsial**: Dukungan untuk uang muka (DP) dan cicilan untuk transaksi kredit.
- **Manajemen Keranjang**: Penambahan, pengubahan, dan penghapusan item dengan mudah.

### Manajemen Produk

- **Pelacakan Inventaris**: Pemantauan stok real-time dengan peringatan stok rendah.
- **Organisasi Produk**: Kategorisasi produk untuk pengelolaan yang mudah.
- **Generator Barcode**: Alat bawaan untuk membuat dan mencetak barcode produk.
- **Pelacakan Biaya**: Melacak HPP (Harga Pokok Penjualan) untuk menghitung keuntungan secara akurat.

### Keuangan & Akuntansi

- **Riwayat Transaksi**: Log rinci semua penjualan dan pembelian.
- **Piutang Pelanggan**: Lacak dan kelola hutang pelanggan dengan riwayat cicilan.
- **Utang Supplier**: Kelola hutang ke pemasok dan riwayat pembelian.
- **Arus Kas**: Pantau pengeluaran operasional masuk dan keluar.
- **Laba Rugi**: Lihat laporan perkiraan laba dan rugi.
- **Laporan Barang Terjual**: Laporan khusus untuk melacak barang terjual dengan fitur ekspor dan cetak.
- **Manajemen Retur**: Proses retur penjualan dan retur pembelian dengan penyesuaian stok otomatis.

### 🔒 Fitur Keamanan (Baru)

- **Autentikasi**: Login aman menggunakan **JWT (JSON Web Tokens)**.
- **Enkripsi Password**: Password dienkripsi menggunakan **Bcrypt** (tidak disimpan sebagai teks biasa).
- **Kontrol Akses Berbasis Peran (RBAC)**:
  - **Superadmin**: Akses penuh, termasuk manajemen user dan hapus data.
  - **Owner**: Akses penuh kecuali manajemen user dan reset sistem kritis.
  - **Cashier**: Terbatas pada POS dan operasi penjualan dasar.
- **Rate Limiting**: Perlindungan brute-force pada login.
- **Proteksi CORS**: Akses API dibatasi hanya untuk domain terpercaya.
- **Penanganan Error Produksi**: Pesan error detail disembunyikan di mode produksi untuk mencegah kebocoran informasi.
- **Sanitasi Data**: Data sensitif (seperti hash password) otomatis dihapus dari respon API.

> Untuk laporan keamanan detail, lihat **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)**.

### Manajemen Pengguna & Orang

- **Database Pelanggan**: Kelola profil pelanggan dan tetapkan tingkatan harga default.
- **Manajemen Supplier**: Simpan detail pemasok untuk pembelian.

### Pengaturan & Kustomisasi

- **Profil Toko**: Sesuaikan nama toko, alamat, info kontak, dan footer struk.
- **Layout Cetak**: Dukungan untuk berbagai format struk (58mm, 80mm, A4) untuk faktur dan surat jalan.
- **Akun Bank**: Kelola akun bank untuk pembayaran transfer.

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Grafik**: [Recharts](https://recharts.org/)
- **Backend**: Node.js (Express) ATAU PHP Native
- **Database**: MySQL

## 💾 Penyimpanan Data

Aplikasi ini menggunakan **MySQL** sebagai database utama untuk penyimpanan data yang handal, skalabilitas, dan akses multi-perangkat.

### Arsitektur

```
┌─────────────────────────────────────────────────┐
│           Komponen React (Lapisan UI)           │
│  - Dashboard, POS, Finance, Products, dll.      │
└──────────────────┬──────────────────────────────┘
                   │ useData (Hook Reaktif)
                   │
┌──────────────────▼──────────────────────────────┐
│      StorageService (Logika Bisnis)             │
│  - Lapisan Abstraksi                            │
│  - Menangani pengambilan dan pembaruan data     │
└──────────────────┬──────────────────────────────┘
                   │ Panggilan HTTP API
                   │
┌──────────────────▼──────────────────────────────┐
│            ApiService (Lapisan API)             │
│  - Berkomunikasi dengan Backend                 │
└──────────────────┬──────────────────────────────┘
                   │ REST API
                   │
┌──────────────────▼──────────────────────────────┐
│           Backend Server (Node.js)              │
│  - Endpoint API (server/)                       │
│  - Express & Sequelize                          │
└──────────────────┬──────────────────────────────┘
                   │ SQL
                   │
┌──────────────────▼──────────────────────────────┐
│             Database MySQL                      │
│  - Penyimpanan Persisten                        │
└─────────────────────────────────────────────────┘
```

## 📦 Instalasi

1. **Clone repositori** (jika ada) atau navigasikan ke direktori proyek.

2. **Install Dependensi Frontend**:
   
   ```bash
   npm install
   ```

3. **Install Dependensi Backend**:
   
   ```bash
   cd server
   npm install
   cd ..
   ```

## ▶️ Menjalankan Aplikasi

Untuk memulai lingkungan pengembangan:

1. **Jalankan Server Backend**:
   
   * Pastikan server MySQL Anda berjalan.
   
   * Masuk ke direktori server:
     
     ```bash
     cd server
     ```
   
   * Jalankan server:
     
     ```bash
     npm start
     ```
   
   * Server akan berjalan di `http://localhost:3001`.

2. **Jalankan Aplikasi Frontend** (Di terminal baru):
   
   ```bash
   npm run dev
   ```

Aplikasi akan tersedia di `http://localhost:5173`.

## 🚀 Panduan Deployment

Aplikasi ini dapat di-deploy dengan berbagai cara:

### 📖 Panduan yang Tersedia:

1. **[Development Guide](./README_DEVELOPMENT.md)** - Panduan untuk setup lingkungan pengembangan (development environment) untuk aplikasi Cemilan KasirPOS menggunakan Backend Node.js (Express + Sequelize)
2. **[Production Guide](./README_PRODUCTION.md)** - Langkah-langkah persiapan sebelum build (build preparation) dan konfigurasi untuk deployment aplikasi ke server produksi (live server) menggunakan Backend Node.js
3. **[Panduan Hosting cPanel](./README_CPANEL_HOSTING.md)** - Deploy ke shared hosting dengan cPanel
4. **[Deployment Docker](./README_DOCKER.md)** - Jalankan dengan Docker dan Docker Compose
5. **[Production & CORS Guide](./README_PRODUCTION.md)** - Detil build dan tahap konfigurasi CORS

## 📝 Lisensi

Aplikasi ini dibuat dengan bantuan beberapa AI LLM, terutama model Gemini 3 Pro dan Claude 4.5 Sonnet.
