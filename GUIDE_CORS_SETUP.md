# CORS Setup Guide for PHP Backend

This guide explains how Cross-Origin Resource Sharing (CORS) is handled in this project and how to troubleshoot issues when running in different environments (Development, Production, Hosting).

## Overview

The backend uses a **permissive CORS policy** by default to ensure compatibility across various setups (Localhost, XAMPP, Laragon, Shared Hosting, VPS).

This means:
1.  **Any Origin is Allowed**: The backend reflects the `Origin` header sent by the client.
2.  **Credentials are Allowed**: `Access-Control-Allow-Credentials: true` is set to support cookies/sessions if needed (though this app primarily uses Bearer tokens).
3.  **Preflight Requests (OPTIONS)**: Are handled automatically with a `200 OK` status.

## Configuration File

The CORS logic is located in:
`php_server/config.php`

### Current Implementation

```php
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
```

## Deployment Scenarios

### 1. Local Development (Vite + PHP)
*   **Frontend**: `http://localhost:5173`
*   **Backend**: `http://localhost:8000` (or similar)
*   **Status**: **Works out of the box.** The backend will see the request coming from port 5173 and allow it.

### 2. Local Production (XAMPP / Laragon)
*   **Frontend**: Served via `dist/` or virtual host (e.g., `http://cemilan-app.test`)
*   **Backend**: Served via same or different virtual host.
*   **Status**: **Works out of the box.** Even if served from the same domain, the headers are compatible.

### 3. Shared Hosting / VPS (cPanel, etc.)
*   **Frontend**: `https://yourdomain.com`
*   **Backend**: `https://api.yourdomain.com` or `https://yourdomain.com/api`
*   **Status**: **Works out of the box.** The backend will accept requests from your frontend domain.

## Troubleshooting

If you still encounter CORS errors (e.g., "Network Error", "CORS policy blocked"):

1.  **Check PHP Errors**: Ensure `php_server/php_error.log` doesn't have syntax errors. A PHP fatal error before headers are sent will cause a CORS error because the headers won't be present in the 500 response.
2.  **Check Web Server Config**:
    *   **Apache (.htaccess)**: Ensure `.htaccess` allows headers. The provided `.htaccess` has static CORS headers commented out to avoid conflicts with PHP. If you uncomment them, you might get duplicate header errors.
    *   **Nginx**: If using Nginx, you might need to add CORS headers in the Nginx config if PHP is not handling them correctly or if Nginx is blocking them.
3.  **Browser Cache**: Clear your browser cache or try Incognito mode. Preflight responses are cached (`Access-Control-Max-Age`).

## Security Note

The current configuration is **permissive** (`*` or reflected origin).
*   **For Public APIs**: This is generally fine.
*   **For Strict Enterprise Security**: You may want to restrict `$origin` to a specific list of allowed domains in `config.php` before deploying to a sensitive production environment.

Example of strict restriction:
```php
$allowed_origins = ['https://your-production-domain.com'];
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Block or don't send headers
}
```
