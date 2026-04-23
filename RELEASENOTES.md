# Release Notes v0.2.3

## 🚀 Fitur Baru & Peningkatan (New Features & Improvements)

1. **Sinkronisasi Waktu Akurat (Time Synchronization)**
   - **Deskripsi**: Aplikasi kini tersinkronisasi secara otomatis dengan waktu dunia nyata (UTC+7) menggunakan API eksternal (World Time API), dengan fallback ke waktu server host.
   - **Manfaat**: Memastikan semua pencatatan waktu untuk transaksi, penyesuaian stok, dan aktivitas operasional tetap akurat, terlepas dari ketidakakuratan jam lokal pada perangkat pengguna.

2. **Penghapusan Multi-Transaksi (Bulk Delete)**
   - **Deskripsi**: Menambahkan fitur untuk menghapus beberapa riwayat transaksi atau riwayat pembelian sekaligus secara massal di halaman Keuangan. Proses ini juga akan otomatis menghapus data arus kas yang terkait untuk menjaga integritas data.
   - **Akses**: Fitur ini eksklusif dan hanya dapat diakses oleh role *Superadmin*.

3. **Pembersihan Data Berkala (Financial Data Pruning)**
   - **Deskripsi**: Menambahkan tab baru "Manajemen Data" di halaman Pengaturan. Fitur ini memungkinkan penghapusan data keuangan (penjualan, pembelian, arus kas, hutang/piutang) yang sudah lampau berdasarkan rentang waktu tertentu (misalnya: lebih tua dari 1 bulan, 2 bulan, atau 6 bulan).
   - **Akses**: Fitur ini juga dibatasi khusus untuk role *Superadmin*.

## 🛠️ Perubahan File (File Changes)
Pembaruan ini mencakup perubahan dan penyesuaian pada file-file berikut:
- `App.tsx`
- `pages/Dashboard.tsx`
- `pages/Finance.tsx`
- `pages/POS.tsx`
- `pages/RealStockCheck.tsx`
- `pages/Settings.tsx`
- `services/api.ts`
- `services/storage.ts`
- `utils.ts`
