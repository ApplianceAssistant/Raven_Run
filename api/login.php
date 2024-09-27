<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: https://crowtours.com');

require_once('errorHandler.php');
require_once('../server/db_connection.php');
require_once('/../server/encryption.php');
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
            if ($action === 'login') {
                $username = $data['username'];
                $password = $data['password'];

                $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
                $stmt->bind_param("s", $username);
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
