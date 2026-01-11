# Penjelasan Detail Temuan Keamanan

Dokumen ini memberikan penjelasan mendalam mengenai dua temuan keamanan spesifik pada backend PHP Cemilan KasirPOS: dukungan password legacy dan konfigurasi HTTPS/HSTS.

## 1. Legacy Password Support (Dukungan Password Lama) - **RESOLVED**

### Status
**Sudah Dihapus**. Berdasarkan pengecekan pada database `cemilankasirpos_php_v02.sql`, semua user sudah menggunakan password yang di-hash dengan Bcrypt. Oleh karena itu, logika fallback plaintext di `login.php` telah dihapus untuk keamanan maksimal.

### Deskripsi (Arsip)
Sebelumnya, `php_server/login.php` memiliki logika "fallback" yang mengizinkan pengguna untuk login menggunakan password *plain-text*.

### Tindakan yang Telah Dilakukan
Kode berikut telah **DIHAPUS** dari `login.php`:

```php
} else {
    // Legacy plain text fallback
    if ($user['password'] === $password) {
        $validPassword = true;
        // ... auto migration code ...
    }
}
```

Sekarang sistem hanya menerima password yang terverifikasi via `password_verify()`.

---

## 2. HTTPS & HSTS Configuration - **RESOLVED**

### Deskripsi
HTTP Strict Transport Security (HSTS) adalah mekanisme kebijakan keamanan web yang memaksa browser web untuk berinteraksi dengan situs web hanya menggunakan koneksi HTTPS yang aman.

### Status Terbaru (2026-01-11)
**Sudah Diimplementasikan**. Logika HSTS telah ditambahkan ke `php_server/config.php` dengan pengecekan otomatis.

### Implementasi Saat Ini
Kode berikut telah aktif di `config.php`:

```php
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
}
```

### Cara Kerja
- Sistem secara otomatis mendeteksi apakah request menggunakan HTTPS (`$_SERVER['HTTPS'] === 'on'`).
- Jika ya, header `Strict-Transport-Security` akan dikirimkan.
- Jika tidak (misal di localhost tanpa SSL), header tidak dikirim untuk mencegah error akses.

### Rekomendasi
- Pastikan server production Anda (Hosting/VPS) sudah terinstall SSL (HTTPS).
- Tidak perlu konfigurasi manual lagi di `config.php` karena sudah otomatis.

---
**Catatan**: Jangan aktifkan HSTS jika Anda belum memiliki SSL yang valid, karena akan menyebabkan website tidak bisa diakses sama sekali oleh pengguna.
