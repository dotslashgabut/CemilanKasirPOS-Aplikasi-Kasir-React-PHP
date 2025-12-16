<?php
require_once 'config.php';
require_once 'auth.php';
require_once 'validator.php';
require_once 'logic.php';

// CORS Headers
// CORS Headers are handled in config.php

// Handle Preflight Options Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Helper function to get JSON input
function getJsonInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    return $input;
}

// Helper function to send JSON response
function sendJson($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// Parse Request
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remove script name from URI to get path
// e.g. /app/api/products -> /api/products
$path = str_replace(dirname($scriptName), '', $requestUri);
// Remove query string
$path = parse_url($path, PHP_URL_PATH);
// Remove leading/trailing slashes
$path = trim($path, '/');

// Simple Router
// Expected format: api/{resource}/{id}
$parts = explode('/', $path);

// If path starts with index.php, shift it off (in case of no rewrite)
if (isset($parts[0]) && $parts[0] === 'index.php') {
    array_shift($parts);
}

// Check for 'api' prefix
if (isset($parts[0]) && $parts[0] === 'api') {
    array_shift($parts);
}

$resource = $parts[0] ?? null;
$id = $parts[1] ?? null;

// Handle Login Route
if ($resource === 'login') {
    require 'login.php';
    exit();
}

// Map resources to table names
$tableMap = [
    'products' => 'products',
    'categories' => 'categories',
    'customers' => 'customers',
    'suppliers' => 'suppliers',
    'transactions' => 'transactions',
    'purchases' => 'purchases',
    'cashflow' => 'cashflows',
    'users' => 'users',
    'banks' => 'bankaccounts',
    'store_settings' => 'storesettings'
];

if (!$resource || !array_key_exists($resource, $tableMap)) {
    sendJson(['error' => 'Resource not found'], 404);
}

$tableName = $tableMap[$resource];

// Schema Definitions (Allowed Columns)
$schemas = [
    'storesettings' => ['id', 'name', 'jargon', 'address', 'phone', 'bankAccount', 'footerMessage', 'notes', 'showAddress', 'showPhone', 'showJargon', 'showBank', 'printerType', 'createdAt', 'updatedAt'],
    'bankaccounts' => ['id', 'bankName', 'accountNumber', 'holderName', 'createdAt', 'updatedAt'],
    'users' => ['id', 'name', 'username', 'password', 'role', 'image', 'createdAt', 'updatedAt'],
    'products' => ['id', 'name', 'sku', 'categoryId', 'categoryName', 'stock', 'hpp', 'priceRetail', 'priceGeneral', 'priceWholesale', 'pricePromo', 'image', 'createdAt', 'updatedAt'],
    'categories' => ['id', 'name', 'createdAt', 'updatedAt'],
    'customers' => ['id', 'name', 'phone', 'address', 'image', 'defaultPriceType', 'createdAt', 'updatedAt'],
    'suppliers' => ['id', 'name', 'phone', 'address', 'image', 'createdAt', 'updatedAt'],
    'transactions' => ['id', 'type', 'originalTransactionId', 'date', 'items', 'totalAmount', 'amountPaid', 'change', 'paymentStatus', 'paymentMethod', 'paymentNote', 'bankId', 'bankName', 'customerId', 'customerName', 'cashierId', 'cashierName', 'paymentHistory', 'isReturned', 'createdAt', 'updatedAt'],
    'purchases' => ['id', 'type', 'originalPurchaseId', 'date', 'supplierId', 'supplierName', 'description', 'items', 'totalAmount', 'amountPaid', 'paymentStatus', 'paymentMethod', 'bankId', 'bankName', 'paymentHistory', 'isReturned', 'userId', 'userName', 'createdAt', 'updatedAt'],
    'cashflows' => ['id', 'date', 'type', 'amount', 'category', 'description', 'paymentMethod', 'bankId', 'bankName', 'userId', 'userName', 'referenceId', 'createdAt', 'updatedAt']
];

// Helper to filter data against schema
function filterDataBySchema($data, $tableName, $schemas) {
    if (!isset($schemas[$tableName])) return $data; // Fallback if no schema defined
    
    $allowed = $schemas[$tableName];
    $filtered = [];
    foreach ($data as $key => $value) {
        if (in_array($key, $allowed)) {
            $filtered[$key] = $value;
        }
    }
    return $filtered;
}

// Handle Batch Insert
if ($id === 'batch' && $method === 'POST') {
    // Require authentication for batch operations
    $currentUser = requireAuth();
    
    // Cashiers cannot perform batch operations on restricted resources
    if ($currentUser['role'] === ROLE_CASHIER) {
        $restrictedResources = ['products', 'categories', 'customers', 'suppliers', 'users', 'store_settings'];
        if (in_array($resource, $restrictedResources)) {
            sendJson(['error' => 'Access denied. Cashiers cannot perform batch operations on this resource.'], 403);
        }
    }
    
    $items = getJsonInput();
    if (!is_array($items)) {
        sendJson(['error' => 'Body must be an array'], 400);
    }

    try {
        $pdo->beginTransaction();
        foreach ($items as $item) {
            if (!is_array($item)) continue;

            // Prepare columns and values
            // Handle JSON fields and Sanitize
            foreach ($item as $key => $value) {
                if (is_array($value)) {
                    $item[$key] = json_encode($value);
                } elseif (is_string($value)) {
                    $item[$key] = strip_tags($value);
                } elseif (is_bool($value)) {
                    $item[$key] = $value ? 1 : 0;
                }
            }

            // Add timestamps if missing
            if (!isset($item['createdAt'])) $item['createdAt'] = date('Y-m-d H:i:s');
            if (!isset($item['updatedAt'])) $item['updatedAt'] = date('Y-m-d H:i:s');

            // Filter by schema
            $item = filterDataBySchema($item, $tableName, $schemas);

            // Re-calculate columns after filtering
            $columns = array_keys($item);
            $quotedColumns = array_map(function($col) { return "`$col`"; }, $columns);
            $placeholders = array_map(function($col) { return ":$col"; }, $columns);

            // Validate Input (Fix P9: Batch Insert Validation Bypass)
            $validationErrors = validateInput($resource, $item);
            if (!empty($validationErrors)) {
                // In batch, we might want to skip invalid items or fail the whole batch.
                // For data integrity, failing the batch is safer.
                throw new Exception("Validation failed for item: " . json_encode($validationErrors));
            }

            // Validate columns
            foreach ($columns as $col) {
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $col)) {
                    sendJson(['error' => "Invalid column name: $col"], 400);
                }
            }

            // Upsert Logic (INSERT ... ON DUPLICATE KEY UPDATE)
            $updateParts = [];
            foreach ($columns as $col) {
                if ($col !== 'id') { // Don't update ID
                    $updateParts[] = "`$col` = VALUES(`$col`)";
                }
            }
            $updateSql = implode(', ', $updateParts);

            $sql = "INSERT INTO $tableName (" . implode(', ', $quotedColumns) . ") 
                    VALUES (" . implode(', ', $placeholders) . ") 
                    ON DUPLICATE KEY UPDATE $updateSql";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($item);
        }
        $pdo->commit();
        sendJson(['message' => 'Batch processed successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "Batch Error: " . $e->getMessage() . "\n", FILE_APPEND);
        sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
    }
}



// Handle CRUD
switch ($method) {
    case 'GET':
        // Require authentication for ALL GET requests to protect all data
        // (products, customers, suppliers, transactions, purchases, banks, etc.)
        $currentUser = requireAuth();

        if ($id) {
            // Get One
            
            // RBAC: Only SUPERADMIN can view user details
            if ($resource === 'users' && $currentUser['role'] !== ROLE_SUPERADMIN) {
                 // Allow users to view their own profile
                 if ($id !== $currentUser['id']) {
                    sendJson(['error' => 'Access denied'], 403);
                 }
            }

            $stmt = null;
            if ($currentUser['role'] === ROLE_CASHIER) {
                 if ($resource === 'transactions') {
                     $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE id = ? AND cashierId = ?");
                     $stmt->execute([$id, $currentUser['id']]);
                 } elseif ($resource === 'purchases') {
                     $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE id = ? AND userId = ?");
                     $stmt->execute([$id, $currentUser['id']]);
                 } elseif ($resource === 'cashflows') {
                     $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE id = ? AND userId = ?");
                     $stmt->execute([$id, $currentUser['id']]);
                 }
            }
            
            if (!$stmt) {
                $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE id = ?");
                $stmt->execute([$id]);
            }
            
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($item) {
                // Remove password from user response
                if ($resource === 'users') {
                    unset($item['password']);
                }

                // Decode JSON fields if any
                foreach ($item as $key => $value) {
                    if (is_string($value) && ($value[0] === '[' || $value[0] === '{')) {
                        $decoded = json_decode($value, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            $item[$key] = $decoded;
                        }
                    }
                }
                sendJson($item);
            } else {
                sendJson(['error' => 'Not found'], 404);
            }
        } else {
            // Get All
            
            // RBAC: Only SUPERADMIN can view user list
            if ($resource === 'users' && $currentUser['role'] !== ROLE_SUPERADMIN) {
                sendJson(['error' => 'Access denied'], 403);
            }

            $sql = "SELECT * FROM $tableName";
            $params = [];

            // FILTER FOR CASHIER: Only show their own data for financial tables
            if ($currentUser['role'] === ROLE_CASHIER) {
                if ($resource === 'transactions') {
                    $sql .= " WHERE cashierId = ?";
                    $params[] = $currentUser['id'];
                } elseif ($resource === 'purchases') {
                    $sql .= " WHERE userId = ?";
                    $params[] = $currentUser['id'];
                } elseif ($resource === 'cashflows') {
                    $sql .= " WHERE userId = ?";
                    $params[] = $currentUser['id'];
                }
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decode JSON fields
            foreach ($items as &$item) {
                // Remove password from user response
                if ($resource === 'users') {
                    unset($item['password']);
                }

                foreach ($item as $key => $value) {
                    if (is_string($value) && !empty($value) && ($value[0] === '[' || $value[0] === '{')) {
                        $decoded = json_decode($value, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            $item[$key] = $decoded;
                        }
                    }
                }
            }
            sendJson($items);
        }
        break;

    case 'POST':
        // Require authentication for all POST operations
        $currentUser = requireAuth();
        
        // Special handling for 'users' resource - only SUPERADMIN can create users
        if ($resource === 'users') {
            requireRole([ROLE_SUPERADMIN]);
        }
        
        // Cashiers cannot create/modify master data or financial data
        if ($currentUser['role'] === ROLE_CASHIER) {
            $restrictedResources = ['products', 'categories', 'customers', 'suppliers', 'users', 'store_settings'];
            if (in_array($resource, $restrictedResources)) {
                sendJson(['error' => 'Access denied. Cashiers can only process transactions.'], 403);
            }
        }
        
        $data = getJsonInput();
        if (!is_array($data)) {
            sendJson(['error' => 'Invalid JSON'], 400);
        }

        // INPUT VALIDATION
        $validationErrors = validateInput($resource, $data);
        if (!empty($validationErrors)) {
            sendJson(['error' => 'Validation failed', 'details' => $validationErrors], 400);
        }

        // --- Custom Logic for Transactions and Purchases ---
        if ($resource === 'transactions') {
            handleTransactionCreate($pdo, $data, $currentUser);
            exit(); // handleTransactionCreate sends response and exits
        }
        if ($resource === 'purchases') {
            handlePurchaseCreate($pdo, $data, $currentUser);
            exit(); // handlePurchaseCreate sends response and exits
        }
        // ---------------------------------------------------

        $columns = array_keys($data);
        
        // Handle JSON fields
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = json_encode($value);
            }
        }
        
        // Add timestamps if missing
        if (!in_array('createdAt', $columns)) {
            $data['createdAt'] = date('Y-m-d H:i:s');
        }
        if (!in_array('updatedAt', $columns)) {
            $data['updatedAt'] = date('Y-m-d H:i:s');
        }

        // Hash password for users
        if ($resource === 'users' && isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        // FILTER DATA BY SCHEMA
        $data = filterDataBySchema($data, $tableName, $schemas);
        
        // Convert booleans to integers for MySQL (TINYINT)
        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $data[$key] = $value ? 1 : 0;
            }
        }
        
        $columns = array_keys($data);

        // Validate columns to prevent SQL injection via column names
        foreach ($columns as $col) {
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $col)) {
                sendJson(['error' => "Invalid column name: $col"], 400);
            }
        }

        // Sanitize string inputs to prevent XSS
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = strip_tags($value);
            }
        }
        
        // Re-map columns and placeholders
        $quotedColumns = array_map(function($col) { return "`$col`"; }, $columns);
        $placeholders = array_map(function($col) { return ":$col"; }, $columns);

        $sql = "INSERT INTO $tableName (" . implode(', ', $quotedColumns) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($data);
            sendJson($data, 201);
        } catch (Exception $e) {
            file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "POST Error ($tableName): " . $e->getMessage() . "\n", FILE_APPEND);
            sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
        }
        break;

    case 'PUT':
        // Require authentication for all PUT operations
        $currentUser = requireAuth();
        
        // Special handling for 'users' resource - only SUPERADMIN can update users
        if ($resource === 'users') {
            requireRole([ROLE_SUPERADMIN]);
        }
        
        // Cashiers cannot modify master data or settings
        if ($currentUser['role'] === ROLE_CASHIER) {
            $restrictedResources = ['products', 'categories', 'customers', 'suppliers', 'users', 'store_settings'];
            if (in_array($resource, $restrictedResources)) {
                sendJson(['error' => 'Access denied. Cashiers can only process transactions.'], 403);
            }
        }
        
        if (!$id) sendJson(['error' => 'ID required'], 400);
        
        $data = getJsonInput();
        if (!is_array($data)) {
            sendJson(['error' => 'Invalid JSON'], 400);
        }

        // INPUT VALIDATION
        $validationErrors = validateInput($resource, $data);
        if (!empty($validationErrors)) {
            sendJson(['error' => 'Validation failed', 'details' => $validationErrors], 400);
        }
        
        // Check if record exists first
        $checkStmt = $pdo->prepare("SELECT id FROM $tableName WHERE id = ?");
        $checkStmt->execute([$id]);
        if ($checkStmt->rowCount() === 0) {
            sendJson(['error' => 'Not found'], 404);
        }
        
        // Handle JSON fields and Sanitize
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = json_encode($value);
            } elseif (is_string($value)) {
                $data[$key] = strip_tags($value);
            }
        }

        // Validate columns
        foreach (array_keys($data) as $col) {
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $col)) {
                sendJson(['error' => "Invalid column name: $col"], 400);
            }
        }

        // Update timestamp
        if (!array_key_exists('updatedAt', $data)) {
            $data['updatedAt'] = date('Y-m-d H:i:s');
        }

        // Hash password for users
        if ($resource === 'users' && isset($data['password'])) {
            if (!empty($data['password'])) {
                 $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
            } else {
                unset($data['password']); // Don't update if empty
            }
        }

        // FILTER DATA BY SCHEMA
        $data = filterDataBySchema($data, $tableName, $schemas);
        
        // Convert booleans to integers for MySQL (TINYINT)
        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $data[$key] = $value ? 1 : 0;
            }
        }

        $setParts = [];
        foreach (array_keys($data) as $col) {
            $setParts[] = "`$col` = :$col";
        }

        $sql = "UPDATE $tableName SET " . implode(', ', $setParts) . " WHERE id = :id_param";
        $data['id_param'] = $id;

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($data);
            sendJson(['message' => 'Updated successfully']);
        } catch (Exception $e) {
            sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
        }
        break;

    case 'DELETE':
        // Require authentication for all DELETE operations
        $currentUser = requireAuth();
        
        // Special handling for 'users' resource - only SUPERADMIN can delete users
        if ($resource === 'users') {
            requireRole([ROLE_SUPERADMIN]);
        }
        
        // Only SUPERADMIN and OWNER can delete financial data (for data safety)
        if (in_array($resource, ['transactions', 'purchases', 'cashflow'])) {
            requireRole([ROLE_SUPERADMIN, ROLE_OWNER]);
        }
        
        // Cashiers cannot delete master data
        if ($currentUser['role'] === ROLE_CASHIER) {
            $restrictedResources = ['products', 'categories', 'customers', 'suppliers', 'users', 'store_settings', 'banks'];
            if (in_array($resource, $restrictedResources)) {
                sendJson(['error' => 'Access denied. Cashiers cannot delete data.'], 403);
            }
        }
        
        if (!$id) sendJson(['error' => 'ID required'], 400);

        // Handle RESET (Delete All)
        if ($id === 'reset') {
            // DOUBLE CHECK: Only SUPERADMIN can reset data
            requireRole([ROLE_SUPERADMIN]);

            try {
                $stmt = $pdo->prepare("DELETE FROM $tableName");
                $stmt->execute();
                sendJson(['message' => "All data in $resource has been reset successfully."]);
            } catch (Exception $e) {
                sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
            }
            exit();
        }
        
        // --- Custom Logic for Transactions and Purchases ---
        if ($resource === 'transactions') {
            handleTransactionDelete($pdo, $id);
            exit(); // handleTransactionDelete sends response and exits
        }
        if ($resource === 'purchases') {
            handlePurchaseDelete($pdo, $id);
            exit(); // handlePurchaseDelete sends response and exits
        }
        // ---------------------------------------------------

        try {
            $stmt = $pdo->prepare("DELETE FROM $tableName WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() > 0) {
                http_response_code(204);
                exit();
            } else {
                sendJson(['error' => 'Not found'], 404);
            }
        } catch (Exception $e) {
            sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
