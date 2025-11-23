<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'cemilankasirpos');
define('DB_USER', 'root');
define('DB_PASS', '');

// CORS Settings
// CORS Settings
$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Default for tools like Postman or direct browser access if not in list (optional, or strict block)
    // header("Access-Control-Allow-Origin: *"); // Keep commented out for security
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
// Security Headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
// header("Strict-Transport-Security: max-age=31536000; includeSubDomains"); // Enable if using HTTPS

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("set names utf8");
} catch(PDOException $exception) {
    file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "DB Connection Error: " . $exception->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(["error" => "Connection error: " . $exception->getMessage()]);
    exit();
}
?>
