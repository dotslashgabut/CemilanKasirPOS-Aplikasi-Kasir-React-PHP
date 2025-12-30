<?php
require_once 'config.php';

// Handle Preflight Options
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Clear the cookie by setting expiration in the past
// Must match the path and domain options used in setcookie
setcookie('pos_token', '', [
    'expires' => time() - 3600,
    'path' => '/',
    'samesite' => 'Strict', // or Lax
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true
]);

echo json_encode(['message' => 'Logged out successfully']);
?>
