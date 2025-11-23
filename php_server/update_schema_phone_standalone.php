<?php
echo "Available drivers: " . implode(", ", PDO::getAvailableDrivers()) . "\n";

$host = 'localhost';
$db   = 'cemilankasirpos';
$user = 'root';
$pass = ''; // Try empty first
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected successfully with empty password.\n";
} catch (\PDOException $e) {
    echo "Connection failed with empty password: " . $e->getMessage() . "\n";
    // Try with 'root' password
    try {
        $pass = 'root';
        $pdo = new PDO($dsn, $user, $pass, $options);
        echo "Connected successfully with 'root' password.\n";
    } catch (\PDOException $e2) {
        echo "Connection failed with 'root' password: " . $e2->getMessage() . "\n";
        exit(1);
    }
}

try {
    $pdo->exec("ALTER TABLE storesettings ADD COLUMN showPhone TINYINT(1) DEFAULT 1 AFTER showAddress");
    echo "Successfully added showPhone column to storesettings table.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Column showPhone already exists.\n";
    } else {
        echo "Error updating schema: " . $e->getMessage() . "\n";
    }
}
?>
