<?php
// Load .env file if exists
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^"(.*)"$/', $value, $matches)) {
                $value = $matches[1];
            } elseif (preg_match("/^'(.*)'$/", $value, $matches)) {
                $value = $matches[1];
            }

            // Handle booleans
            if (strtolower($value) === 'true') $value = true;
            if (strtolower($value) === 'false') $value = false;
            
            // Set as constant if not already defined
            if (!defined($key)) {
                define($key, $value);
            }
        }
    }
}

// Load .env from current directory
loadEnv(__DIR__ . '/.env');

// Database Configuration with fallback to defaults
if (!defined('SHOW_DEBUG_ERRORS')) define('SHOW_DEBUG_ERRORS', false);

// Configure Error Reporting based on debug mode
if (SHOW_DEBUG_ERRORS) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ALL);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/php_error.log');
}

if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', 'cemilankasirpos_php_v02');
if (!defined('DB_USER')) define('DB_USER', 'root');
if (!defined('DB_PASS')) define('DB_PASS', '');

// CORS Settings
// Allow specific origins if defined in .env, otherwise default to * (Dev only)
$allowedOriginsEnv = getenv('ALLOWED_ORIGINS');
$allowedOrigins = $allowedOriginsEnv ? explode(',', $allowedOriginsEnv) : [];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (!empty($allowedOrigins) && in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback logic
    if (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) {
        // Development: Allow dynamic origin for convenience
        if ($origin) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            header("Access-Control-Allow-Origin: *");
        }
    } else {
        // Production: Strict Security
        // If the origin is not in ALLOWED_ORIGINS, we return '*'
        // Note: Browsers will BLOCK requests because we also send 'Access-Control-Allow-Credentials: true'
        // This is the desired secure behavior (fail-safe).
        header("Access-Control-Allow-Origin: *"); 
    }
}

header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Preflight Options Request immediately
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Security Headers
if (isset($_SERVER['REQUEST_METHOD'])) {
    header("X-Frame-Options: DENY");
    header("X-Content-Type-Options: nosniff");
    header("X-XSS-Protection: 1; mode=block");
    
    // HSTS (HTTP Strict Transport Security)
    // Enabled by default for security. Ensure your server supports HTTPS.
    // If you are on localhost without SSL, this might be ignored by browsers or cause issues if you forced it previously.
    // Recommended for Production.
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
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
    
    // CLI Friendly Error
    if (php_sapi_name() === 'cli') {
        echo "Database connection failed: " . $exception->getMessage() . "\n";
        exit(1);
    }

    http_response_code(500);
    
    // Hide detailed errors in production
    $response = ["error" => "Database connection failed."];
    if (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) {
        $response['details'] = $exception->getMessage();
    }
    
    echo json_encode($response);
    exit();
}
?>
