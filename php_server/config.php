<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'cemilan_app_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// CORS Settings
// CORS Settings
// Allow all origins for flexibility (Dev/Prod/Hosting)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Always set CORS headers
header("Access-Control-Allow-Origin: " . ($origin ? $origin : '*'));
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Preflight Options Request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Security Headers
if (isset($_SERVER['REQUEST_METHOD'])) {
    header("X-Frame-Options: DENY");
    header("X-Content-Type-Options: nosniff");
    header("X-XSS-Protection: 1; mode=block");
    // header("Strict-Transport-Security: max-age=31536000; includeSubDomains"); // Enable if using HTTPS

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Database Connection
try {
    // Check if PDO MySQL driver is available
    if (!extension_loaded('pdo_mysql')) {
        throw new PDOException('PDO MySQL driver is not installed. Please install php-mysql extension.');
    }
    
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $pdo->exec("SET NAMES utf8mb4");
} catch(PDOException $exception) {
    $errorMsg = "DB Connection Error: " . $exception->getMessage();
    file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . $errorMsg . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode([
        "error" => "Database connection failed.",
        "details" => $exception->getMessage()
    ]);
    exit();
}
?>
