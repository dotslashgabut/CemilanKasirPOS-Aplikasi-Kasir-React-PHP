# 📚 Penjelasan File .env di Project Cemilan Kasir POS

## ⚠️ PENTING: File .env Ini Untuk Frontend (Vite), BUKAN Backend PHP!

File `.env` ini digunakan oleh **Vite (frontend bundler)** untuk mengkonfigurasi aplikasi React.
**Backend PHP** menggunakan file `php_server/config.php` untuk konfigurasinya.

---

## 📋 File .env yang Ada di Project Ini

### 1. `.env` (Base Configuration)
```
VITE_API_URL=http://localhost:8000/cemilan-app/php_server/index.php/api
```

**Kapan digunakan?**
- ✅ Selalu di-load di semua mode (dev & production)
- ✅ Prioritas paling rendah (akan di-override oleh file lain)
- ✅ Biasanya di-commit ke Git (setting default untuk semua developer)

**Fungsi:**
- Menyimpan konfigurasi default/fallback
- Konfigurasi yang sama untuk semua environment

---

### 2. `.env.local` (Local Override)
```
VITE_API_URL=http://localhost:8000/cemilan-app/php_server/index.php/api
```

**Kapan digunakan?**
- ✅ Selalu di-load di semua mode (dev & production)
- ✅ Prioritas lebih tinggi dari `.env` (akan override `.env`)
- ✅ **TIDAK** di-commit ke Git (ada di `.gitignore`)

**Fungsi:**
- Setting personal developer yang berbeda dengan default
- Override konfigurasi tanpa mengubah `.env`
- Cocok untuk development lokal

**Note:** Di project Anda saat ini, `.env` dan `.env.local` sama persis. Ini tidak masalah, tapi sebaiknya salah satu dihapus untuk menghindari kebingungan.

---

### 3. `.env.production` (Production Configuration) ⭐ BARU
```
VITE_API_URL=http://cemilan-app.test/php_server/index.php/api
```

**Kapan digunakan?**
- ✅ **HANYA** saat `npm run build` (production mode)
- ✅ Prioritas lebih tinggi dari `.env.local` dan `.env`
- ✅ Biasanya di-commit ke Git (setting production untuk semua)

**Fungsi:**
- Menyimpan konfigurasi khusus untuk production build
- URL API untuk deployment (virtual host Laragon)
- Override semua setting lain saat build

---

## 🎯 Kapan File Mana yang Digunakan?

### Saat Development: `npm run dev`

```
┌─────────────────────────────────────────────┐
│  npm run dev (mode: development)            │
└─────────────────────────────────────────────┘
                    ↓
    File yang di-load (urutan):
    
    1. .env                      ← Loaded (prioritas rendah)
    2. .env.local                ← Loaded (prioritas tinggi)
    3. .env.development          ← Tidak ada di project ini
    4. .env.development.local    ← Tidak ada di project ini
    
                    ↓
    FINAL VALUE (yang menang = prioritas tertinggi):
    
    VITE_API_URL = http://localhost:8000/cemilan-app/php_server/index.php/api
                   ↑ Dari .env.local (karena prioritas lebih tinggi)
```

**Jadi saat `npm run dev`:**
- File `.env.production` **DIABAIKAN** ❌
- Yang dipakai adalah `.env.local` (atau `.env.development` jika ada)
- URL API: `http://localhost:8000/...`

---

### Saat Production Build: `npm run build`

```
┌─────────────────────────────────────────────┐
│  npm run build (mode: production)           │
└─────────────────────────────────────────────┘
                    ↓
    File yang di-load (urutan):
    
    1. .env                      ← Loaded (prioritas rendah)
    2. .env.local                ← Loaded (prioritas sedang)
    3. .env.production           ← Loaded ⭐ (prioritas tinggi)
    4. .env.production.local     ← Tidak ada di project ini
    
                    ↓
    FINAL VALUE (yang menang = prioritas tertinggi):
    
    VITE_API_URL = http://cemilan-app.test/php_server/index.php/api
                   ↑ Dari .env.production (karena prioritas lebih tinggi!)
```

**Jadi saat `npm run build`:**
- File `.env.production` **DIGUNAKAN** ✅
- Override nilai dari `.env.local` dan `.env`
- URL API: `http://cemilan-app.test/...` (virtual host Laragon)

---

## 🔍 Cara Memverifikasi File Mana yang Digunakan

### Method 1: Console Log (Recommended)

Tambahkan di file `App.tsx` atau component lain:

```typescript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Mode:', import.meta.env.MODE);
```

Lalu buka browser console:
- Saat `npm run dev` → akan show: `http://localhost:8000/...`
- Saat `npm run build` & deploy → akan show: `http://cemilan-app.test/...`

### Method 2: Build dan Cek File Hasil

```bash
npm run build
```

Lalu cek file `dist/assets/index-[hash].js`, cari string `VITE_API_URL`, akan terlihat URL yang di-embed.

---

## 📊 Tabel Perbandingan

| File | Saat `npm run dev` | Saat `npm run build` | Di-commit Git? | Prioritas |
|------|-------------------|---------------------|----------------|-----------|
| `.env` | ✅ Loaded | ✅ Loaded | ✅ Ya | 🔵 Rendah |
| `.env.local` | ✅ Loaded | ✅ Loaded | ❌ Tidak | 🟡 Sedang |
| `.env.production` | ❌ Diabaikan | ✅ **Loaded** | ✅ Ya | 🟢 Tinggi (saat build) |
| `.env.development` | ✅ Loaded (jika ada) | ❌ Diabaikan | ✅ Ya | 🟢 Tinggi (saat dev) |

---

## 🎨 Best Practice Recommendations

### Konfigurasi Ideal untuk Project Anda:

```
.env                    # Default fallback (commit ke Git)
  └─ VITE_API_URL=http://localhost:8000/cemilan-app/php_server/index.php/api

.env.local              # Hapus atau gunakan untuk override personal
  └─ (Bisa dihapus karena sama dengan .env)

.env.production         # Production build (commit ke Git)
  └─ VITE_API_URL=http://cemilan-app.test/php_server/index.php/api

.env.development        # Optional: khusus development (commit ke Git)
  └─ VITE_API_URL=http://localhost:8000/cemilan-app/php_server/index.php/api
```

### Rekomendasi Struktur File:

**Option A: Simple (Recommended untuk project ini)**
```
✅ .env                   → Default untuk dev & production
✅ .env.production        → Override untuk production build
❌ .env.local             → Hapus (karena sama dengan .env)
```

**Option B: Explicit**
```
✅ .env                   → Fallback values
✅ .env.development       → Development configuration
✅ .env.production        → Production configuration
❌ .env.local             → Untuk override personal (optional)
```

---

## 🛠️ Troubleshooting

### Problem: Build masih menggunakan localhost URL

**Penyebab:**
- File `.env.production` tidak ada atau salah
- Ada file `.env.production.local` yang override

**Solusi:**
1. Pastikan file `.env.production` ada dan benar
2. Jalankan `npm run build` ulang
3. Cek hasil build di `dist/assets/index-[hash].js`

### Problem: Development menggunakan production URL

**Penyebab:**
- Mode tidak terdeteksi dengan benar
- File `.env.local` tidak ada

**Solusi:**
1. Pastikan `npm run dev` (bukan `npm run build`)
2. Tambahkan `.env.development` untuk development khusus
3. Restart dev server

---

## 📝 Summary

### Saat `npm run dev`:
```
✅ File yang dipakai: .env.local (atau .env jika .env.local tidak ada)
✅ URL API: http://localhost:8000/cemilan-app/php_server/index.php/api
✅ Mode: development
```

### Saat `npm run build`:
```
✅ File yang dipakai: .env.production (override .env.local dan .env)
✅ URL API: http://cemilan-app.test/php_server/index.php/api
✅ Mode: production
```

### Backend PHP (php_server/):
```
❌ TIDAK menggunakan file .env sama sekali
✅ Menggunakan: php_server/config.php
✅ Konfigurasi: Database, CORS, Security headers
```

---

## ✅ Action Items untuk Anda

1. **Verifikasi virtual host Anda** → Apakah benar `cemilan-app.test`?
2. **Update `.env.production`** jika virtual host berbeda
3. **Hapus `.env.local`** (optional, karena sama dengan `.env`)
4. **Build ulang:** `npm run build`
5. **Deploy folder `dist`** ke document root virtual host Laragon
6. **Test akses:** Buka `http://cemilan-app.test` di browser

---

## 🔗 Related Files

- `vite.config.ts` → Konfigurasi Vite bundler
- `php_server/config.php` → Konfigurasi backend PHP (CORS, Database)
- `.gitignore` → Daftar file yang tidak di-commit (termasuk `.env.local`)

---

**Last Updated:** 2025-11-24 14:50:00 +07:00
