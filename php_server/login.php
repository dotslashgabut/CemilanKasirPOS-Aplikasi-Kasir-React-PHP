<?php
require_once 'config.php';
require_once 'auth.php';
require_once 'rate_limit.php';

// Handle Preflight Options Request (in case it hits this file directly, though index.php usually handles it)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// 1. Check Rate Limit
$ip = $_SERVER['REMOTE_ADDR'];
$limitCheck = checkLoginRateLimit($ip);
if (!$limitCheck['allowed']) {
    http_response_code(429); // Too Many Requests
    echo json_encode(['error' => $limitCheck['message']]);
    exit();
}

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password are required']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify password hash
    if ($user && password_verify($password, $user['password'])) {
        // Remove sensitive data
        unset($user['password']);
        
        // Generate JWT Token
        $token = generateJWT($user);
        
        // Reset rate limit on successful login
        resetLoginRateLimit($ip);
        
        echo json_encode([
            'token' => $token,
            'user' => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Username atau password salah']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "Login Error: " . $e->getMessage() . "\n", FILE_APPEND);
}
?>
