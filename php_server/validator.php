<?php
function validateInput($resource, $data) {
    $errors = [];

    // Common validations
    if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format";
    }

    // Resource-specific validations
    switch ($resource) {
        case 'users':
            if (isset($data['username']) && !preg_match('/^[a-zA-Z0-9_]{3,20}$/', $data['username'])) {
                $errors[] = "Username must be 3-20 alphanumeric characters or underscores";
            }
            if (isset($data['password']) && strlen($data['password']) < 6) {
                $errors[] = "Password must be at least 6 characters";
            }
            break;

        case 'products':
            if (isset($data['priceRetail']) && (!is_numeric($data['priceRetail']) || $data['priceRetail'] < 0)) {
                $errors[] = "Retail price must be a positive number";
            }
            if (isset($data['stock']) && !is_numeric($data['stock'])) {
                $errors[] = "Stock must be a number";
            }
            break;

        case 'customers':
        case 'suppliers':
            if (!empty($data['phone']) && !preg_match('/^[0-9\-\+\(\)\s]{5,20}$/', $data['phone'])) {
                $errors[] = "Invalid phone number format";
            }
            break;
            
        case 'transactions':
            if (isset($data['totalAmount'])) {
                if (!is_numeric($data['totalAmount'])) {
                    $errors[] = "Total amount must be a number";
                } elseif ((!isset($data['type']) || $data['type'] !== 'RETURN') && $data['totalAmount'] < 0) {
                    $errors[] = "Total amount must be a positive number";
                }
            }
            break;
    }

    return $errors;
}
?>
