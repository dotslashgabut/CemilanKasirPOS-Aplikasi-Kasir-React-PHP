# Panduan Perbaikan Arus Kas (Cash Flow)

Masalah: Data Arus Kas tidak muncul karena struktur database belum diperbarui.
Solusi: Jalankan script update database.

## Langkah-langkah Perbaikan

1. Pastikan XAMPP atau Laragon sudah berjalan (Apache & MySQL).
2. Buka browser dan akses URL berikut (sesuaikan dengan setup Anda):

   - Jika menggunakan Laragon (Virtual Host):
     `http://cemilan-kasirpos.test/php_server/update_schema_cashflow_user.php`
   
   - Jika menggunakan XAMPP/Localhost biasa:
     `http://localhost/cemilan-kasirpos/php_server/update_schema_cashflow_user.php`

3. Anda akan melihat pesan:
   - "Successfully added userId column..."
   - atau "Column userId already exists..."

4. Setelah itu, coba lakukan transaksi baru atau tambah arus kas manual. Data seharusnya sudah muncul di tab "Arus Kas".

## Catatan Teknis

File `cemilankasirpos.sql` juga sudah diperbarui untuk menyertakan kolom `userId` dan `userName` pada tabel `cashflows`, sehingga instalasi baru di masa depan tidak akan mengalami masalah ini.
