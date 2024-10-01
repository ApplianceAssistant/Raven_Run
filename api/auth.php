<?php
require_once('../server/db_connection.php');
require_once('errorHandler.php');

function authenticateUser() {
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return null;
    }

    if (preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
        $token = $matches[1];
    } else {
        return null;
    }

    try {
        $conn = getDbConnection();
        $stmt = $conn->prepare("SELECT user_id, expiration FROM auth_tokens WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if (strtotime($row['expiration']) < time()) {
                invalidateAuthToken($token);
                return null;
            }

            $userId = $row['user_id'];
            $userStmt = $conn->prepare("SELECT id, username, email FROM users WHERE id = ? LIMIT 1");
            $userStmt->bind_param("i", $userId);
            $userStmt->execute();
            $userResult = $userStmt->get_result();

            if ($user = $userResult->fetch_assoc()) {
                return $user;
            }
        }
    } catch (Exception $e) {
        error_log("Authentication error: " . $e->getMessage());
        return null;
    }

    return null;
}

function generateAuthToken($userId) {
    $conn = getDbConnection();
    $token = bin2hex(random_bytes(32));
    $expiration = date('Y-m-d H:i:s', strtotime('+1 day'));

    $stmt = $conn->prepare("INSERT INTO auth_tokens (user_id, token, expiration) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $userId, $token, $expiration);
    
    if ($stmt->execute()) {
        return $token;
    } else {
        return null;
    }
}

function invalidateAuthToken($token) {
    $conn = getDbConnection();
    $stmt = $conn->prepare("DELETE FROM auth_tokens WHERE token = ?");
    $stmt->bind_param("s", $token);
    return $stmt->execute();
}