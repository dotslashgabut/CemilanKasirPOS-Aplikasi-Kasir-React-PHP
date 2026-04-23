<?php
require_once __DIR__ . '/config.php';
// Simple Rate Limiter using a JSON file
// In production, use Redis or a Database

function checkLoginRateLimit($ip) {
    $file = 'login_attempts.json';
    $max_attempts = 5;
    $lockout_time = 900; // 15 minutes in seconds

    $fp = fopen($file, 'c+');
    if (!$fp) {
        // Fallback if file cannot be opened (should check permissions)
        return ['allowed' => true]; 
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return ['allowed' => true]; // Fail open if lock fails
    }

    $json = '';
    while (!feof($fp)) {
        $json .= fread($fp, 8192);
    }
    
    $data = json_decode($json, true) ?? [];

    // Clean up old entries
    $now = time();
    foreach ($data as $key => $attempt) {
        if ($now - $attempt['last_attempt'] > $lockout_time) {
            unset($data[$key]);
        }
    }

    $result = ['allowed' => true];

    if (isset($data[$ip])) {
        if ($data[$ip]['count'] >= $max_attempts) {
            if ($now - $data[$ip]['last_attempt'] <= $lockout_time) {
                $remaining = $lockout_time - ($now - $data[$ip]['last_attempt']);
                $result = [
                    'allowed' => false, 
                    'message' => "Too many login attempts. Please try again in " . ceil($remaining / 60) . " minutes."
                ];
            } else {
                // Reset if time passed (though cleanup handles this, explicit check is safe)
                $data[$ip] = ['count' => 1, 'last_attempt' => $now];
            }
        } else {
            $data[$ip]['count']++;
            $data[$ip]['last_attempt'] = $now;
        }
    } else {
        $data[$ip] = ['count' => 1, 'last_attempt' => $now];
    }

    // Write back
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    return $result;
}

function resetLoginRateLimit($ip) {
    $file = 'login_attempts.json';
    
    $fp = fopen($file, 'c+');
    if (!$fp) return;

    if (flock($fp, LOCK_EX)) {
        $json = '';
        while (!feof($fp)) {
            $json .= fread($fp, 8192);
        }
        $data = json_decode($json, true) ?? [];
        
        if (isset($data[$ip])) {
            unset($data[$ip]);
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($data));
            fflush($fp);
        }
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}
?>
