<?php
require_once('../server/db_connection.php');
require_once('errorHandler.php');
require_once('../server/encryption.php');
require_once('auth.php');

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
                if (verifyPassword($password, $user['password'])) {
                    $token = generateAuthToken($user['id']);
                    if ($token) {
                        http_response_code(200);
                        echo json_encode([
                            'success' => true, 
                            'id' => $user['id'], 
                            'username' => $user['username'],
                            'token' => $token,
                            'message' => "Welcome back {$user['username']}!"
                        ]);
                    } else {
                        handleError(E_USER_ERROR, "Failed to generate auth token", __FILE__, __LINE__);
                    }
                } else {
                    handleUnauthorizedError("Invalid credentials");
                }
            } else {
                handleUnauthorizedError("Invalid credentials");
            }
            $stmt->close();
        } elseif ($action === 'logout') {
            $token = $data['token'] ?? '';
            if (empty($token)) {
                handleBadRequestError("Token is required for logout");
            }
            if (invalidateAuthToken($token)) {
                echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
            } else {
                handleError(E_USER_ERROR, "Failed to invalidate token", __FILE__, __LINE__);
            }
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