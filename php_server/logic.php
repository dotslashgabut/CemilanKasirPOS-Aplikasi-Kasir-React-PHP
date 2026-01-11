<?php

function generateUuid() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        random_int(0, 0xffff), random_int(0, 0xffff),
        random_int(0, 0xffff),
        random_int(0, 0x0fff) | 0x4000,
        random_int(0, 0x3fff) | 0x8000,
        random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff)
    );
}

function generateInvoiceNumber($pdo, $type) {
    // INV = Penjualan (SALE), PO = Pembelian (PURCHASE)
    $prefix = ($type === 'SALE') ? 'INV' : 'PO';
    $year = date('y'); // 2 digits year, e.g. 25
    $prefixYear = $prefix . $year . '-';

    $table = ($type === 'SALE') ? 'transactions' : 'purchases';
    
    // Find the latest invoice number for this year
    // We search for invoiceNumber starting with the prefix
    try {
        $stmt = $pdo->prepare("SELECT invoiceNumber FROM $table WHERE invoiceNumber LIKE ? ORDER BY length(invoiceNumber) DESC, invoiceNumber DESC LIMIT 1 FOR UPDATE");
        $stmt->execute([$prefixYear . '%']);
        $lastInvoice = $stmt->fetchColumn();

        if ($lastInvoice) {
            // Format: INV25-1234567890
            $parts = explode('-', $lastInvoice);
            if (isset($parts[1])) {
                $lastSeq = intval($parts[1]);
                $newSeq = $lastSeq + 1;
            } else {
                $newSeq = 1;
            }
        } else {
            $newSeq = 1;
        }

        // 10 digits sequential number
        return $prefixYear . str_pad($newSeq, 10, '0', STR_PAD_LEFT);
    } catch (Exception $e) {
        // Fallback if column doesn't exist yet or other error, though we expect it to exist
        return null; 
    }
}

function handleTransactionCreate($pdo, $data, $currentUser = null) {
    try {
        $pdo->beginTransaction();

        // Log only ID or minimal info to avoid PII leakage
        $logId = $data['id'] ?? 'new';
        file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "Processing Transaction ID: $logId\n", FILE_APPEND);

        // 1. Create Transaction
        if (empty($data['id'])) {
            $data['id'] = generateUuid();
        }
        
        // Set defaults
        $data['type'] = $data['type'] ?? 'SALE';
        $data['isReturned'] = isset($data['isReturned']) ? ($data['isReturned'] ? 1 : 0) : 0;

        // SECURITY FIX: Always enforce server-side user identity if available
        // Do not trust client-side cashierId/cashierName
        if ($currentUser) {
            $data['cashierId'] = $currentUser['id'];
            $data['cashierName'] = $currentUser['name'];
        }

        // Generate Invoice Number if for SALE and not set
        if (($data['type'] === 'SALE') && empty($data['invoiceNumber'])) {
             $data['invoiceNumber'] = generateInvoiceNumber($pdo, 'SALE');
        }

        // Prepare data for insertion
        $columns = ['id', 'type', 'originalTransactionId', 'date', 'items', 'totalAmount', 'amountPaid', 'change', 'paymentStatus', 'paymentMethod', 'paymentNote', 'returnNote', 'bankId', 'bankName', 'customerId', 'customerName', 'cashierId', 'cashierName', 'paymentHistory', 'isReturned', 'createdAt', 'updatedAt', 'invoiceNumber', 'discount', 'discountType', 'discountAmount'];
        
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
                // Fix: If change is negative (partial payment/debt), do not subtract it.
                // Cash flow should be exactly what was paid.
                if ($change < 0) {
                    $cfAmount = $amountPaid;
                } else {
                    $cfAmount = $amountPaid - $change;
                }
            }

            if ($cfAmount > 0) {
                $cfType = $isReturn ? 'KELUAR' : 'MASUK';
                $category = $isReturn ? 'Retur Penjualan' : 'Penjualan';
                $customerName = $data['customerName'] ?? 'Umum';
                $txIdShort = substr($data['id'], 0, 6);
                $bankInfo = "";
                if (!empty($data['bankId'])) {
                    $stmtBank = $pdo->prepare("SELECT bankName, accountNumber FROM bankaccounts WHERE id = ?");
                    $stmtBank->execute([$data['bankId']]);
                    $bankRow = $stmtBank->fetch(PDO::FETCH_ASSOC);
                    if ($bankRow) {
                        $bankInfo = " (via " . $bankRow['bankName'] . " - " . $bankRow['accountNumber'] . ")";
                    }
                }

                $refStr = !empty($data['invoiceNumber']) ? $data['invoiceNumber'] : "Tx: " . $txIdShort;
                
                $description = ($isReturn 
                    ? "Refund Retur $refStr"
                    : "Penjualan ke $customerName ($refStr)") . $bankInfo;

                $cfData = [
                    'id' => (string)(microtime(true) * 10000), // Simple ID
                    'date' => $data['date'] ?? date('Y-m-d H:i:s'),
                    'type' => $cfType,
                    'amount' => $cfAmount,
                    'category' => $category,
                    'description' => $description,
                    'paymentMethod' => (!empty($data['bankId'])) ? 'TRANSFER' : 'CASH',
                    'bankId' => $data['bankId'] ?? null,
                    'bankName' => $data['bankName'] ?? null,
                    'userId' => $currentUser['id'] ?? null,
                    'userName' => $currentUser['name'] ?? null,
                    'referenceId' => $data['id'],
                    'createdAt' => date('Y-m-d H:i:s'),
                    'updatedAt' => date('Y-m-d H:i:s')
                ];

                $cfSql = "INSERT INTO cashflows (id, date, type, amount, category, description, paymentMethod, bankId, bankName, userId, userName, referenceId, createdAt, updatedAt) 
                          VALUES (:id, :date, :type, :amount, :category, :description, :paymentMethod, :bankId, :bankName, :userId, :userName, :referenceId, :createdAt, :updatedAt)";
                
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

function handlePurchaseCreate($pdo, $data, $currentUser = null) {
    try {
        $pdo->beginTransaction();

        // 1. Create Purchase
        if (empty($data['id'])) {
            $data['id'] = generateUuid();
        }

        // Set defaults
        $data['type'] = $data['type'] ?? 'PURCHASE';
        $data['isReturned'] = isset($data['isReturned']) ? ($data['isReturned'] ? 1 : 0) : 0;
        
        // SECURITY FIX: Always enforce server-side user identity if available
        if ($currentUser) {
            $data['userId'] = $currentUser['id'];
            $data['userName'] = $currentUser['name'];
        }

        // Generate Invoice Number if for PURCHASE and not set
        if (($data['type'] === 'PURCHASE') && empty($data['invoiceNumber'])) {
             $data['invoiceNumber'] = generateInvoiceNumber($pdo, 'PURCHASE');
        }

        $columns = ['id', 'type', 'originalPurchaseId', 'date', 'supplierId', 'supplierName', 'description', 'items', 'totalAmount', 'amountPaid', 'paymentStatus', 'paymentMethod', 'returnNote', 'bankId', 'bankName', 'paymentHistory', 'isReturned', 'userId', 'userName', 'createdAt', 'updatedAt', 'invoiceNumber'];
        
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
                $bankInfo = "";
                if (!empty($data['bankId'])) {
                    $stmtBank = $pdo->prepare("SELECT bankName, accountNumber FROM bankaccounts WHERE id = ?");
                    $stmtBank->execute([$data['bankId']]);
                    $bankRow = $stmtBank->fetch(PDO::FETCH_ASSOC);
                    if ($bankRow) {
                        $bankInfo = " (via " . $bankRow['bankName'] . " - " . $bankRow['accountNumber'] . ")";
                    }
                }

                $refStr = !empty($data['invoiceNumber']) ? "(" . $data['invoiceNumber'] . ")" : "";
                
                $description = ($isReturn
                    ? "Refund Retur Pembelian dari $supplierName $refStr"
                    : "Pembelian dari $supplierName $refStr: $descText") . $bankInfo;

                $cfData = [
                    'id' => (string)(microtime(true) * 10000),
                    'date' => $data['date'] ?? date('Y-m-d H:i:s'),
                    'type' => $cfType,
                    'amount' => $amount,
                    'category' => $category,
                    'description' => $description,
                    'paymentMethod' => (!empty($data['bankId'])) ? 'TRANSFER' : 'CASH',
                    'bankId' => $data['bankId'] ?? null,
                    'bankName' => $data['bankName'] ?? null,
                    'userId' => $currentUser['id'] ?? null,
                    'userName' => $currentUser['name'] ?? null,
                    'referenceId' => $data['id'],
                    'createdAt' => date('Y-m-d H:i:s'),
                    'updatedAt' => date('Y-m-d H:i:s')
                ];

                $cfSql = "INSERT INTO cashflows (id, date, type, amount, category, description, paymentMethod, bankId, bankName, userId, userName, referenceId, createdAt, updatedAt) 
                          VALUES (:id, :date, :type, :amount, :category, :description, :paymentMethod, :bankId, :bankName, :userId, :userName, :referenceId, :createdAt, :updatedAt)";
                
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
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ? FOR UPDATE");
        $stmt->execute([$id]);
        $transaction = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$transaction) {
            $pdo->rollBack();
            sendJson(['error' => 'Transaction not found'], 404);
        }

        $items = json_decode($transaction['items'], true) ?? [];
        $type = $transaction['type'];
        $originalTxId = $transaction['originalTransactionId'];
        $amountPaid = floatval($transaction['amountPaid']);

        // --- LOGIC A: RESTORE DEBT (If deleting a RETURN transaction) ---
        if ($type === 'RETURN' && $originalTxId) {
            // Find original transaction
            $stmtOrig = $pdo->prepare("SELECT * FROM transactions WHERE id = ? FOR UPDATE");
            $stmtOrig->execute([$originalTxId]);
            $originalTx = $stmtOrig->fetch(PDO::FETCH_ASSOC);

            if ($originalTx) {
                $paymentHistory = json_decode($originalTx['paymentHistory'], true) ?? [];
                
                // Find "Potong Utang" entry
                $foundIndex = -1;
                foreach ($paymentHistory as $index => $ph) {
                    // Match by approximate time (within same day) and note 'Potong Utang'
                    if (isset($ph['note']) && (strpos($ph['note'], 'Potong Utang') !== false) && abs($ph['amount'] - $amountPaid) < 1) {
                         $foundIndex = $index;
                         break;
                    }
                }

                if ($foundIndex !== -1) {
                    $entryToRemove = $paymentHistory[$foundIndex];
                    unset($paymentHistory[$foundIndex]);
                    $paymentHistory = array_values($paymentHistory); // Reindex

                    $origTotal = floatval($originalTx['totalAmount']);
                    $origPaid = floatval($originalTx['amountPaid']) - floatval($entryToRemove['amount']);
                    
                    $newStatus = ($origPaid >= $origTotal) ? 'PAID' : (($origPaid > 0) ? 'PARTIAL' : 'UNPAID');

                    // Check if other returns exist to update isReturned flag
                    $stmtCheckReturns = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE originalTransactionId = ? AND id != ? AND type = 'RETURN'");
                    $stmtCheckReturns->execute([$originalTxId, $id]);
                    $otherReturnsCount = $stmtCheckReturns->fetchColumn();
                    $isReturned = ($otherReturnsCount > 0) ? 1 : 0;

                    $updateOrig = $pdo->prepare("UPDATE transactions SET amountPaid = ?, paymentStatus = ?, paymentHistory = ?, isReturned = ? WHERE id = ?");
                    $updateOrig->execute([$origPaid, $newStatus, json_encode($paymentHistory), $isReturned, $originalTxId]);
                }
            }
        }

        // --- LOGIC B: CASCADE DELETE (If deleting a SALE transaction) ---
        // Find and delete all RETURN transactions linked to this transaction
        $stmtRet = $pdo->prepare("SELECT * FROM transactions WHERE originalTransactionId = ? AND type = 'RETURN'");
        $stmtRet->execute([$id]);
        $returns = $stmtRet->fetchAll(PDO::FETCH_ASSOC);

        foreach ($returns as $ret) {
            $retItems = json_decode($ret['items'], true) ?? [];
            
            // Revert Stock for Return Transaction (Return added stock, so we subtract it back)
            foreach ($retItems as $item) {
                if (isset($item['id']) && isset($item['qty'])) {
                    $qty = floatval($item['qty']);
                    $updateStock = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
                    $updateStock->execute([$qty, $item['id']]);
                }
            }

            // Delete cashflows related to this return transaction
            $delCfRet = $pdo->prepare("DELETE FROM cashflows WHERE referenceId = ?");
            $delCfRet->execute([$ret['id']]);

            // Delete the return transaction itself
            $delTxRet = $pdo->prepare("DELETE FROM transactions WHERE id = ?");
            $delTxRet->execute([$ret['id']]);
        }


        // --- LOGIC C: REVERT STOCK FOR MAIN TRANSACTION ---
        if (!empty($items)) {
            foreach ($items as $item) {
                if (isset($item['id']) && isset($item['qty'])) {
                    $qty = floatval($item['qty']);
                    
                    if ($type === 'RETURN') {
                         // Return: stock was increased, so subtract
                         $sqlStock = "UPDATE products SET stock = stock - ? WHERE id = ?";
                    } else {
                         // Sale: stock was decreased, so add back
                         $sqlStock = "UPDATE products SET stock = stock + ? WHERE id = ?";
                    }
                    
                    $updateStock = $pdo->prepare($sqlStock);
                    $updateStock->execute([$qty, $item['id']]);
                }
            }
        }

        // --- LOGIC D: DELETE RELATED CASHFLOWS ---
        $delCf = $pdo->prepare("DELETE FROM cashflows WHERE referenceId = ?");
        $delCf->execute([$id]);

        // --- LOGIC E: DELETE TRANSACTION ---
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
        $stmt = $pdo->prepare("SELECT * FROM purchases WHERE id = ? FOR UPDATE");
        $stmt->execute([$id]);
        $purchase = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$purchase) {
            $pdo->rollBack();
            sendJson(['error' => 'Purchase not found'], 404);
        }

        $items = json_decode($purchase['items'], true) ?? [];
        $type = $purchase['type'];
        $originalPurchaseId = $purchase['originalPurchaseId'];
        $amountPaid = floatval($purchase['amountPaid']);

        // --- LOGIC A: RESTORE DEBT (If deleting a RETURN purchase) ---
        if ($type === 'RETURN' && $originalPurchaseId) {
            $stmtOrig = $pdo->prepare("SELECT * FROM purchases WHERE id = ? FOR UPDATE");
            $stmtOrig->execute([$originalPurchaseId]);
            $originalPurchase = $stmtOrig->fetch(PDO::FETCH_ASSOC);

            if ($originalPurchase) {
                $paymentHistory = json_decode($originalPurchase['paymentHistory'], true) ?? [];
                
                $foundIndex = -1;
                foreach ($paymentHistory as $index => $ph) {
                    if (isset($ph['note']) && (strpos($ph['note'], 'Potong Utang') !== false) && abs($ph['amount'] - $amountPaid) < 1) {
                         $foundIndex = $index;
                         break;
                    }
                }

                if ($foundIndex !== -1) {
                    $entryToRemove = $paymentHistory[$foundIndex];
                    unset($paymentHistory[$foundIndex]);
                    $paymentHistory = array_values($paymentHistory);

                    $origTotal = floatval($originalPurchase['totalAmount']);
                    $origPaid = floatval($originalPurchase['amountPaid']) - floatval($entryToRemove['amount']);
                    
                    $newStatus = ($origPaid >= $origTotal) ? 'PAID' : (($origPaid > 0) ? 'PARTIAL' : 'UNPAID');

                    // Check if other returns exist
                    $stmtCheckReturns = $pdo->prepare("SELECT COUNT(*) FROM purchases WHERE originalPurchaseId = ? AND id != ? AND type = 'RETURN'");
                    $stmtCheckReturns->execute([$originalPurchaseId, $id]);
                    $otherReturnsCount = $stmtCheckReturns->fetchColumn();
                    $isReturned = ($otherReturnsCount > 0) ? 1 : 0;

                    $updateOrig = $pdo->prepare("UPDATE purchases SET amountPaid = ?, paymentStatus = ?, paymentHistory = ?, isReturned = ? WHERE id = ?");
                    $updateOrig->execute([$origPaid, $newStatus, json_encode($paymentHistory), $isReturned, $originalPurchaseId]);
                }
            }
        }

        // --- LOGIC B: CASCADE DELETE (If deleting a PURCHASE) ---
        // Find and delete all RETURN purchases linked to this purchase
        // Link can be originalPurchaseId OR via description (legacy)
        $stmtRet = $pdo->prepare("SELECT * FROM purchases WHERE originalPurchaseId = ? OR (type = 'RETURN' AND description LIKE ?)");
        $legacyDescMatch = "%" . substr($id, 0, 6) . "%";
        $stmtRet->execute([$id, $legacyDescMatch]);
        $returns = $stmtRet->fetchAll(PDO::FETCH_ASSOC);

        foreach ($returns as $ret) {
            // Avoid infinite loop if self-reference (should not happen but safe check)
            if ($ret['id'] === $id) continue;

            $retItems = json_decode($ret['items'], true) ?? [];
            
            // Revert Stock for Return Purchase (Return DESC stocks, so we ADD back)
            foreach ($retItems as $item) {
                if (isset($item['id']) && isset($item['qty'])) {
                    $qty = floatval($item['qty']);
                    $updateStock = $pdo->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
                    $updateStock->execute([$qty, $item['id']]);
                }
            }

            // Delete CashFlow for return
            $delCfRet = $pdo->prepare("DELETE FROM cashflows WHERE referenceId = ?");
            $delCfRet->execute([$ret['id']]);

            // Delete the return purchase
            $delPurRet = $pdo->prepare("DELETE FROM purchases WHERE id = ?");
            $delPurRet->execute([$ret['id']]);
        }

        // --- LOGIC C: REVERT STOCK FOR MAIN PURCHASE ---
        if (!empty($items)) {
            foreach ($items as $item) {
                if (isset($item['id']) && isset($item['qty'])) {
                    $qty = floatval($item['qty']);
                    
                    if ($type === 'RETURN') {
                         // Return Purchase: stock was decreased, so add back
                         $sqlStock = "UPDATE products SET stock = stock + ? WHERE id = ?";
                    } else {
                         // Purchase: stock was increased, so subtract
                         $sqlStock = "UPDATE products SET stock = stock - ? WHERE id = ?";
                    }
                    
                    $updateStock = $pdo->prepare($sqlStock);
                    $updateStock->execute([$qty, $item['id']]);
                }
            }
        }

        // --- LOGIC D: DELETE RELATED CASHFLOWS ---
        $delCf = $pdo->prepare("DELETE FROM cashflows WHERE referenceId = ?");
        $delCf->execute([$id]);

        // --- LOGIC E: DELETE PURCHASE ---
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

function handleStockAdjustmentCreate($pdo, $data, $currentUser = null) {
    try {
        $pdo->beginTransaction();

        // 1. Create Stock Adjustment
        if (empty($data['id'])) {
            $data['id'] = generateUuid();
        }

        // Fill defaults
        $data['userId'] = $currentUser ? $currentUser['id'] : ($data['userId'] ?? null);
        $data['userName'] = $currentUser ? $currentUser['name'] : ($data['userName'] ?? null);
        if (empty($data['createdAt'])) $data['createdAt'] = date('Y-m-d H:i:s');
        if (empty($data['updatedAt'])) $data['updatedAt'] = date('Y-m-d H:i:s');

        // PREPARE DATA - We need to calculate stocks FIRST before inserting
        $previousStock = 0;
        $currentStock = 0;

        if (!empty($data['productId'])) {
            $stmtProd = $pdo->prepare("SELECT stock FROM products WHERE id = ? FOR UPDATE"); // Lock row
            $stmtProd->execute([$data['productId']]);
            $product = $stmtProd->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                $previousStock = floatval($product['stock']);
                $qty = floatval($data['qty']);
                
                if ($data['type'] === 'INCREASE') {
                    $currentStock = $previousStock + $qty;
                } else {
                    $currentStock = $previousStock - $qty;
                }
            }
        }

        $data['previousStock'] = $previousStock;
        $data['currentStock'] = $currentStock;

        $columns = ['id', 'date', 'productId', 'productName', 'type', 'reason', 'qty', 'previousStock', 'currentStock', 'note', 'userId', 'userName', 'createdAt', 'updatedAt'];
        
        $insertData = [];
        foreach ($columns as $col) {
            $insertData[$col] = $data[$col] ?? null;
        }

        $sql = "INSERT INTO stock_adjustments (" . implode(', ', array_map(function($c){return "`$c`";}, $columns)) . ") 
                VALUES (" . implode(', ', array_fill(0, count($columns), '?')) . ")";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($insertData));

        // 2. Update Product Stock (using the already calculated value)
        if (!empty($data['productId'])) { // We already did the calc above
            $updateProd = $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?");
            $updateProd->execute([$currentStock, $data['productId']]);
        }

        $pdo->commit();
        sendJson($data, 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        file_put_contents('php_error.log', date('[Y-m-d H:i:s] ') . "Stock Adjustment Error: " . $e->getMessage() . "\n", FILE_APPEND);
        sendJson(['error' => (defined('SHOW_DEBUG_ERRORS') && SHOW_DEBUG_ERRORS) ? $e->getMessage() : 'Internal Server Error'], 500);
    }
}

?>
