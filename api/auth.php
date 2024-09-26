<?php
require_once __DIR__ . '/../server/db_connection.php';

function authenticateUser() {
    // Check if the Authorization header is present
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return null;
    }

    // Extract the token
    if (preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
        $token = $matches[1];
    } else {
        return null;
    }

    // Verify the token
    try {
        global $conn;
        $stmt = $conn->prepare("SELECT user_id, expiration FROM auth_tokens WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            // Check if the token has expired
            if (strtotime($row['expiration']) < time()) {
                return null;
            }

            // Token is valid, fetch user details
            $userId = $row['user_id'];
            $userStmt = $conn->prepare("SELECT id, username, email FROM users WHERE id = ?");
            $userStmt->bind_param("i", $userId);
            $userStmt->execute();
            $userResult = $userStmt->get_result();

            if ($user = $userResult->fetch_assoc()) {
                return $user;
            }
        }
    } catch (Exception $e) {
        // Log the error
        error_log("Authentication error: " . $e->getMessage());
        return null;
    }

    return null;
}

function generateAuthToken($userId) {
    global $conn;
    $token = bin2hex(random_bytes(32)); // Generate a secure random token
    $expiration = date('Y-m-d H:i:s', strtotime('+1 day')); // Token expires in 1 day

    $stmt = $conn->prepare("INSERT INTO auth_tokens (user_id, token, expiration) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $userId, $token, $expiration);
    
    if ($stmt->execute()) {
        return $token;
    } else {
        return null;
    }
}

function invalidateAuthToken($token) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM auth_tokens WHERE token = ?");
    $stmt->bind_param("s", $token);
    return $stmt->execute();
}
?>