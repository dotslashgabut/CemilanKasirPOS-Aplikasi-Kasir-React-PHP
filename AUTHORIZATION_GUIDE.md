# Panduan Sistem Authorization (Node.js Backend)

## Perubahan yang Dilakukan

Sistem authorization berbasis role telah ditambahkan untuk mengamankan API backend dan membatasi akses berdasarkan peran pengguna. Keamanan telah ditingkatkan menggunakan **JWT (JSON Web Tokens)** dan **Bcrypt Password Hashing**.

## Struktur Role

Aplikasi menggunakan 3 tingkat role:

1. **SUPERADMIN**: Akses penuh ke semua fitur termasuk Data Management
2. **OWNER**: Akses ke fitur manajemen, kecuali manajemen user dan data management
3. **CASHIER**: Hanya akses ke transaksi penjualan

## File yang Dimodifikasi

### 1. Backend Node.js

#### `server/index.js`

File server utama yang menyediakan:

- **Authentication Middleware**: `authenticateToken()` - Memverifikasi dan mendekode **JWT Token** dari Authorization header
- **Login Route**: `/api/login` - Membuat token JWT baru saat login berhasil
- **Generic CRUD Routes**: Otomatis generate routes untuk semua model dengan authentication
- **JWT Verification**: Menggunakan `jsonwebtoken` library untuk verify signature dan expiration
- **Password Hashing**: Menggunakan `bcryptjs` untuk hash password

#### Middleware Autentikasi

```javascript
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
```

#### Authorization pada setiap operasi:

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
- **Financial data (transactions, purchases, cashflow): Hanya SUPERADMIN** ⚡ NEW
- Master data & banks: CASHIER tidak bisa
- Lainnya: Semua user terautentikasi

**GET Operations:**

- Users: Hanya SUPERADMIN yang bisa lihat semua user. User lain hanya bisa lihat profil sendiri.
- Lainnya: Semua user terautentikasi bisa membaca data

**Batch Operations:**

- User management: Hanya SUPERADMIN
- Master data: CASHIER tidak bisa
- Lainnya: Semua user terautentikasi

**Data Management (Reset Functions):** ⚡ NEW

- **Hanya SUPERADMIN yang bisa akses Data Management tab** 
- Reset Transactions: Menghapus semua data transaksi penjualan
- Reset Purchases: Menghapus semua data pembelian/stok masuk  
- Reset Cash Flow: Menghapus semua data arus kas
- Reset All Financial Data: Menghapus semua data keuangan (kombinasi 3 di atas)
- Reset Master Data: Menghapus semua produk, kategori, pelanggan, supplier
- **Reset All Data (Nuclear Option):** Menghapus SELURUH data database (Financial + Master Data) ⚡ NEW

### 2. Frontend React

#### `services/api.ts`

Ditambahkan fungsi `getHeaders()` yang:

- Mengambil **JWT Token** dari `localStorage` (`pos_token`)
- Mengirim sebagai Bearer token di header `Authorization`
- Semua request API sekarang menggunakan `getHeaders()`
- **Implementasi reset functions** yang menghapus data via API

## Cara Kerja Authorization

### 1. Login

```javascript
// POST /api/login
{
  "username": "superadmin",
  "password": "password"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "superadmin",
    "role": "SUPERADMIN"
  }
}
```

- User login melalui `App.tsx`
- Backend memverifikasi username dan password
- Password di-compare dengan bcrypt (atau plain text untuk legacy support)
- Jika valid, backend generate JWT token dengan expiration 24 jam
- Data user dan token disimpan di `localStorage` (`pos_token` dan `pos_current_user`)

### 2. Setiap API Request

```typescript
// Frontend mengirim header
Authorization: Bearer <jwt_token_string>

// Backend Node.js memverifikasi
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
        // HTTP 403 Forbidden
        return res.sendStatus(403);
    }
    
    // Token valid, user data tersedia di req.user
    req.user = user; // { id, username, role }
});
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
 
 1. **JWT Authentication**: ✅ Sudah diimplementasikan menggunakan `jsonwebtoken` library. Token memiliki expiration time (24 jam).
 2. **Password Hashing**: ✅ Sudah diimplementasikan menggunakan `bcryptjs`. Password tidak lagi disimpan plain text.
 3. **Input Sanitization**: ✅ Sequelize ORM menangani SQL injection. `helmet` middleware ditambahkan untuk perlindungan header HTTP.
 4. **SQL Injection Protection**: ✅ Sequelize ORM menggunakan parameterized queries secara otomatis.
 5. **Environment Variables**: ✅ `JWT_SECRET` dan database credentials disimpan di `server/.env` dan di-ignore oleh git.
 6. **Rate Limiting**: ✅ Diimplementasikan menggunakan `express-rate-limit` (Global + Strict Login Limiter).
 7. **Error Handling**: ✅ Detail error disembunyikan di production (`NODE_ENV=production`).
 8. **Data Sanitization**: ✅ Password hash tidak dikirim ke client.
 
 ### Rekomendasi Production:
 
 1. **HTTPS only**: Wajib gunakan HTTPS agar token tidak dicuri di jaringan.
 2. **Environment Variables**: Pastikan `.env` file diisi dengan secret yang kuat.
 3. **CORS Configuration**: Pastikan origin di `server/index.js` di-set ke domain frontend production.
 4. **Set NODE_ENV**: Wajib set `NODE_ENV=production` untuk mengaktifkan fitur keamanan error handling.
 
 > Baca **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)** untuk laporan audit keamanan lengkap.

## Troubleshooting

### Error: "Unauthorized. Please login" atau HTTP 401

- User belum login atau token tidak ditemukan
- Solusi: Login ulang untuk mendapatkan token baru

### Error: "Access denied" atau HTTP 403

- Token invalid, expired, atau signature tidak cocok
- User tidak punya akses ke resource (role tidak sesuai)
- Solusi: Login ulang dengan user yang memiliki role sesuai

### Error: "Failed to save/update/delete"

- Cek console browser untuk detail error
- Cek terminal/console tempat Node.js server berjalan untuk log error
- Periksa koneksi database di `server/.env`

### Error: "Reset data tidak berhasil"

- Pastikan login sebagai SUPERADMIN
- Pastikan konfirmasi text input benar (case-sensitive)
- Cek console browser untuk error detail

### Error: "Internal server error" atau HTTP 500

- Terjadi error di backend Node.js
- Cek terminal/console server untuk stack trace
- Periksa koneksi database dan environment variables

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
- Username: admin  
- Password: admin
- Role: OWNER

CASHIER:
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
   - Set environment variables untuk `JWT_SECRET` dan database credentials
   - Batasi CORS sesuai domain frontend (`server/index.js`)
   - Implementasikan rate limiting untuk endpoint login
   - Gunakan process manager seperti PM2 untuk menjalankan Node.js server
   - Setup reverse proxy (nginx/Apache) untuk routing

## Tech Stack Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize
- **Authentication**: JWT (`jsonwebtoken`)
- **Password Hashing**: Bcrypt (`bcryptjs`)
- **Database**: MySQL
- **Environment**: dotenv
