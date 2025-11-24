# Cemilan KasirPOS Nusantara

![Static Badge](https://img.shields.io/badge/build-ERROR-red?style=for-the-badge)

> Untuk perubahan terbaru bisa dicek di repo **Cemilan-KasirPOS-test** https://github.com/dotslashgabut/Cemilan-KasirPOS-test (Frontend: React, Backend: Node.js)

**🍬 Cemilan KasirPOS Nusantara**

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend**: [PHP (Native)](https://www.php.net/)
- **Database**: [MySQL (Sequelize ORM)](https://www.mysql.com/)

Dibuat dengan bantuan [Google AI Studio App](https://aistudio.google.com/apps), [Google Antigravity](https://antigravity.google/), Agent model: Gemini 3 Pro dan Claude Sonnet 4.5

> Untuk versi lainnya dengan pendekatan database yang berbeda, seperti localStorage, IndexedDB-Dexie, hybrid database (IndexedDB-Dexie + MySQL), dapat dicek di laman rilis repo Cemilan KasirPOS Nusantara - Testing https://github.com/dotslashgabut/cemilan-kasirpos-test/releases

> Video tutorialnya cek aja nanti di [DotSlashGabut YouTube](https://www.youtube.com/@dotslashgabut), _belum sempet bikin_

**🍵 Traktir Kami Cendol**

> via Saweria [**https://saweria.co/dotslashgabut**](https://saweria.co/dotslashgabut)

> via Ko-fi [**https://ko-fi.com/dotslashgabut**](https://ko-fi.com/dotslashgabut)

> _Semoga sistem POS (Point of Sale) - Aplikasi Kasir ini bermanfaat bagi semuanya, terutama warung kecil dan UMKM. Terima Kasih._

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
- **Backend**: PHP (Native)
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
│            Backend Server (PHP)                 │
│  - API Endpoints (php_server/)                  │
│  - Database Logic                               │
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

## 📦 Installation

1. **Clone the repository** (if applicable) or navigate to the project directory.

2. **Install dependencies**:
   
   ```bash
   npm install
   ```

## ▶️ Running the Application

To start the development environment:

1. **Start the Backend Server**:
   
   * Ensure your MySQL server is running.
   
   * You can use a tool like Laragon, XAMPP, or the PHP built-in server.
   
   * **Using PHP built-in server**:
     
     ```bash
     cd php_server
     php -S localhost:3001
     ```

2. **Start the Frontend Application** (In a new terminal):
   
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

See [README_DEVELOPMENT.md](./README_DEVELOPMENT.md) for detailed setup instructions.

## 🏗️ Project Structure

```
/
├── components/   # Reusable UI components
├── pages/        # Main application pages (POS, Dashboard, Finance, etc.)
├── services/     # API and storage services
├── hooks/        # Custom React hooks (useData, etc.)
├── utils/        # Utility functions and helpers
├── php_server/   # Backend PHP API files
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

### Default Login Credentials

> **Note:** Upon first login, the system will automatically encrypt the default password.

- **Username**: `superadmin`
- **Password**: `password`

## 🚀 Deployment Guides

This application can be deployed in various ways:

### 📖 Available Guides:

1. **[Development Guide](./README_DEVELOPMENT.md)** - Development guide and software installation
2. **[cPanel Hosting Guide](./README_CPANEL_HOSTING.md)** - Deploy to shared hosting with cPanel
3. **[Docker Deployment](./README_DOCKER.md)** - Run with Docker and Docker Compose
4. **[Production & CORS Guide](./README_PRODUCTION.md)** - Detailed build and CORS configuration steps

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
- **Backend**: PHP (Native)
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
│           Backend Server (PHP)                  │
│  - Endpoint API (php_server/)                   │
│  - Logika Database                              │
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

2. **Install dependensi**:
   
   ```bash
   npm install
   ```

## ▶️ Menjalankan Aplikasi

Untuk memulai lingkungan pengembangan:

1. **Jalankan Server Backend**:
   
   * Pastikan server MySQL Anda berjalan.
   
   * Anda bisa menggunakan tools seperti Laragon, XAMPP, atau PHP built-in server.
   
   * **Menggunakan PHP built-in server**:
     
     ```bash
     cd php_server
     php -S localhost:3001
     ```

2. **Jalankan Aplikasi Frontend** (Di terminal baru):
   
   ```bash
   npm run dev
   ```

Aplikasi akan tersedia di `http://localhost:3000`.

## 🚀 Panduan Deployment

Aplikasi ini dapat di-deploy dengan berbagai cara:

### 📖 Panduan yang Tersedia:

1. **[Development Guide](./README_DEVELOPMENT.md)** - Panduan pengembangan dan instalasi perangkat lunak
2. **[Panduan Hosting cPanel](./README_CPANEL_HOSTING.md)** - Deploy ke shared hosting dengan cPanel
3. **[Deployment Docker](./README_DOCKER.md)** - Jalankan dengan Docker dan Docker Compose
4. **[Production & CORS Guide](./README_PRODUCTION.md)** - Detil build dan tahap configurasi CORS

## 📝 Lisensi

Aplikasi ini dibuat dengan bantuan beberapa AI LLM, terutama model Gemini 3 Pro dan Claude 4.5 Sonnet.
