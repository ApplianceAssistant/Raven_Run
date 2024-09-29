<?php

require_once('../server/db_connection.php');
require_once('errorHandler.php');
require_once('../server/encryption.php');

function generateAuthToken($userId) {
    $token = bin2hex(random_bytes(32));
    $expiration = date('Y-m-d H:i:s', strtotime('+1 day'));
    
    $conn = getDbConnection();
    $stmt = $conn->prepare("INSERT INTO auth_tokens (user_id, token, expiration) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $userId, $token, $expiration);
    $stmt->execute();
    $stmt->close();
    
    return $token;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $conn = getDbConnection();
    
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';
        
        if ($action === 'login') {
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';

            if (empty($email) || empty($password)) {
                handleBadRequestError("Email and password are required");
            }

            $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 1) {
                $user = $result->fetch_assoc();
                if (password_verify($password, $user['password'])) {
                    $token = generateAuthToken($user['id']);
                    http_response_code(200);
                    echo json_encode([
                        'success' => true, 
                        'id' => $user['id'], 
                        'username' => $user['username'],
                        'token' => $token,
                        'message' => "Welcome back {$user['username']}!"
                    ]);
                } else {
                    handleUnauthorizedError("Invalid credentials");
                }
            } else {
                handleUnauthorizedError("Invalid credentials");
            }
            $stmt->close();
        } else {
            handleBadRequestError("Invalid action");
        }
    } else {
        handleError(E_USER_WARNING, "Method not allowed", __FILE__, __LINE__);
    }
} catch (Exception $e) {
    handleError(E_USER_ERROR, $e->getMessage(), __FILE__, __LINE__);
}

$conn->close();