# 🌐 Deploy ke cPanel Shared Hosting - React + PHP

## 📋 Struktur Folder di cPanel

```
public_html/                # ← Root domain (https://yourdomain.com)
├── index.html             # ← Frontend React
├── .htaccess              # ← Frontend routing + API exclusion
├── assets/                # ← React build assets
│   ├── index-xxx.js
│   └── index-xxx.css
└── php_server/            # ← Backend PHP API
    ├── .htaccess          # ← Backend routing
    ├── .env               # ← Database config
    ├── index.php
    ├── config.php
    └── ...
```

**URLs:**
- Frontend: `https://yourdomain.com/`
- Backend API: `https://yourdomain.com/php_server/`
- API Endpoint: `https://yourdomain.com/php_server/api/products`

---

## 🚀 Langkah 1: Persiapan Database

### 1.1 Buat Database di cPanel

1. Login ke **cPanel**
2. Buka **MySQL Database Wizard** atau **MySQL Databases**
3. **Buat Database:**
   - Database Name: `cemilan_pos` 
   - cPanel akan otomatis prefix: `username_cemilan_pos`

4. **Buat User:**
   - Username: `cemilan_admin`
   - Password: `[strong_password]`
   - cPanel akan otomatis prefix: `username_cemilan_admin`

5. **Set Privileges:**
   - Pilih: **ALL PRIVILEGES**
   - Klik: **Make Changes**

### 1.2 Import Database

**Method 1: phpMyAdmin (Recommended)**
1. Buka **phpMyAdmin** di cPanel
2. Pilih database yang baru dibuat
3. Tab **Import**
4. Choose file: `cemilankasirpos_php_v02.sql`
5. Klik **Go**
6. Wait sampai import selesai ✅

**Method 2: Upload via File Manager + CLI**
```bash
# Upload .sql file ke folder /home/username/
# Lalu SSH ke server:
mysql -u username_cemilan_admin -p username_cemilan_pos < cemilankasirpos_php_v02.sql
```

---

## 📦 Langkah 2: Upload Backend PHP

### 2.1 Upload Files

**Via File Manager:**
1. Buka **File Manager** di cPanel
2. Navigate ke `public_html/`
3. Buat folder baru: `php_server`
4. Masuk ke folder `php_server/`
5. Klik **Upload**
6. Upload **SEMUA FILE** dari folder `php_server/` project Anda:
   - `index.php`
   - `config.php`
   - `logic.php`
   - `auth.php`
   - `validator.php`
   - `rate_limit.php`
   - `login.php`
   - `.htaccess`
   - Dan file lainnya

**Via FTP (Alternative):**
```
Host: ftp.yourdomain.com
Username: [cpanel_username]
Password: [cpanel_password]
Port: 21

Upload php_server/ → /public_html/php_server/
```

### 2.2 Konfigurasi .env Backend

1. Di File Manager, masuk ke `public_html/php_server/`
2. Buat file baru: `.env`
3. Isi dengan:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=username_cemilan_pos
DB_USER=username_cemilan_admin
DB_PASS=your_strong_password

# API Configuration
API_BASE_URL=https://yourdomain.com/php_server
SHOW_DEBUG_ERRORS=false
```

**⚠️ PENTING:**
- Ganti `username_` dengan prefix cPanel Anda
- Ganti `your_strong_password` dengan password database
- Ganti `yourdomain.com` dengan domain Anda
- Set `SHOW_DEBUG_ERRORS=false` untuk production

### 2.3 Verifikasi .htaccess Backend

File `public_html/php_server/.htaccess` harus berisi:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /php_server/
    
    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    
    # Remove trailing slashes
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)/$ $1 [L,R=301]
    
    # Route to index.php
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

Options -Indexes

<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# Security: Prevent access to log and json files
<FilesMatch "\.(log|json)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### 2.4 Test Backend API

Buka browser, test:
```
https://yourdomain.com/php_server/api/products
```

**Expected Response:**
```json
[]
```
atau array of products jika sudah ada data.

**Jika Error:**
- 500 Error → Check `.env` database credentials
- 404 Error → Check `.htaccess` dan folder structure
- Blank page → Check PHP version (min PHP 7.4)

---

## 🎨 Langkah 3: Build & Upload Frontend

### 3.1 Update Frontend .env

Di **project development** Anda, edit file `.env.production`:

```env
VITE_API_BASE_URL=https://yourdomain.com/php_server
```

**⚠️ NOTES:**
- Ganti `yourdomain.com` dengan domain Anda
- **JANGAN pakai trailing slash** di akhir URL
- Gunakan `https://` jika SSL sudah aktif (recommended)

### 3.2 Build Frontend

Di terminal project development:

```bash
npm run build
```

Output: Folder `dist/` berisi file production

### 3.3 Upload Frontend ke cPanel

**Via File Manager:**

1. Buka **File Manager**
2. Navigate ke `public_html/`
3. Upload **ISI** dari folder `dist/`:
   - `index.html` → `public_html/index.html`
   - `assets/` folder → `public_html/assets/`
   - Dan file lainnya

**⚠️ PENTING:**
- Upload **ISI folder dist**, bukan folder dist itu sendiri
- Jadi structure: `public_html/index.html` ✅
- Bukan: `public_html/dist/index.html` ❌

**Via FTP:**
```
Upload dist/* → /public_html/
```

### 3.4 Setup .htaccess Frontend

Buat/edit file `.htaccess` di `public_html/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Force HTTPS (optional, uncomment if SSL active)
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Don't rewrite existing files/directories
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    
    # Don't rewrite requests to php_server (backend API)
    RewriteRule ^php_server/ - [L]
    
    # Rewrite everything else to index.html (React Router)
    RewriteRule ^ index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresDefault "access plus 2 days"
</IfModule>
```

---

## ✅ Langkah 4: Testing

### 4.1 Test Backend API

```
https://yourdomain.com/php_server/api/products
```

Expected: JSON response (empty array atau data products)

### 4.2 Test Frontend

```
https://yourdomain.com/
```

Expected: Login page muncul

### 4.3 Test Login

- Username: `superadmin`
- Password: Sesuai database Anda (default dalam SQL dump)

### 4.4 Test React Router

Navigate ke:
```
https://yourdomain.com/products
```

Refresh page → Should not 404 ✅

### 4.5 Test API Connection

1. Login successfully
2. Navigate to Products menu
3. Data should load from database ✅

---

## 🔧 Troubleshooting

### ❌ API Returns 500 Error

**Symptoms:**
```
https://yourdomain.com/php_server/api/products
→ Internal Server Error
```

**Solutions:**

1. **Check PHP Error Log:**
   ```
   File Manager → public_html/php_server/php_error.log
   (Note: File ini tidak bisa dibuka di browser karena alasan keamanan, gunakan File Manager)
   ```

2. **Check .env file:**
   - Database credentials correct?
   - DB_NAME has correct prefix?
   - Password correct?

3. **Test database connection:**
   Create `test-db.php` in `php_server/`:
   ```php
   <?php
   require_once 'config.php';
   try {
       $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASS);
       echo "✅ Database connected!";
   } catch(PDOException $e) {
       echo "❌ Connection failed: " . $e->getMessage();
   }
   ```
   Access: `https://yourdomain.com/php_server/test-db.php`

4. **Check PHP version:**
   - cPanel → PHP Selector
   - Should be **PHP 7.4** or **PHP 8.x**

### ❌ Frontend Page 404 on Refresh

**Symptoms:**
```
https://yourdomain.com/products
→ 404 Not Found (when refresh)
```

**Solutions:**

1. Check `.htaccess` exists in `public_html/`
2. Verify rule: `RewriteRule ^ index.html [L]`
3. Check cPanel → Apache Configuration → AllowOverride is ON

### ❌ Assets Not Loading (404)

**Symptoms:**
```
https://yourdomain.com/assets/index-xxx.js
→ 404 Not Found
```

**Solutions:**

1. Check folder exists: `public_html/assets/`
2. Check permissions: Should be 755 for folders, 644 for files
3. Re-upload `dist/assets/*` to `public_html/assets/`

### ❌ CORS Error

**Symptoms:**
```
Access blocked by CORS policy
```

**Solutions:**

1. Already handled in `php_server/config.php`
2. But verify headers:
   ```php
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   ```

3. If using subdomain for API, update headers:
   ```php
   header('Access-Control-Allow-Origin: https://yourdomain.com');
   ```

### ❌ Blank Page

**Solutions:**

1. Open browser console (F12)
2. Check for errors
3. Common issues:
   - Wrong `VITE_API_BASE_URL` → Rebuild with correct URL
   - Assets path wrong → Check `index.html` asset paths
   - JS errors → Check console

---

## 🔐 Security Checklist

cPanel deployment checklist:

- [ ] ✅ `SHOW_DEBUG_ERRORS=false` di .env
- [ ] ✅ Strong database password
- [ ] ✅ `.htaccess` security headers active
- [ ] ✅ SSL Certificate installed (HTTPS)
- [ ] ✅ File permissions correct:
  - Folders: `755`
  - Files: `644`
  - `.env`: `600` (extra secure)
- [ ] ✅ Directory listing disabled (`Options -Indexes`)
- [ ] ✅ Sensitive files protected (`.env`, `.git`, `.log`, `.json`)

---

## 📊 Final Folder Structure

```
public_html/
├── .htaccess                 ← Frontend routing
├── index.html                ← React app entry
├── assets/                   ← Build assets
│   ├── index-abc123.js
│   └── index-def456.css
├── php_server/               ← Backend API
│   ├── .htaccess             ← API routing
│   ├── .env                  ← DB credentials (secure!)
│   ├── index.php             ← API entry
│   ├── config.php
│   ├── logic.php
│   ├── auth.php
│   ├── validator.php
│   ├── rate_limit.php
│   └── login.php
└── (other files if any)
```

---

## 🚀 Update/Redeploy

Jika ada perubahan code:

### Update Frontend:
```bash
# 1. Build ulang
npm run build

# 2. Upload dist/* ke public_html/
#    (overwrite existing files)
```

### Update Backend:
```bash
# Upload file PHP yang diubah ke public_html/php_server/
# Tidak perlu restart, langsung aktif
```

### Update Database:
```sql
-- Via phpMyAdmin, jalankan query SQL yang diperlukan
-- ATAU import file .sql baru (backup dulu!)
```

---

## 📚 Additional Resources

- **cPanel Documentation:** cPanel docs dari hosting provider Anda
- **SSL Setup:** Let's Encrypt via cPanel (gratis)
- **PHP Settings:** PHP Selector di cPanel untuk adjust memory/upload limits
- **Backup:** cPanel Backup untuk download full backup

---

## 🆘 Support

Jika masih ada masalah:

1. Check error logs:
   - `public_html/php_server/php_error.log`
   - cPanel → Errors (Apache error log)

2. Test components separately:
   - Backend API langsung via browser
   - Frontend static files via browser

3. Contact hosting support jika:
   - mod_rewrite tidak aktif
   - PHP version issues
   - Permission issues

---

**✅ Deployment Complete!**

**Access:** `https://yourdomain.com/`
