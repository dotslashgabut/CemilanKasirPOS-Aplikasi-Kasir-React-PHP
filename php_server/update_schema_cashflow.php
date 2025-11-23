<?php
require_once 'config.php';

try {
    $pdo->exec("ALTER TABLE cashflows ADD COLUMN cashierId VARCHAR(255) DEFAULT NULL");
    echo "Successfully added cashierId column to cashflows table.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Column cashierId already exists.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>
