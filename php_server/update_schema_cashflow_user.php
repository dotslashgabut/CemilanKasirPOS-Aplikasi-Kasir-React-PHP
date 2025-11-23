<?php
require_once 'config.php';

try {
    // Add userId column
    try {
        $pdo->exec("ALTER TABLE cashflows ADD COLUMN userId VARCHAR(255) DEFAULT NULL");
        echo "Successfully added userId column to cashflows table.<br>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), "Duplicate column name") !== false) {
            echo "Column userId already exists.<br>";
        } else {
            echo "Error adding userId: " . $e->getMessage() . "<br>";
        }
    }

    // Add userName column
    try {
        $pdo->exec("ALTER TABLE cashflows ADD COLUMN userName VARCHAR(255) DEFAULT NULL");
        echo "Successfully added userName column to cashflows table.<br>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), "Duplicate column name") !== false) {
            echo "Column userName already exists.<br>";
        } else {
            echo "Error adding userName: " . $e->getMessage() . "<br>";
        }
    }

} catch (Exception $e) {
    echo "General Error: " . $e->getMessage();
}
?>
