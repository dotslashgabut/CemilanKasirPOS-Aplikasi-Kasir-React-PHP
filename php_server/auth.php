<?php
// Simple Authentication Middleware for PHP API
// This uses a simple token-based auth stored in localStorage on frontend

// JWT Secret Key (Change this in production!)
// JWT Secret Key
// In production, this MUST be set in environment variables.
$jwt_secret = getenv('JWT_SECRET');

if (!$jwt_secret) {
    // Default for Development ONLY
    if (defined('SHOW_DEBUG_ERRORS') && !SHOW_DEBUG_ERRORS) {
        // In production (debug off), we should ideally fail if no secret is set
        // But to prevent breaking existing setups without .env, we'll use a fallback but log a critical warning
        error_log("CRITICAL SECURITY WARNING: Using default JWT secret in production. Please set JWT_SECRET in .env!");
    }
    $jwt_secret = 'rahasia_dapur_cemilan_kasirpos_2025_secure_key_backend_php_dev_fallback';
}

define('JWT_SECRET', $jwt_secret);

// Helper: URL Safe Base64 Encode
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

// Helper: URL Safe Base64 Decode
function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

// Generate JWT Token
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // Add expiration if not present (default 24 hours)
    if (!isset($payload['exp'])) {
        $payload['exp'] = time() + (24 * 60 * 60);
    }
    
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

// Verify JWT Token
function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    list($base64Header, $base64Payload, $base64Signature) = $parts;
    
    $signature = base64UrlDecode($base64Signature);
    $expectedSignature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return null; // Invalid signature
    }
    
    $payload = json_decode(base64UrlDecode($base64Payload), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null; // Expired
    }
    
    return $payload;
}

function getUserFromRequest() {
    // 1. Check HttpOnly Cookie (Priority for Security)
    if (isset($_COOKIE['pos_token']) && !empty($_COOKIE['pos_token'])) {
        return verifyJWT($_COOKIE['pos_token']);
    }

    // 2. Fallback: Check Authorization Header (For legacy or non-browser clients)
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!empty($authHeader) && strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        return verifyJWT($token);
    }
    
    return null;
}

function requireAuth() {
    $user = getUserFromRequest();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Invalid or expired token.']);
        exit();
    }
    return $user;
}

function requireRole($allowedRoles) {
    $user = requireAuth();
    
    if (!in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. Insufficient permissions.']);
        exit();
    }
    
    return $user;
}

// Define role constants
define('ROLE_SUPERADMIN', 'SUPERADMIN');
define('ROLE_OWNER', 'OWNER');
define('ROLE_CASHIER', 'CASHIER');

?>
