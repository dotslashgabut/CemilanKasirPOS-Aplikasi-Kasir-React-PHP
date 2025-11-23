# Panduan Sistem Authorization

## Perubahan yang Dilakukan

Sistem authorization berbasis role telah ditambahkan untuk mengamankan API backend dan membatasi akses berdasarkan peran pengguna. Keamanan telah ditingkatkan menggunakan **JWT (JSON Web Tokens)** dan **Bcrypt Password Hashing**.

## Struktur Role

Aplikasi menggunakan 3 tingkat role:

1. **SUPERADMIN**: Akses penuh ke semua fitur termasuk Data Management dan Reset Data.
2. **OWNER**: Akses ke fitur manajemen, kecuali manajemen user dan data management (reset).
3. **CASHIER**: Hanya akses ke transaksi penjualan.

## File yang Dimodifikasi

### 1. Backend PHP

#### `php_server/auth.php`

File middleware autentikasi yang menyediakan:

- `getUserFromHeaders()`: Memverifikasi dan mendekode **JWT Token** dari Authorization header
- `requireAuth()`: Memastikan user sudah login dan token valid
- `requireRole($allowedRoles)`: Memastikan user memiliki role yang sesuai
- `generateJWT($payload)`: Membuat token JWT baru saat login
- `verifyJWT($token)`: Memverifikasi signature dan expiration token

#### `php_server/index.php`

Ditambahkan authorization checks pada setiap operasi:

**POST Operations:**

- User management: Hanya SUPERADMIN
- Master data (products, categories, customers, suppliers, store_settings): CASHIER tidak bisa
- Transactions & purchases: Semua user terautentikasi

**PUT Operations:**

- User management: Hanya SUPERADMIN
- Master data: CASHIER tidak bisa
- Lainnya: Semua user terautentikasi

**DELETE Operations:**

- User management: Hanya SUPERADMIN
- **Financial data (transactions, purchases, cashflow): Hanya SUPERADMIN** ⚡
- Master data & banks: CASHIER tidak bisa
- Lainnya: Semua user terautentikasi

**GET Operations:**

- Users: Hanya SUPERADMIN yang bisa lihat semua user. User lain hanya bisa lihat profil sendiri.
- Lainnya: Semua user terautentikasi bisa membaca data

**Batch Operations:**

- User management: Hanya SUPERADMIN
- Master data: CASHIER tidak bisa
- Lainnya: Semua user terautentikasi

**Data Management (Reset Functions):**

- **Hanya SUPERADMIN yang bisa akses Data Management tab**
- Reset Transactions: Menghapus semua data transaksi penjualan
- Reset Purchases: Menghapus semua data pembelian/stok masuk
- Reset Cash Flow: Menghapus semua data arus kas
- Reset All Financial Data: Menghapus semua data keuangan (kombinasi 3 di atas)
- Reset Master Data: Menghapus semua produk, kategori, pelanggan, supplier
- **Reset All Data (Nuclear Option):** Menghapus SELURUH data database (Financial + Master Data)

### 2. Frontend React

#### `services/api.ts`

Ditambahkan fungsi `getHeaders()` yang:

- Mengambil **JWT Token** dari `localStorage` (`pos_token`)
- Mengirim sebagai Bearer token di header `Authorization`
- Semua request API sekarang menggunakan `getHeaders()`
- **Implementasi reset functions** yang menghapus data via API

## Cara Kerja Authorization

### 1. Login

- User login melalui `App.tsx`
- Data user disimpan di `localStorage` dengan key `pos_current_user`

### 2. Setiap API Request

```typescript
// Frontend mengirim header
Authorization: Bearer <jwt_token_string>

// Backend PHP memverifikasi
$token = substr($authHeader, 7);
$payload = verifyJWT($token); // Verify signature & expiration

if (!$payload) {
    // HTTP 401 Unauthorized
}

// Validasi role
if (!in_array($payload['role'], $allowedRoles)) {
    // HTTP 403 Forbidden
}
```

### 3. Response Error

- **401 Unauthorized**: User belum login
- **403 Forbidden**: User tidak memiliki akses ke resource

## Testing

### Sebagai SUPERADMIN

- ✅ Bisa menambah, edit, hapus produk
- ✅ Bisa menambah, edit, hapus kategori
- ✅ Bisa menambah, edit, hapus customer/supplier
- ✅ Bisa menambah, edit, hapus user
- ✅ **Bisa akses Data Management dan reset data**
- ✅ Bisa proses transaksi

### Sebagai OWNER

- ✅ Bisa menambah, edit, hapus produk
- ✅ Bisa menambah, edit, hapus kategori
- ✅ Bisa menambah, edit, hapus customer/supplier
- ❌ TIDAK bisa akses manajemen user
- ❌ **TIDAK bisa akses Data Management atau reset data**
- ❌ TIDAK bisa hapus financial data (transactions, purchases, cashflow)
- ✅ Bisa proses transaksi

### Sebagai CASHIER

- ❌ TIDAK bisa menambah/edit/hapus produk
- ❌ TIDAK bisa menambah/edit/hapus kategori
- ❌ TIDAK bisa menambah/edit/hapus customer/supplier
- ❌ TIDAK bisa akses manajemen user
- ❌ TIDAK bisa akses Data Management
- ❌ TIDAK bisa akses Settings
- ✅ Bisa proses transaksi (hanya ini)

## Keamanan

### Status Keamanan Saat Ini:

1. **JWT Authentication**: ✅ Sudah diimplementasikan. Token memiliki expiration time.
2. **Password Hashing**: ✅ Sudah diimplementasikan menggunakan `password_hash()` (Bcrypt). Password tidak lagi disimpan plain text.
3. **Input Sanitization**: ✅ `strip_tags()` diterapkan pada input string untuk mencegah XSS.
4. **SQL Injection Protection**: ✅ Column validation dan Prepared Statements diterapkan.

### Rekomendasi Production:

1. **HTTPS only**: Wajib gunakan HTTPS agar token tidak dicuri di jaringan.
2. **Environment Variables**: Simpan `JWT_SECRET` dan credential DB di environment variables server, bukan hardcoded.
3. **Rate Limiting**: Tambahkan rate limiting pada endpoint login.

## Troubleshooting

### Error: "Unauthorized. Please login"

- User belum login atau session expired
- Solusi: Login ulang

### Error: "Access denied. Insufficient permissions"

- User tidak punya akses ke resource
- Solusi: Login dengan user yang memiliki role sesuai

### Error: "Failed to save/update/delete"

- Cek console browser untuk detail error
- Cek `php_error.log` di folder `php_server/`

### Error: "Reset data tidak berhasil"

- Pastikan login sebagai SUPERADMIN
- Pastikan konfirmasi text input benar (case-sensitive)
- Cek console browser untuk error detail

## Default Users

Default user untuk `cemilankasirpos.sql`

```
SUPERADMIN:
- Username: superadmin
- Password: password
- Role: SUPERADMIN

OWNER:
- Username: owner
- Password: owner
- Role: OWNER

CASHIER:
- Username: kasir
- Password: kasir
- Role: CASHIER
```

Default user untuk `cemilankasirpos_dummy_data_500_produk.sql`

```
SUPERADMIN:
- Username: superadmin
- Password: password
- Role: SUPERADMIN

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

## Apa Selanjutnya?

1. Test semua fungsi dengan masing-masing role
2. Verifikasi error handling sudah benar
3. Test fungsi reset data di Data Management tab
4. Untuk production:
   - Setup HTTPS (Wajib)
   - Set environment variables untuk secrets
   - Batasi CORS sesuai domain frontend
