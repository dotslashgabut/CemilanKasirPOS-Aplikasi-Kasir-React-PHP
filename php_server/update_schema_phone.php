<?php
require_once 'config.php';

try {
    $pdo->exec("ALTER TABLE storesettings ADD COLUMN showPhone TINYINT(1) DEFAULT 1 AFTER showAddress");
    echo "Successfully added showPhone column to storesettings table.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Column showPhone already exists.";
    } else {
        echo "Error updating schema: " . $e->getMessage();
    }
}
?>
