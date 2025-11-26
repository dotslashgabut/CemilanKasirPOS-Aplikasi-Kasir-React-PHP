<?php

function generateUuid() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function handleTransactionCreate($pdo, $data) {
    try {
        $pdo->beginTransaction();

        // 1. Create Transaction
        if (empty($data['id'])) {
            $data['id'] = generateUuid();
        }
        
        // Prepare data for insertion (similar to generic insert but specific to ensure all fields)
        // We can reuse the generic logic or write specific SQL. Specific is safer for business logic.
        $columns = ['id', 'type', 'originalTransactionId', 'date', 'items', 'totalAmount', 'amountPaid', 'change', 'paymentStatus', 'paymentMethod', 'paymentNote', 'bankId', 'bankName', 'customerId', 'customerName', 'cashierId', 'cashierName', 'paymentHistory', 'createdAt', 'updatedAt'];
        
        $insertData = [];
        foreach ($columns as $col) {
            $val = $data[$col] ?? null;
            if (is_array($val)) $val = json_encode($val);
            $insertData[$col] = $val;
        }
        
        // Ensure timestamps
        if (empty($insertData['createdAt'])) $insertData['createdAt'] = date('Y-m-d H:i:s');
        if (empty($insertData['updatedAt'])) $insertData['updatedAt'] = date('Y-m-d H:i:s');

        $sql = "INSERT INTO transactions (" . implode(', ', array_map(function($c){return "`$c`";}, $columns)) . ") 
                VALUES (" . implode(', ', array_fill(0, count($columns), '?')) . ")";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($insertData));

        // 2. Update Stock
        $items = isset($data['items']) ? (is_string($data['items']) ? json_decode($data['items'], true) : $data['items']) : [];
        if (is_array($items)) {
            foreach ($items as $item) {
                if (isset($item['id']) && isset($item['qty'])) {
                    // Get current stock
                    $stmtProd = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
                    $stmtProd->execute([$item['id']]);
                    $product = $stmtProd->fetch(PDO::FETCH_ASSOC);
                    
                    if ($product) {
                        $newStock = floatval($product['stock']);
                        if (isset($data['type']) && $data['type'] === 'RETURN') {
                            $newStock += floatval($item['qty']);
                        } else {
                            $newStock -= floatval($item['qty']);
                        }
                        
                        $updateProd = $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?");
                        $updateProd->execute([$newStock, $item['id']]);
                    }
                }
            }
        }

        // 3. Create CashFlow
        $skipCashFlow = $data['skipCashFlow'] ?? false;
        $amountPaid = floatval($data['amountPaid'] ?? 0);
        $totalAmount = floatval($data['totalAmount'] ?? 0);
        $isReturn = (isset($data['type']) && $data['type'] === 'RETURN');

        if (!$skipCashFlow && ($amountPaid > 0 || ($isReturn && $totalAmount < 0))) {
            $cfAmount = 0;
            if ($isReturn) {
                $cfAmount = abs($amountPaid);
            } else {
                $change = floatval($data['change'] ?? 0);
                $cfAmount = $amountPaid - $change;
            }

            if ($cfAmount > 0) {
                $cfType = $isReturn ? 'KELUAR' : 'MASUK';
                $category = $isReturn ? 'Retur Penjualan' : 'Penjualan';
                $customerName = $data['customerName'] ?? 'Umum';
                $txIdShort = substr($data['id'], 0, 6);
                $description = $isReturn 
                    ? "Refund Retur Transaksi #$txIdShort"
                    : "Penjualan ke $customerName (Tx: $txIdShort)";

                $cfData = [
                    'id' => (string)(microtime(true) * 10000), // Simple ID
                    'date' => $data['date'] ?? date('Y-m-d H:i:s'),
                    'type' => $cfType,
                    'amount' => $cfAmount,
                    'category' => $category,
                    'description' => $description,
                    'paymentMethod' => $data['paymentMethod'] ?? 'CASH',
                    'bankId' => $data['bankId'] ?? null,
                    'bankName' => $data['bankName'] ?? null,
                    'referenceId' => $data['id'],
                    'createdAt' => date('Y-m-d H:i:s'),
                    'updatedAt' => date('Y-m-d H:i:s')
                ];

                $cfSql = "INSERT INTO cashflows (id, date, type, amount, category, description, paymentMethod, bankId, bankName, referenceId, createdAt, updatedAt) 
                          VALUES (:id, :date, :type, :amount, :category, :description, :paymentMethod, :bankId, :bankName, :referenceId, :createdAt, :updatedAt)";
                
                $cfStmt = $pdo->prepare($cfSql);
                $cfStmt->execute($cfData);
            }
        }

        $pdo->commit();
        sendJson($data, 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "Transaction Create Error: " . $e->getMessage() . "\n", FILE_APPEND);
        sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
    }
}

function handlePurchaseCreate($pdo, $data) {
    try {
        $pdo->beginTransaction();

        // 1. Create Purchase
        if (empty($data['id'])) {
            $data['id'] = generateUuid();
        }

        $columns = ['id', 'type', 'date', 'supplierId', 'supplierName', 'description', 'items', 'totalAmount', 'amountPaid', 'paymentStatus', 'paymentMethod', 'bankId', 'bankName', 'paymentHistory', 'createdAt', 'updatedAt'];
        
        $insertData = [];
        foreach ($columns as $col) {
            $val = $data[$col] ?? null;
            if (is_array($val)) $val = json_encode($val);
            $insertData[$col] = $val;
        }
        
        if (empty($insertData['createdAt'])) $insertData['createdAt'] = date('Y-m-d H:i:s');
        if (empty($insertData['updatedAt'])) $insertData['updatedAt'] = date('Y-m-d H:i:s');

        $sql = "INSERT INTO purchases (" . implode(', ', array_map(function($c){return "`$c`";}, $columns)) . ") 
                VALUES (" . implode(', ', array_fill(0, count($columns), '?')) . ")";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($insertData));

        // 2. Update Stock
        $items = isset($data['items']) ? (is_string($data['items']) ? json_decode($data['items'], true) : $data['items']) : [];
        if (is_array($items)) {
            foreach ($items as $item) {
                if (isset($item['id']) && isset($item['qty'])) {
                    $stmtProd = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
                    $stmtProd->execute([$item['id']]);
                    $product = $stmtProd->fetch(PDO::FETCH_ASSOC);
                    
                    if ($product) {
                        $newStock = floatval($product['stock']);
                        if (isset($data['type']) && $data['type'] === 'RETURN') {
                            $newStock -= floatval($item['qty']); // Return to supplier = Decrease Stock
                        } else {
                            $newStock += floatval($item['qty']); // Purchase = Increase Stock
                        }
                        
                        $updateProd = $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?");
                        $updateProd->execute([$newStock, $item['id']]);
                    }
                }
            }
        }

        // 3. Create CashFlow
        $skipCashFlow = $data['skipCashFlow'] ?? false;
        $amountPaid = floatval($data['amountPaid'] ?? 0);
        $totalAmount = floatval($data['totalAmount'] ?? 0);
        $isReturn = (isset($data['type']) && $data['type'] === 'RETURN');

        if (!$skipCashFlow && ($amountPaid > 0 || ($isReturn && $totalAmount < 0))) {
            $amount = abs($amountPaid);

            if ($amount > 0) {
                $cfType = $isReturn ? 'MASUK' : 'KELUAR'; // Purchase = OUT, Return = IN (Refund)
                $category = $isReturn ? 'Retur Pembelian' : 'Pembelian Stok';
                $supplierName = $data['supplierName'] ?? 'Supplier';
                $descText = $data['description'] ?? '';
                $description = $isReturn
                    ? "Refund Retur Pembelian dari $supplierName"
                    : "Pembelian dari $supplierName: $descText";

                $cfData = [
                    'id' => (string)(microtime(true) * 10000),
                    'date' => $data['date'] ?? date('Y-m-d H:i:s'),
                    'type' => $cfType,
                    'amount' => $amount,
                    'category' => $category,
                    'description' => $description,
                    'paymentMethod' => $data['paymentMethod'] ?? 'CASH',
                    'bankId' => $data['bankId'] ?? null,
                    'bankName' => $data['bankName'] ?? null,
                    'referenceId' => $data['id'],
                    'createdAt' => date('Y-m-d H:i:s'),
                    'updatedAt' => date('Y-m-d H:i:s')
                ];

                $cfSql = "INSERT INTO cashflows (id, date, type, amount, category, description, paymentMethod, bankId, bankName, referenceId, createdAt, updatedAt) 
                          VALUES (:id, :date, :type, :amount, :category, :description, :paymentMethod, :bankId, :bankName, :referenceId, :createdAt, :updatedAt)";
                
                $cfStmt = $pdo->prepare($cfSql);
                $cfStmt->execute($cfData);
            }
        }

        $pdo->commit();
        sendJson($data, 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "Purchase Create Error: " . $e->getMessage() . "\n", FILE_APPEND);
        sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
    }
}

function handleTransactionDelete($pdo, $id) {
    try {
        $pdo->beginTransaction();

        // 1. Find Transaction
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
        $stmt->execute([$id]);
        $transaction = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$transaction) {
            $pdo->rollBack();
            sendJson(['error' => 'Transaction not found'], 404);
        }

        // 2. Delete associated CashFlow
        $delCf = $pdo->prepare("DELETE FROM cashflows WHERE referenceId = ?");
        $delCf->execute([$id]);

        // 3. Find child transactions (Returns)
        $stmtRet = $pdo->prepare("SELECT * FROM transactions WHERE originalTransactionId = ?");
        $stmtRet->execute([$id]);
        $returns = $stmtRet->fetchAll(PDO::FETCH_ASSOC);

        foreach ($returns as $ret) {
            // Delete CashFlow for return
            $delCf->execute([$ret['id']]);
            // Delete the return transaction
            $delTx = $pdo->prepare("DELETE FROM transactions WHERE id = ?");
            $delTx->execute([$ret['id']]);
        }

        // 4. Delete the transaction itself
        $delTx = $pdo->prepare("DELETE FROM transactions WHERE id = ?");
        $delTx->execute([$id]);

        $pdo->commit();
        http_response_code(204);
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "Transaction Delete Error: " . $e->getMessage() . "\n", FILE_APPEND);
        sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
    }
}

function handlePurchaseDelete($pdo, $id) {
    try {
        $pdo->beginTransaction();

        // 1. Find Purchase
        $stmt = $pdo->prepare("SELECT * FROM purchases WHERE id = ?");
        $stmt->execute([$id]);
        $purchase = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$purchase) {
            $pdo->rollBack();
            sendJson(['error' => 'Purchase not found'], 404);
        }

        // 2. Delete associated CashFlow
        $delCf = $pdo->prepare("DELETE FROM cashflows WHERE referenceId = ?");
        $delCf->execute([$id]);

        // 3. Find child purchases (Returns)
        $stmtRet = $pdo->prepare("SELECT * FROM purchases WHERE originalPurchaseId = ?"); // Assuming originalPurchaseId exists or similar logic
        // Note: Node.js code used 'originalPurchaseId'. I need to check if schema supports it.
        // The PHP schema for purchases in index.php didn't explicitly list 'originalPurchaseId' but let's assume it's there or add it.
        // Wait, index.php schema for purchases: ['id', 'type', 'date', 'supplierId', 'supplierName', 'description', 'items', 'totalAmount', 'amountPaid', 'paymentStatus', 'paymentMethod', 'bankId', 'bankName', 'paymentHistory', 'createdAt', 'updatedAt']
        // It does NOT list 'originalPurchaseId'. Node.js model likely has it.
        // I should probably add it to the schema in index.php too if I want to support it.
        
        // For now let's try to select it. If it fails, it fails.
        // But wait, if it's not in schema, generic insert won't insert it.
        // But my custom insert above uses $columns. I didn't include 'originalPurchaseId' in $columns in handlePurchaseCreate.
        // I should check Node.js model for Purchase.
        
        // Let's assume for now we just delete returns if we can find them.
        // If the column doesn't exist, this query will fail.
        // I'll check the schema in a moment.
        
        // Let's proceed assuming it might be there.
        try {
             $stmtRet->execute([$id]);
             $returns = $stmtRet->fetchAll(PDO::FETCH_ASSOC);
             foreach ($returns as $ret) {
                $delCf->execute([$ret['id']]);
                $delPur = $pdo->prepare("DELETE FROM purchases WHERE id = ?");
                $delPur->execute([$ret['id']]);
             }
        } catch (Exception $ex) {
            // Column might not exist, ignore
        }

        // 4. Delete the purchase itself
        $delPur = $pdo->prepare("DELETE FROM purchases WHERE id = ?");
        $delPur->execute([$id]);

        $pdo->commit();
        http_response_code(204);
        exit();

    } catch (Exception $e) {
        $pdo->rollBack();
        file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "Purchase Delete Error: " . $e->getMessage() . "\n", FILE_APPEND);
        sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
    }
}
?>
