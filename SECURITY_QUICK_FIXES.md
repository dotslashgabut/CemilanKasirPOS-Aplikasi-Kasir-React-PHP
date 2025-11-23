# 🛡️ QUICK SECURITY FIXES

Panduan cepat untuk memperbaiki kerentanan kritis aplikasi.

---
 
 ## 🚨 FIX 0: Secure Login Flow (CRITICAL) ✅ DONE
 
 **Masalah:** Login dilakukan di browser (Client-Side), password terekspos!
 
 **Langkah 1: Buat `php_server/login.php`**
 ```php
 <?php
 require_once 'config.php';
 require_once 'auth.php';
 
 if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
     http_response_code(405);
     exit();
 }
 
 $input = json_decode(file_get_contents('php://input'), true);
 $username = $input['username'] ?? '';
 $password = $input['password'] ?? '';
 
 $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
 $stmt->execute([$username]);
 $user = $stmt->fetch(PDO::FETCH_ASSOC);
 
 // Note: Untuk saat ini masih plain text, nanti upgrade ke password_verify()
 if ($user && $user['password'] === $password) {
     unset($user['password']); // Jangan kirim password balik
     $token = base64_encode(json_encode($user)); // Temporary Token
     echo json_encode(['token' => $token, 'user' => $user]);
 } else {
     http_response_code(401);
     echo json_encode(['error' => 'Invalid credentials']);
 }
 ?>
 ```
 
 **Langkah 2: Update `php_server/index.php`**
 Tambahkan route login:
 ```php
 // ... inside router ...
 if ($resource === 'login') {
     require 'login.php';
     exit();
 }
 ```
 
 **Langkah 3: Update `App.tsx`**
 Ganti logic `handleLogin`:
 ```typescript
 const res = await fetch(`${API_URL}/login`, {
     method: 'POST',
     body: JSON.stringify({ username, password })
 });
 if (res.ok) {
     const data = await res.json();
     localStorage.setItem('pos_token', data.token);
     // ... login success
 }
 ```
 
 ---

## 1️⃣ FIX: CORS Policy (5 menit) ⚡

**File:** `php_server/config.php`

**Ganti baris 9:**
```php
// SEBELUM (BAHAYA!)
header("Access-Control-Allow-Origin: *");

// SESUDAH (AMAN)
$allowed_origins = [
    'http://localhost:5173',  // Development
    'http://127.0.0.1:5173',  // Development
    // Untuk production, ganti dengan domain Anda:
    // 'https://yourdomain.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    http_response_code(403);
    echo json_encode(['error' => 'CORS policy: Origin not allowed']);
    exit();
}
```

---

## 2️⃣ FIX: Database Credentials (5 menit) ⚡

**File:** `php_server/config.php`

**Ganti baris 3-6:**
```php
// SEBELUM (Hard-coded)
define('DB_HOST', 'localhost');
define('DB_NAME', 'cemilankasirpos');
define('DB_USER', 'root');
define('DB_PASS', '');

// SESUDAH (Environment variables)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'cemilankasirpos');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
```

**Buat file:** `.env` (di root folder)
```env
DB_HOST=localhost
DB_NAME=cemilankasirpos
DB_USER=root
DB_PASS=
```

**Tambahkan ke `.gitignore`:**
```
.env
```

---

## 3️⃣ FIX: Protect GET Endpoints (10 menit) 🔒

**File:** `php_server/index.php`

**Tambahkan auth untuk data sensitif:**
```php
case 'GET':
    // Protect financial & sensitive data
    $protectedResources = ['transactions', 'purchases', 'cashflow', 'users'];
    
    if (in_array($resource, $protectedResources)) {
        $currentUser = requireAuth();
    }
    
    // Rest of your GET code...
```

---

## 4️⃣ FIX: Add Security Headers (5 menit) 🛡️

**File:** `php_server/config.php`

**Tambahkan setelah CORS headers:**
```php
// Security Headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Permissions-Policy: geolocation=(), microphone=(), camera=()");

// Content Security Policy (adjust as needed)
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
```

---

## 5️⃣ FIX: Add Input Validation (15 menit) ✅

**File:** `php_server/index.php`

**Tambahkan helper function di awal file:**
```php
// Input Sanitization
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Validate Email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Validate Number
function isValidNumber($number) {
    return is_numeric($number) && $number >= 0;
}
```

**Gunakan saat meng-handle input:**
```php
case 'POST':
    $input = getJsonInput();
    
    // Sanitize semua input
    $input = sanitizeInput($input);
    
    // Validate specific fields
    if ($resource === 'products') {
        if (!isset($input['name']) || empty($input['name'])) {
            sendJson(['error' => 'Product name required'], 400);
        }
        if (!isValidNumber($input['price'])) {
            sendJson(['error' => 'Invalid price'], 400);
        }
    }
```

---

## 6️⃣ BONUS: Add Error Logging (10 menit) 📝

**File:** `php_server/config.php`

**Tambahkan custom error handler:**
```php
// Error Logging
function logError($message, $context = []) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    
    if (!empty($context)) {
        $logMessage .= " | Context: " . json_encode($context);
    }
    
    error_log($logMessage . "\n", 3, __DIR__ . '/app_error.log');
}

// Handle errors gracefully
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    logError("PHP Error: $errstr", [
        'file' => $errfile,
        'line' => $errline,
        'type' => $errno
    ]);
    
    // Don't expose error details to user
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    exit();
});
```

**Tambahkan ke `.gitignore`:**
```
app_error.log
php_error.log
```

---

## 🎯 TESTING

Setelah implementasi, test dengan:

### 1. Test CORS
```bash
curl -H "Origin: http://evil.com" http://localhost/api/products
# Should return 403 Forbidden
```

### 2. Test Auth
```bash
curl http://localhost/api/transactions
# Should return 401 Unauthorized
```

### 3. Test Input Validation
```bash
curl -X POST http://localhost/api/products -d '{"name":"<script>alert(1)</script>"}' -H "Content-Type: application/json"
# Should sanitize the script tag
```

---

## ⏱️ TOTAL TIME: ~50 menit

Implementasi 6 fixes di atas akan meningkatkan keamanan aplikasi dari:
- 🔴 **Level 2/10** → 🟡 **Level 6/10**

Untuk level 10/10, masih perlu:
- JWT Authentication
- Password Hashing
- Rate Limiting
- HTTPS Enforcement

---

## 📋 CHECKLIST

Centang setelah selesai:
- [ ] CORS Policy fixed
- [ ] Database credentials to .env
- [ ] GET endpoints protected
- [ ] Security headers added
- [ ] Input validation implemented
- [ ] Error logging added
- [ ] Tested all fixes

---

**Selamat mengamankan aplikasi! 🛡️**
