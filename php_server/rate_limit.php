<?php
// Simple Rate Limiter using a JSON file
// In production, use Redis or a Database

function checkLoginRateLimit($ip) {
    $file = 'login_attempts.json';
    $max_attempts = 5;
    $lockout_time = 900; // 15 minutes in seconds

    $data = [];
    if (file_exists($file)) {
        $json = file_get_contents($file);
        $data = json_decode($json, true) ?? [];
    }

    // Clean up old entries
    $now = time();
    foreach ($data as $key => $attempt) {
        if ($now - $attempt['last_attempt'] > $lockout_time) {
            unset($data[$key]);
        }
    }

    if (isset($data[$ip])) {
        if ($data[$ip]['count'] >= $max_attempts) {
            // Check if lockout period has passed (should be handled by cleanup, but double check)
            if ($now - $data[$ip]['last_attempt'] <= $lockout_time) {
                $remaining = $lockout_time - ($now - $data[$ip]['last_attempt']);
                return [
                    'allowed' => false, 
                    'message' => "Too many login attempts. Please try again in " . ceil($remaining / 60) . " minutes."
                ];
            } else {
                // Reset if time passed
                $data[$ip] = ['count' => 1, 'last_attempt' => $now];
            }
        } else {
            $data[$ip]['count']++;
            $data[$ip]['last_attempt'] = $now;
        }
    } else {
        $data[$ip] = ['count' => 1, 'last_attempt' => $now];
    }

    file_put_contents($file, json_encode($data));
    return ['allowed' => true];
}

function resetLoginRateLimit($ip) {
    $file = 'login_attempts.json';
    if (file_exists($file)) {
        $json = file_get_contents($file);
        $data = json_decode($json, true) ?? [];
        if (isset($data[$ip])) {
            unset($data[$ip]);
            file_put_contents($file, json_encode($data));
        }
    }
}
?>
