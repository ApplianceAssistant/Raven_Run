<?php

require_once('../server/db_connection.php');
require_once('errorHandler.php');
require_once('../server/encryption.php');
require_once('auth.php');

/*$user = authenticateUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}*/

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $conn = getDbConnection();
    switch ($method) {
        case 'POST':
            $data = $_POST ?? null;
            $action = $data['action'] ?? '';
            if ($action === 'login') {
                $email = $data['email'];
                $password = $data['password'];

                $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows === 1) {
                    $user = $result->fetch_assoc();
                    if (verifyPassword($password, $user['password'])) {
                        http_response_code(200);
                        echo json_encode(['success' => true, 'id' => $user['id'], 'username' => $user['username'], 'message' => "Welcome back $username!"]);
                    } else {
                        http_response_code(401);
                        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
                    }
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
                }
                $stmt->close();
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
