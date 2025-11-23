<?php
echo "owner: " . password_hash('owner', PASSWORD_BCRYPT) . "\n";
echo "kasir: " . password_hash('kasir', PASSWORD_BCRYPT) . "\n";
echo "password: " . password_hash('password', PASSWORD_BCRYPT) . "\n";
?>
