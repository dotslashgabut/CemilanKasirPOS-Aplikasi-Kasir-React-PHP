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

## 2. HTTPS & HSTS Configuration

### Deskripsi
HTTP Strict Transport Security (HSTS) adalah mekanisme kebijakan keamanan web yang memaksa browser web untuk berinteraksi dengan situs web hanya menggunakan koneksi HTTPS yang aman, dan tidak pernah melalui protokol HTTP yang tidak aman.

### Analisis Kode
Pada `php_server/config.php` (baris 88), header HSTS saat ini dinonaktifkan (dikomentari):

```php
// header("Strict-Transport-Security: max-age=31536000; includeSubDomains"); // Enable if using HTTPS
```

### Mengapa Ini Penting?
- **Mencegah Downgrade Attacks**: Tanpa HSTS, penyerang di jaringan yang sama (Man-in-the-Middle) bisa memaksa browser pengguna untuk turun ke koneksi HTTP biasa dan mencuri data (seperti token login).
- **Kepercayaan Browser**: HSTS memberi tahu browser untuk mengingat bahwa situs ini "hanya boleh HTTPS" selama periode waktu tertentu (`max-age`).

### Risiko Saat Ini
- Jika server production tidak memaksa HTTPS, pengguna bisa tidak sengaja mengakses versi HTTP yang tidak aman.
- Cookie dan Token JWT bisa disadap jika dikirim lewat HTTP.

### Rekomendasi & Tindakan
1.  **Prasyarat**: Pastikan server production (cPanel/Apache/Nginx) sudah terpasang **Sertifikat SSL** yang valid.
2.  **Aktivasi**: Buka `php_server/config.php` dan **hilangkan komentar (`//`)** pada baris tersebut:
    ```php
    header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
    ```
3.  **Verifikasi**: Pastikan website tidak bisa diakses via `http://` (harus auto-redirect ke `https://`).

---
**Catatan**: Jangan aktifkan HSTS jika Anda belum memiliki SSL yang valid, karena akan menyebabkan website tidak bisa diakses sama sekali oleh pengguna.
