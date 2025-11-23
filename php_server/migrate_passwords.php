<?php
require_once 'config.php';

echo "Starting password migration...\n";

try {
    // Get all users
    $stmt = $pdo->query("SELECT id, username, password FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $count = 0;
    foreach ($users as $user) {
        $id = $user['id'];
        $plainPassword = $user['password'];

        // Check if already hashed (basic check: starts with $2y$ or $2a$ and length is 60)
        if (strlen($plainPassword) === 60 && (strpos($plainPassword, '$2y$') === 0 || strpos($plainPassword, '$2a$') === 0)) {
            echo "User {$user['username']} already has a hashed password. Skipping.\n";
            continue;
        }

        // Hash the password
        $hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);

        // Update database
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$hashedPassword, $id]);

        echo "Migrated user: {$user['username']}\n";
        $count++;
    }

    echo "Migration completed. {$count} users updated.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
