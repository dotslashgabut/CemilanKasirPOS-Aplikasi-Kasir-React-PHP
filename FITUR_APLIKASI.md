# 📋 Detail Fitur Aplikasi Cemilan KasirPOS Nusantara

## 🗂️ Daftar Isi

1. [Ikhtisar Aplikasi](#ikhtisar-aplikasi)
2. [Fitur Autentikasi & Keamanan](#fitur-autentikasi--keamanan)
3. [Fitur Point of Sale (POS)](#fitur-point-of-sale-pos)
4. [Fitur Manajemen Produk](#fitur-manajemen-produk)
5. [Fitur Keuangan & Akuntansi](#fitur-keuangan--akuntansi)
6. [Fitur Manajemen Customer & Supplier](#fitur-manajemen-customer--supplier)
7. [Fitur Dashboard & Pelaporan](#fitur-dashboard--pelaporan)
8. [Fitur Pengaturan (Settings)](#fitur-pengaturan-settings)
9. [Fitur Tambahan](#fitur-tambahan)

---

## Ikhtisar Aplikasi

**Cemilan KasirPOS Nusantara** adalah aplikasi Point of Sale (POS) yang dirancang khusus untuk usaha kecil dan menengah (UMKM) di Indonesia. Aplikasi ini menawarkan solusi lengkap untuk mengelola penjualan, inventaris, keuangan, dan pelanggan dengan antarmuka yang modern dan mudah digunakan.

### Teknologi yang Digunakan

- **Frontend**: React 19 dengan TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (dengan animasi custom fade-in)
- **Backend**: PHP Native
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt untuk enkripsi password

---

## Fitur Autentikasi & Keamanan

### 1. Sistem Login

- **Username & Password**: Login menggunakan kredensial terenkripsi
- **JWT Authentication**: Token berbasis JWT untuk session management
- **Password Hashing**: Semua password dienkripsi menggunakan Bcrypt
- **Default Credentials**:
  - Username: `superadmin`
  - Password: `password` (otomatis terenkripsi saat pertama login)

### 2. Role-Based Access Control (RBAC)

Aplikasi mendukung 3 level pengguna dengan akses berbeda:

#### **SUPERADMIN**

- Akses penuh ke semua fitur sistem
- Dapat mengelola user lain (tambah, edit, hapus)
- Dapat menghapus data transaksi dan pembelian
- Dapat mengubah pengaturan sistem kritis
- Dapat melihat semua data keuangan termasuk HPP (Harga Pokok Penjualan)

#### **OWNER**

- Akses penuh kecuali manajemen user
- Dapat melihat semua laporan keuangan
- Dapat mengelola produk, customer, dan supplier
- Dapat melihat HPP dan laporan laba rugi
- Tidak dapat menghapus user atau reset sistem

#### **CASHIER**

- Akses terbatas untuk operasional harian
- Dapat melakukan transaksi penjualan
- Dapat melihat produk dan stok
- **Tidak dapat** melihat HPP
- **Tidak dapat** melihat data keuangan dari kasir lain
- **Tidak dapat** mengubah harga atau stok produk
- **Tidak dapat** mengubah harga atau stok produk
- Hanya dapat melihat transaksi, pembelian, dan arus kas yang dibuat sendiri (Data Isolation)

### 3. Fitur Keamanan Tambahan (Updated Security Audit 2026)

- **Advanced Rate Limiting**: Proteksi brute-force menggunakan mekanisme **File Locking** untuk mencegah race condition.
- **CORS Strict Mode**: Konfigurasi Cross-Origin Resource Sharing yang lebih ketat dengan validasi Origin.
- **HttpOnly Cookies**: Opsi penyimpanan token di cookie HttpOnly untuk mitigasi XSS penuh.
- **HSTS (HTTP Strict Transport Security)**: Otomatis memaksa koneksi HTTPS saat terdeteksi untuk mencegah downgrade attacks.
- **Content Security Policy (CSP)**: Header CSP ketat untuk mengontrol sumber resource yang diizinkan.
- **Input Sanitization Layer**: Validasi input berlapis (Strip Tags, Parameter Binding, Schema Filter).
- **Secure Headers**: Implementasi standard security headers (X-Frame-Options, X-Content-Type-Options).

### 4. Default User

Default user untuk `cemilankasirpos_php_v02.sql`

```
SUPERADMIN:
- Username: superadmin
- Password: password
- Role: SUPERADMIN

OWNER:
- Username: admin
- Password: admin
- Role: OWNER

OWNER:
- Username: owner
- Password: owner
- Role: OWNER

CASHIER:
- Username: kasir1
- Password: kasir1
- Role: CASHIER

CASHIER:
- Username: kasir2
- Password: kasir2
- Role: CASHIER

CASHIER:
- Username: kasir3
- Password: kasir3
- Role: CASHIER

OWNER:
- Username: manager
- Password: manager
- Role: OWNER

CASHIER:
- Username: kasir_pagi
- Password: kasir_pagi
- Role: CASHIER

CASHIER:
- Username: kasir_siang
- Password: kasir_siang
- Role: CASHIER

CASHIER:
- Username: kasir_malam
- Password: kasir_malam
- Role: CASHIER

OWNER:
- Username: admin_gudang
- Password: admin_gudang
- Role: CASHIER
```

---

## Fitur Point of Sale (POS)

### 1. Kasir/Checkout

**Halaman utama untuk melakukan transaksi penjualan**

#### Pencarian Produk

- **Search by Name**: Cari produk berdasarkan nama
- **Clear Search**: Tombol 'x' untuk menghapus pencarian dengan cepat
- **Barcode Scanner**: Input barcode untuk pencarian cepat
- **Autocomplete**: Saran produk otomatis saat mengetik
- **Filter Kategori**: Filter produk berdasarkan kategori

#### Keranjang Belanja

- **Tambah Produk**: Tambah produk ke keranjang dengan qty
- **Edit Qty**: Ubah jumlah item langsung dari keranjang
- **Validasi Stok**:
  - **Plus Button**: Tombol plus (+) otomatis berhenti saat mencapai batas stok tersedia
  - **Manual Input**: Input manual divalidasi (maks 4 digit), menampilkan peringatan "jumlah melebihi stok" jika melebihi ketersediaan
- **Hapus Item**: Hapus item dari keranjang
- **Clear Cart**: Kosongkan seluruh keranjang
- **Real-time Total**: Hitung total otomatis saat ada perubahan

#### Sistem Harga Fleksibel

Setiap produk mendukung 4 tingkatan harga:

- **Eceran**: Harga retail/eceran (paling tinggi)
- **Umum**: Harga standar untuk pelanggan umum
- **Grosir**: Harga grosir/wholesale (paling rendah)
- **Promo**: Harga promosi khusus (opsional)

**Fitur Auto-pricing**:

- Harga otomatis disesuaikan jika customer dipilih
- Customer dengan `defaultPriceType` akan mendapat harga sesuai tier mereka
- Kasir dapat override/mengubah harga per item jika diperlukan

#### Metode Pembayaran

1. **Tunai (CASH)**
   
   - Input jumlah bayar
   - Hitung kembalian otomatis
   - Validasi jumlah bayar minimal sama dengan total

2. **Transfer Bank (TRANSFER)**
   
   - Pilih rekening bank/e-wallet tujuan
   - Snapshot nama bank dan nomor rekening
   - Otomatis dicatat di cash flow dengan detail bank

3. **Tempo/Kredit (TEMPO)**
   
   - Catat sebagai piutang pelanggan
   - Support pembayaran sebagian (DP)
   - **Validasi**: Jumlah pembayaran tidak boleh melebihi total tagihan/harga item
   - Cicilan dapat dilacak di riwayat transaksi

#### Data Customer

- **Customer Terdaftar**: Pilih dari database customer
- **Customer Manual**: Input nama manual untuk customer tidak terdaftar
- **History**: Lihat riwayat transaksi customer

#### Informasi Kasir

- Nama kasir otomatis tercatat
- Track siapa yang melakukan transaksi
- Filter data keuangan per kasir (untuk role CASHIER)

### 2. Cetak Struk

- **Format Fleksibel**: Support 58mm, 80mm, dan A4
- **Customizable Content**:
  - Logo/nama toko
  - Alamat dan kontak
  - Detail item dan harga
  - Total dan pembayaran
  - Catatan retur (jika ada)
  - Footer/jargon toko
  - Pesan terima kasih
- **Print Preview**: Lihat preview sebelum cetak
- **Export PDF**: Simpan struk sebagai PDF

---

## Fitur Manajemen Produk

### 1. Daftar Produk

**Kelola semua produk secara terpusat**

#### Informasi Produk

- **Nama Produk**: Nama item
- **SKU**: Stock Keeping Unit / Kode Produk
- **Kategori**: Kategori produk untuk organisasi
- **Stok**: Jumlah stok tersedia
- **HPP**: Harga Pokok Penjualan (cost price)
- **4 Tingkat Harga**: Eceran, Umum, Grosir, Promo
- **Gambar Produk**: Upload foto produk (Base64)

#### Operasi CRUD

- **Tambah Produk**: Form lengkap untuk produk baru
- **Edit Produk**: Update informasi produk
- **Hapus Produk**: Hapus produk dari database
- **Pencarian**: Cari produk by nama/SKU
- **Filter**: Filter berdasarkan kategori

#### Monitoring Stok

- **Real-time Stock**: Stok terupdate otomatis setelah transaksi
- **Low Stock Alert**: Peringatan produk dengan stok rendah
- **Stock Adjustment**: Auto-adjustment saat transaksi/pembelian/retur

### 2. Kategori Produk

- **Tambah Kategori**: Buat kategori baru
- **Edit/Hapus**: Kelola kategori yang ada
- **Assign Products**: Kategorisasi produk

### 3. Barcode Generator

**Tool untuk generate dan cetak barcode produk**

#### Fitur Barcode

- **Auto-generate Barcode**: Buat barcode dari SKU produk
- **Batch Printing**: Cetak barcode untuk multiple produk
- **Custom Layout**: Atur layout label barcode
- **Preview**: Lihat preview sebelum cetak
- **Format**: Support berbagai format barcode (Code128, EAN13, dll)

### 4. Tracking HPP & Profit

- **HPP per Produk**: Catat cost price untuk setiap produk
- **Margin Calculation**: Hitung margin keuntungan otomatis
- **Profit Estimation**: Estimasi laba per transaksi/produk
- **Hide HPP for Cashier**: HPP hanya visible untuk OWNER dan SUPERADMIN

### 5. Stock Opname (Real Stock Check)
**Fitur untuk penyesuaian stok fisik dan sistem**

*   **Real-time Adjustment**: Sesuaikan stok saat melakukan audit fisik.
*   **Tracking Difference**: Mencatat selisih stok (kurang/lebih).
*   **Reasoning**: Wajib menyertakan alasan penyesuaian (Misal: Barang rusak, hilang, atau salah hitung).
*   **History Log**: Riwayat penyesuaian stok tercatat di tabel `stock_adjustments` dengan info user yang melakukan.

---

## Fitur Keuangan & Akuntansi

### 2. Riwayat Transaksi

**Pencatatan lengkap semua transaksi penjualan**

#### Data yang Tercatat

- ID Transaksi
- Tanggal dan waktu
- Tipe transaksi (SALE/RETURN)
- Customer name
- Item yang dibeli (detail lengkap)
- Total amount
- Amount paid
- Kembalian
- Status pembayaran (LUNAS/BELUM LUNAS/SEBAGIAN)
- Metode pembayaran
- Bank account (jika transfer)
- Nama kasir
- Status retur: "(Ada Retur)" jika ada
- Catatan retur: Alasan/kondisi barang saat retur
- Keterangan: Deskripsi tambahan transaksi

#### Fitur

- **Detail Transaksi**: Lihat detail lengkap per transaksi
- **Payment History**: Track cicilan/pembayaran tempo
- **Return Transaction**: Link ke transaksi retur jika ada
- **Refund Method**: Pilihan metode pengembalian dana saat retur
- **Return Notes**: Lihat catatan alasan retur di detail
- **Filter by Date**: Filter transaksi berdasarkan periode
- **Filter by Cashier**: Filter berdasarkan kasir (untuk CASHIER role)
- **Search**: Cari transaksi by ID/customer
- **Export**: Ekspor ke CSV/Excel (Kolom 'Kembalian' dan 'Piutang' dipisah untuk kejelasan)
- **Print**: Cetak laporan transaksi

#### Smart Delete / Safe Delete (New)

Fitur penghapusan transaksi yang cerdas dan aman untuk menjaga integritas data:

*   **Cascade Delete**: Menghapus transaksi penjualan otomatis menghapus semua transaksi retur terkait.
*   **Stock Reversion**: Stok produk otomatis dikembalikan (ditambah kembali) saat transaksi penjualan dihapus.
*   **Cash Flow Cleanup**: Data arus kas terkait otomatis dihapus.
*   **Debt Restoration**: Jika menghapus transaksi retur potong utang, saldo hutang pada transaksi asli otomatis dikembalikan.

#### Pembayaran Cicilan

- **Add Payment**: Tambah pembayaran untuk transaksi tempo
- **Payment History**: Riwayat semua cicilan
- **Auto Update Status**: Status otomatis update saat lunas
- **Remaining Balance**: Sisa hutang yang harus dibayar


### 3. Riwayat Pembelian (Purchases)

**Pencatatan pembelian stok dari supplier**

#### Data yang Tercatat

- ID Pembelian
- Tanggal
- Supplier name
- Deskripsi/item yang dibeli
- Detail items (jika itemized)
- Total amount
- Amount paid
- Status pembayaran
- Metode pembayaran
- Bank account (jika transfer)
- User yang input
- Status retur: "(Ada Retur)" jika ada
- Catatan retur: Alasan/kondisi barang saat retur ke supplier

#### Fitur

- **Create Purchase**: Input pembelian baru dengan validasi pembayaran (tidak boleh melebihi total belanja)
- **Itemized Purchase**: Support detail item (opsional), rincian barang tampil di deskripsi web/export/print
- **Print Purchase Order**: Cetak bukti pemesanan pembelian
- **Text Description**: Atau cukup deskripsi text
- **Payment Tracking**: Track pembayaran hutang supplier
- **Return Purchase**: Proses retur pembelian (Otomatis potong hutang jika ada)
- **Return Notes**: Lihat catatan alasan retur di detail
- **Filter & Search**: Filter by date, supplier, dll
- **Export & Print**: Ekspor dan cetak laporan
- **User Tracking**: Catat siapa yang input pembelian
- **Filter by User**: Filter berdasarkan user (untuk CASHIER)

#### Smart Delete / Safe Delete (New)

Fitur penghapusan pembelian yang aman:

*   **Cascade Delete**: Menghapus pembelian otomatis menghapus semua retur terkait.
*   **Stock Reversion**: Stok produk otomatis dikurangi kembali saat pembelian dihapus.
*   **Cash Flow Cleanup**: Data arus kas keluar (pembelian) atau masuk (retur) otomatis dihapus.
*   **Debt Restoration**: Jika menghapus retur yang memotong hutang, saldo hutang pembelian asli otomatis dikembalikan.

### 3. Piutang Pelanggan (Accounts Receivable)

**Kelola hutang pelanggan dari transaksi tempo**

#### Monitoring

- **Total Piutang**: Total semua piutang outstanding
- **Piutang per Customer**: Daftar hutang per pelanggan
- **Aging Report**: Umur piutang (berapa lama menunggak)
- **Payment Status**: Status lunas/belum lunas

#### Pengelolaan

- **Add Payment**: Terima pembayaran cicilan
- **Full Payment**: Lunasi piutang sekaligus (dengan konfirmasi pop-up untuk mencegah kesalahan)
- **Payment History**: Riwayat pembayaran per customer
- **Reminder**: Info customer yang belum bayar

### 4. Utang Supplier (Accounts Payable)

**Kelola hutang ke supplier dari pembelian**

#### Monitoring

- **Total Utang**: Total semua utang outstanding
- **Utang per Supplier**: Daftar hutang per supplier
- **Payment Due**: Info jatuh tempo pembayaran

#### Pengelolaan

- **Add Payment**: Bayar cicilan ke supplier
- **Full Payment**: Lunasi utang sekaligus (dengan konfirmasi pop-up untuk mencegah kesalahan)
- **Payment History**: Track semua pembayaran

### 5. Arus Kas (Cash Flow)

**Monitor pemasukan dan pengeluaran operasional**

#### Tipe Cash Flow

1. **MASUK (Inflow)**
   
   - Penjualan (auto-generated dari transaksi)
   - Refund retur pembelian
   - Manual entry (pendapatan lain)

2. **KELUAR (Outflow)**
   
   - Pembelian stok (auto-generated)
   - Refund retur penjualan
   - Manual entry (biaya operasional)

#### Auto-generated Cash Flow

- **Dari Transaksi Penjualan**: Otomatis catat cash in
- **Dari Pembelian**: Otomatis catat cash out
- **Dari Retur**: Otomatis catat refund
- **Bank Info**: Jika transfer, nomor rekening ditambahkan ke deskripsi

#### Manual Cash Flow

- **Input Manual**: Tambah cash flow manual
- **Kategori Custom**: Buat kategori (Operasional, Modal, dll)
- **Deskripsi**: Catat detail pengeluaran/pemasukan
- **Payment Method**: Pilih metode (Cash/Transfer)
- **Bank Selection**: Jika transfer, pilih bank account
- **Delete Manual Entry**: Hapus entry manual (auto-generated tidak bisa dihapus)
- **User Tracking**: Catat siapa yang input

#### Filter & Laporan

- **Filter by Date**: Filter berdasarkan periode
- **Filter by Type**: Filter masuk/keluar
- **Filter by Category**: Filter by kategori
- **Filter by User**: Filter by user yang input (untuk CASHIER)
- **Improved Filter**: Filter "Transfer" mencakup pembayaran parsial dari transaksi tempo
- **Export & Print**: Ekspor data cash flow

### 6. Laporan Laba Rugi (Profit & Loss)

**Estimasi laba bersih dari operasional**

#### Kalkulasi

- **Total Penjualan**: Total revenue dari penjualan
- **HPP Total**: Total cost of goods sold
- **Gross Profit**: Penjualan - HPP
- **Operational Expenses**: Biaya operasional dari cash flow
- **Net Profit**: Gross profit - expenses

#### Fitur

- **Period Selection**: Pilih periode laporan (hari/bulan/tahun)
- **Breakdown**: Detail per kategori
- **Chart Visualization**: Grafik laba rugi
- **Export**: Export laporan

### 7. Laporan Barang Terjual (Sold Items Report)

**Laporan khusus barang yang terjual**

#### Data yang Ditampilkan

- Nama produk
- SKU
- Kategori
- Qty terjual
- Total terjual (setelah dikurangi retur)
- Total revenue
- HPP total
- Gross profit per item

#### Fitur

- **Filter by Date**: Filter periode
- **Sort**: Urutkan by qty/revenue/profit
- **Net Calculation**: Qty terjual sudah dikurangi retur
- **Export CSV/Excel**: Ekspor laporan
- **Print**: Cetak laporan

### 8. Manajemen Retur (Returns Management)

**Proses retur penjualan dan pembelian**

#### Retur Penjualan (Sales Return)

- **Select Original Transaction**: Pilih transaksi asal
- **Return Items**: Pilih item yang diretur
- **Qty Return**: Tentukan jumlah retur
- **Refund Amount**: Hitung refund otomatis
- **Stock Adjustment**: Stock otomatis bertambah
- **Cash Flow Entry**: Auto-generate cash flow keluar (refund)
- **Link to Original**: Retur linked ke transaksi original
- **Flag Original**: Transaksi original ditandai "(Ada Retur)"
- **Return Note**: Input catatan alasan retur (mis: barang rusak)

#### Retur Pembelian (Purchase Return)

- **Select Original Purchase**: Pilih pembelian asal
- **Return Items**: Pilih item yang diretur ke supplier
- **Qty Return**: Tentukan jumlah retur
- **Refund Expected**: Catat refund dari supplier
- **Debt Adjustment**: Otomatis mengurangi hutang jika pembelian belum lunas
- **Stock Adjustment**: Stock otomatis berkurang
- **Cash Flow Entry**: Auto-generate cash flow masuk (refund)
- **Link to Original**: Retur linked ke pembelian original
- **Flag Original**: Pembelian original ditandai "(Ada Retur)"
- **Return Note**: Input catatan alasan retur ke supplier

#### Riwayat Retur

- **Transaction Returns**: Lihat semua retur penjualan
- **Purchase Returns**: Lihat semua retur pembelian
- **Link Navigation**: Klik untuk lihat transaksi/pembelian induk
- **Detail Items**: Lihat detail item yang diretur
- **Search Item**: Pencarian pada kolom 'Barang Diretur'
- **View Notes**: Lihat catatan alasan retur di detail riwayat

### 9. Cicilan/Installments Tracking

**Pelacakan pembayaran cicilan**

#### Untuk Piutang (Receivables)

- **Add Installment**: Tambah pembayaran cicilan dari customer
- **Payment Date**: Catat tanggal pembayaran
- **Amount**: Jumlah yang dibayar
- **Method**: Metode pembayaran (Cash/Transfer)
- **Bank**: Detail bank jika transfer
- **Note**: Catatan pembayaran
- **Auto Update**: Status transaksi auto-update

#### Untuk Utang (Payables)

- **Pay Installment**: Bayar cicilan ke supplier
- **Track Balance**: Sisa utang yang harus dibayar
- **Payment History**: Riwayat semua pembayaran
- **Auto Update**: Status pembelian auto-update

#### Laporan Cicilan

- **All Installments**: Lihat semua cicilan (piutang + utang)
- **Due Payments**: Pembayaran yang jatuh tempo
- **Filter by Customer/Supplier**: Filter by pihak
- **Filter by Date**: Filter by periode

### 10. Riwayat Transfer (Transfer History)

**Pencatatan riwayat transfer masuk dan keluar**

#### Data yang Ditampilkan

- ID/Ref Transaksi
- Tanggal
- Tipe (Masuk/Keluar)
- Bank/E-Wallet (Nama & Nomor Rekening)
- Jumlah
- Keterangan

#### Fitur

- **Search**: Cari berdasarkan ID atau keterangan
- **Filter Date**: Filter berdasarkan periode tanggal
- **Export**: Dukungan ekspor ke CSV, Excel, dan Print
- **Bank Detail**: Menampilkan detail akun bank (Nama & No. Rek)

---

## Fitur Manajemen Customer & Supplier

### 1. Database Pelanggan (Customers)

**Kelola data pelanggan**

#### Informasi Customer

- **Nama**: Nama lengkap customer
- **Nomor Telepon**: Kontak customer
- **Alamat**: Alamat lengkap (opsional)
- **Foto**: Upload foto customer (Base64)
- **Default Price Type**: Set tier harga default
  - Eceran
  - Umum
  - Grosir
  - Promo

#### Fitur

- **Add Customer**: Tambah customer baru
- **Edit Customer**: Update data customer
- **Delete Customer**: Hapus customer
- **Search**: Cari customer by nama/telepon
- **Transaction History**: Lihat riwayat transaksi per customer
- **Debt Summary**: Total piutang per customer
- **Export & Print**: Ekspor daftar customer

#### Auto-pricing di POS

- Saat customer dipilih di POS, harga otomatis sesuai `defaultPriceType` mereka
- Mis: Customer grosir otomatis dapat harga grosir

### 2. Riwayat Pelanggan (Customer History)

**Lihat semua transaksi per customer**

#### Data yang Ditampilkan

- Semua transaksi customer
- Total pembelian kumulatif
- Total piutang
- Status pembayaran
- Transaction details
- Return history (jika ada)
- Return notes (catatan retur) pada detail modal

#### Fitur

- **Transaction Details**: Klik untuk detail transaksi
- **Show Returns**: Lihat retur dalam detail transaksi
- **Payment Tracking**: Track pembayaran cicilan
- **Period Filter**: Filter by periode waktu
- **Export**: Export history customer (Kolom 'Sisa' dipisah menjadi 'Piutang' dan 'Kembalian')

### 3. Database Supplier

**Kelola data pemasok**

#### Informasi Supplier

- **Nama**: Nama supplier/pemasok
- **Nomor Telepon**: Kontak supplier
- **Alamat**: Alamat supplier (opsional)
- **Foto**: Upload foto/logo supplier (Base64)

#### Fitur

- **Add Supplier**: Tambah supplier baru
- **Edit Supplier**: Update data supplier
- **Delete Supplier**: Hapus supplier
- **Search**: Cari supplier by nama
- **Purchase History**: Riwayat pembelian dari supplier
- **Debt Summary**: Total utang ke supplier
- **Export & Print**: Ekspor daftar supplier

### 4. Riwayat Supplier (Supplier History)

**Lihat semua pembelian dari supplier**

#### Data yang Ditampilkan

- Semua pembelian dari supplier
- Total pembelian kumulatif
- Total utang
- Status pembayaran
- Purchase details
- Return history (jika ada)
- Return notes (catatan retur) pada detail modal

#### Fitur

- **Purchase Details**: Detail pembelian
- **Show Purchase Returns**: Lihat retur dalam detail
- **Payment Tracking**: Track pembayaran utang
- **Period Filter**: Filter by periode
- **Export**: Export history supplier

---

## Fitur Dashboard & Pelaporan

### 1. Dashboard Overview

**Ringkasan bisnis real-time**

#### Kartu Statistik (Stats Cards)

1. **Total Penjualan Hari Ini**
   
   - Total revenue penjualan hari ini
   - Perbandingan dengan hari kemarin
   - Trend chart

2. **Jumlah Transaksi Hari Ini**
   
   - Total transaksi completed
   - Average transaction value
   - Peak hours

3. **Total Piutang**
   
   - Total outstanding receivables
   - Jumlah customer dengan hutang
   - Aging summary

4. **Item Terjual Hari Ini**
   
   - Total item terjual (nett setelah retur)
   - Top selling items
   - Stock alerts

5. **Stok Rendah**
   
   - Jumlah produk dengan stok rendah
   - Daftar produk yang perlu restock
   - Alert threshold

#### Grafik & Visualisasi

- **Sales Chart**: Grafik penjualan harian/mingguan/bulanan
- **Revenue Chart**: Tren revenue
- **Category Performance**: Performa per kategori
- **Top Products**: Produk terlaris
- **Cash Flow Chart**: Visualisasi arus kas

#### Quick Actions

- **Transaksi Baru**: Shortcut ke POS
- **Tambah Produk**: Quick add product
- **Input Pembelian**: Quick add purchase
- **Input Cash Flow**: Manual cash flow entry

### 2. Sistem Pelaporan

#### Format Export

- **CSV**: Untuk analisis di spreadsheet
- **Excel (XLSX)**: Format Excel dengan formatting
- **PDF**: Untuk dokumentasi

#### Jenis Laporan yang Tersedia

1. Laporan Penjualan
2. Laporan Pembelian
3. Laporan Piutang
4. Laporan Utang
5. Laporan Arus Kas
6. Laporan Laba Rugi
7. Laporan Barang Terjual
8. Laporan Stok
9. Laporan Customer
10. Laporan Supplier

#### Filter & Customization

- **Date Range**: Pilih periode laporan
- **Category**: Filter by kategori
- **Customer/Supplier**: Filter by pihak tertentu
- **Payment Method**: Filter by metode bayar
- **Status**: Filter by status pembayaran
- **User**: Filter by kasir/user (untuk CASHIER)

---

## Fitur Pengaturan (Settings)

### 1. Profil Toko

**Kustomisasi informasi toko**

#### Informasi yang Dapat Diatur

- **Nama Toko**: Nama bisnis
- **Alamat**: Alamat lengkap toko
- **Nomor Telepon**: Kontak toko
- **Jargon/Tagline**: Slogan toko
- **Footer Message**: Pesan di footer struk
- **Notes**: Catatan tambahan

#### Visibility Settings

Toggle show/hide untuk:

- Show Address
- Show Phone
- Show Jargon
- Show Bank Account

### 2. Bank & E-Wallet

**Kelola akun bank untuk pembayaran transfer**

#### Data Bank Account

- **Nama Bank/E-Wallet**: BCA, Mandiri, GoPay, DANA, dll
- **Nomor Rekening**: Account number
- **Nama Pemegang**: Account holder name

#### Fitur

- **Add Bank**: Tambah rekening baru
- **Edit Bank**: Update info rekening
- **Delete Bank**: Hapus rekening
- **Active Status**: Enable/disable rekening
- **Display**: Tampil di POS untuk pilihan transfer
- **Export & Print**: Export daftar rekening

#### Integrasi

- **POS Payment**: Pilih rekening saat bayar transfer
- **Cash Flow**: Nomor rekening auto-append ke deskripsi
- **Transaction**: Rekening ter-snapshot di data transaksi

### 3. Pengaturan Cetak (Print Settings)

**Konfigurasi layout struk**

#### Tipe Printer Support

1. **58mm**: Thermal printer kecil
2. **80mm**: Thermal printer standar
3. **A4**: Printer laser/inkjet

#### Customizable Elements

- Header (nama toko, logo)
- Contact info
- Transaction details
- Item layout
- Footer
- Jargon/tagline display

### 4. Manajemen User

**Kelola akun pengguna (SUPERADMIN only)**

#### Data User

- **Nama**: Nama lengkap user
- **Username**: Username untuk login
- **Password**: Password terenkripsi
- **Role**: SUPERADMIN/OWNER/CASHIER
- **Foto**: Upload foto profil (Base64)

#### Fitur

- **Add User**: Buat user baru
- **Edit User**: Update data user
- **Delete User**: Hapus user
- **Change Password**: Ubah password
- **Role Assignment**: Atur role user

#### User Activity (Planned)

- Login history
- Transaction log
- Action audit trail

---

## Fitur Tambahan

### 1. Barcode Generator & Scanner

- **Generate Barcode**: Buat barcode dari SKU produk
- **Scan Barcode**: Input item via barcode di POS
- **Print Labels**: Cetak label barcode
- **Batch Generation**: Generate multiple barcode sekaligus

### 2. Responsive Design

- **Mobile Friendly**: UI responsive untuk tablet/mobile
- **Touch Optimized**: Tombol besar untuk touch screen
- **Adaptive Layout**: Layout menyesuaikan ukuran layar
- **Page Transitions**: Animasi fade-in yang halus diseluruh halaman aplikasi untuk pengalaman pengguna yang lebih baik
- **Page Titles**: Deskripsi informatif di bawah judul halaman (Riwayat Pelanggan, Supplier, Barang Terjual, dll)

### 3. Data Export & Import

- **Export Data**: Backup data ke CSV/Excel
- **Import Products**: Import produk dari spreadsheet
- **Batch Operations**: Update/delete multiple items
- **Backup/Restore**: Backup database lengkap

### 4. Filtering & Search

- **Global Search**: Cari di semua data
- **Advanced Filters**: Filter multi-kriteria
- **Date Range**: Filter berdasarkan periode
- **Quick Filters**: Filter cepat per halaman

### 5. Data Isolation per Cashier

**Untuk role CASHIER, data yang tampil dibatasi**

#### Yang Terfilter:

- **Transaksi**: Hanya yang dibuat sendiri
- **Pembelian**: Hanya yang diinput sendiri
- **Cash Flow**: Hanya yang diinput sendiri
- **Piutang**: Dari transaksi sendiri
- **Utang**: Dari pembelian sendiri
- **Laporan**: Laporan keuangan dibatasi hanya untuk data user tersebut

#### Yang Tetap Visible:

- Produk (semua)
- Customer (semua)
- Supplier (semua)
- Kategori (semua)

### 6. Auto Stock Adjustment

**Stok otomatis terupdate di berbagai skenario**

#### Trigger Auto-adjustment:

1. **Transaksi Penjualan**: Stock berkurang
2. **Retur Penjualan**: Stock bertambah
3. **Pembelian**: Stock bertambah
4. **Retur Pembelian**: Stock berkurang
5. **Edit Transaksi/Pembelian**: Re-calculate stock

### 7. Cash Flow Auto-generation

**Cash flow otomatis tercatat dari transaksi/pembelian**

#### Auto-generated dari:

1. **Transaksi LUNAS**: Cash in sebesar amountPaid - change
2. **Transaksi DP**: Cash in sebesar DP
3. **Cicilan Piutang**: Cash in sebesar payment
4. **Pembelian LUNAS**: Cash out sebesar amountPaid
5. **Pembelian DP**: Cash out sebesar DP
6. **Cicilan Utang**: Cash out sebesar payment
7. **Retur Penjualan**: Cash out sebesar refund
8. **Retur Pembelian**: Cash in sebesar refund

#### Detail yang Tercatat:

- Tipe (MASUK/KELUAR)
- Amount
- Category (Penjualan/Pembelian/Retur)
- Description (detail transaksi + bank info)
- Payment method
- Bank ID & Name (jika transfer)
- Reference ID (link ke transaksi/pembelian)
- User ID & Name

### 8. Payment Tracking & History

**Pelacakan pembayaran lengkap**

#### Payment History Item:

- Tanggal pembayaran
- Jumlah yang dibayar
- Metode pembayaran
- Bank (jika transfer)
- Note (catatan)

#### Auto Update Status:

- **BELUM LUNAS** → **SEBAGIAN** → **LUNAS**
- Status otomatis update berdasarkan total pembayaran

### 9. Return Management with Parent Linking

**Sistem retur dengan link ke transaksi/pembelian induk**

#### Fitur:

- **Parent Link**: Retur terhubung ke original transaction/purchase
- **originalTransactionId/originalPurchaseId**: ID induk tersimpan
- **Flag Return**: Transaksi/pembelian induk ditandai
- **Show Return Status**: "(Ada Retur)" muncul di status
- **View Parent**: Dari retur, bisa lihat detail induk
- **Complete History**: Dari induk, bisa lihat semua retur

### 10. Bank Account Integration

**Integrasi rekening bank di semua fitur pembayaran**

#### Fitur:

- **Select Bank**: Pilih bank saat bayar transfer
- **Snapshot**: Data bank (nama + nomor) tersimpan di transaksi
- **Display**: Nomor rekening muncul di detail transaksi/pembelian
- **Cash Flow**: Bank info ditambahkan ke deskripsi cash flow
- **Receipt**: Nomor rekening tercetak di struk

### 11. Date & Time Tracking

**Pencatatan waktu lengkap**

#### Timestamps:

- **createdAt**: Waktu pembuatan record
- **updatedAt**: Waktu update terakhir
- **Transaction date**: Tanggal transaksi (bisa custom)
- **Payment date**: Tanggal setiap pembayaran

### 12. Multi-currency Support (Planned)

- Support Rupiah dan mata uang lain
- Auto conversion

### 13. Tax Calculation (Planned)

- PPN/Tax calculation
- Tax reports

### 14. Employee Management (Planned)

- Attendance tracking
- Commission calculation
- Performance reports

### 15. Notification System (Planned)

- Low stock alerts
- Payment reminders
- Due date notifications

---

## 🔒 Keamanan Data

### Enkripsi & Hashing

- **Password**: Bcrypt hashing
- **JWT Tokens**: Signed dengan secret key
- **Sensitive Data**: Auto-sanitized dari API response

### Access Control

- **Role-based permissions**: Strict RBAC enforcement
- **Data isolation**: Cashier hanya lihat data sendiri
- **API Authentication**: Semua endpoint protected
- **CORS**: Whitelist domains only

### Audit Trail

- **Transaction log**: Siapa input apa dan kapan
- **User tracking**: userId dan userName tercatat
- **Timestamp**: createdAt dan updatedAt
- **Change history**: Track perubahan data (planned)

### Data Backup

- **Manual export**: Export semua data ke CSV/Excel
- **SQL dump**: Backup database lengkap
- **Regular backups**: Disarankan backup berkala

---

## 📊 Reporting & Analytics

### Available Reports

1. **Laporan Penjualan**: Detail semua transaksi
2. **Laporan Pembelian**: Detail semua pembelian
3. **Laporan Piutang**: Outstanding receivables
4. **Laporan Utang**: Outstanding payables
5. **Laporan Arus Kas**: Cash flow in/out
6. **Laporan Laba Rugi**: P&L statement
7. **Laporan Barang Terjual**: Sold items dengan profit
8. **Laporan Stok**: Inventory levels
9. **Laporan Customer**: Customer database
10. **Laporan Supplier**: Supplier database
11. **Laporan Bank**: Bank accounts

### Export Options

- CSV (Comma Separated Values)
- Excel (XLSX)
- PDF (Planned)
- Print (Direct print)

### Visualization

- **Charts**: Line, bar, pie charts
- **Graphs**: Trend analysis
- **Dashboards**: Real-time metrics
- **KPIs**: Key performance indicators

---

## 🚀 Deployment Options

### Local Development

- PHP Built-in server
- XAMPP
- Laragon
- WAMP/MAMP

### Production Hosting

- **Shared Hosting**: cPanel support
- **VPS**: Ubuntu/CentOS server
- **Cloud**: AWS, DigitalOcean, dll
- **Docker**: Docker Compose setup

### Scalability

- MySQL database untuk multi-user
- API-based architecture
- Horizontal scaling ready
- Load balancing support (planned)

---

## 📖 Dokumentasi Tambahan

Untuk informasi lebih detail, lihat dokumentasi berikut:

- **[README.md](./README.md)**: Overview aplikasi
- **[README_DEVELOPMENT.md](./README_DEVELOPMENT.md)**: Setup development
- **[README_PRODUCTION.md](./README_PRODUCTION.md)**: Production deployment
- **[README_CPANEL_HOSTING.md](./README_CPANEL_HOSTING.md)**: Deploy ke cPanel
- **[README_RUN_LOCALLY.md](./README_RUN_LOCALLY.md)**: Run locally
- **[README_PHP_BACKEND.md](./README_PHP_BACKEND.md)**: Backend architecture
- **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)**: Security audit
- **[SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)**: Security features

---

## 💡 Tips & Best Practices

### Untuk Pemilik Toko

1. **Backup Rutin**: Export data setiap hari/minggu
2. **Monitor Stok**: Cek stok rendah secara berkala
3. **Review Piutang**: Tindak lanjuti piutang menunggak
4. **Analisis Laba**: Review laporan laba rugi bulanan
5. **User Management**: Buat user dengan role sesuai kebutuhan

### Untuk Kasir

1. **Cek Stok**: Pastikan stok cukup sebelum transaksi
2. **Pilih Customer**: Gunakan database customer untuk harga otomatis
3. **Catat Transfer**: Jangan lupa pilih bank saat bayar transfer
4. **Print Struk**: Selalu cetak struk untuk bukti
5. **Retur**: Proses retur dengan benar dan link ke transaksi asal

### Optimasi Performa

1. **Bersihkan Data Lama**: Archive transaksi lama
2. **Index Database**: Pastikan index optimal
3. **Cache**: Enable caching untuk query berat
4. **Compress Images**: Resize foto produk/user
5. **Regular Maintenance**: Clean up temporary files

---

## 🆘 Support & Troubleshooting

### FAQ

Q: **Lupa password?**
A: Hubungi superadmin untuk reset password

Q: **Stok tidak update?**
A: Cek apakah transaksi tersimpan dengan benar

Q: **Cash flow tidak muncul?**
A: Pastikan `skipCashFlow` tidak aktif

Q: **Tidak bisa login?**
A: Cek username/password, pastikan server running

### Error Handling

- **500 Error**: Cek log di `php_error.log`
- **Database Error**: Cek koneksi database
- **Permission Denied**: Cek role user

### Contact Support

- **GitHub**: [dotslashgabut/cemilan-kasirpos](https://github.com/dotslashgabut/cemilan-kasirpos)
- **YouTube**: [DotSlashGabut](https://www.youtube.com/@dotslashgabut)
- **Saweria**: [Support via Saweria](https://saweria.co/dotslashgabut)
- **Ko-fi**: [Support via Ko-fi](https://ko-fi.com/dotslashgabut)

---

**Terima kasih telah menggunakan Cemilan KasirPOS Nusantara! 🍬**

_Semoga bermanfaat untuk mengembangkan usaha Anda._
