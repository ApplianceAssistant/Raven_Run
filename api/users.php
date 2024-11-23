<?php
require_once(__DIR__ . '/../server/db_connection.php');
require_once(__DIR__ . '/errorHandler.php');
require_once(__DIR__ . '/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

// Get database connection
$conn = getDbConnection();
if (!$conn) {
    handleError(500, "Failed to connect to database");
    exit(0);
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    function checkUnique($field, $value) {
        $conn = getDbConnection();
        try {
            $allowedFields = ['username', 'email', 'phone'];
            if (!in_array($field, $allowedFields)) {
                throw new Exception("Invalid field for uniqueness check");
            }
            $stmt = $conn->prepare("SELECT id FROM users WHERE $field = ?");
            $stmt->bind_param("s", $value);
            $stmt->execute();
            $result = $stmt->get_result();
            return $result->num_rows === 0;
        } finally {
            releaseDbConnection();
        }
    }

    function getAllUsers() {
        $conn = getDbConnection();
        try {
            $stmt = $conn->prepare("SELECT id, username, email, created_at, updated_at FROM users");
            $stmt->execute();
            $result = $stmt->get_result();
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            return $users;
        } finally {
            releaseDbConnection();
        }
    }

    function createUser($userData) {
        $conn = getDbConnection();
        try {
            // Validate required fields
            if (!isset($userData['username']) || !isset($userData['email']) || !isset($userData['password'])) {
                throw new Exception("Missing required fields", 400);
            }

            // Validate email format
            if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid email format", 400);
            }

            // Check if email already exists
            if (!checkUnique('email', $userData['email'])) {
                throw new Exception("Email already exists", 409);
            }

            // Check if username already exists
            if (!checkUnique('username', $userData['username'])) {
                throw new Exception("Username already exists", 409);
            }

            // Hash password
            $hashedPassword = password_hash($userData['password'], PASSWORD_DEFAULT);

            // Insert new user
            $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $userData['username'], $userData['email'], $hashedPassword);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to create user: " . $stmt->error, 500);
            }

            $userId = $stmt->insert_id;
            return [
                'id' => $userId,
                'username' => $userData['username'],
                'email' => $userData['email']
            ];
        } finally {
            releaseDbConnection();
        }
    }

    switch ($method) {
        case 'GET':
            $users = getAllUsers();
            echo json_encode(['status' => 'success', 'users' => $users]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                handleError(400, "Invalid JSON data");
                exit(0);
            }

            $user = createUser($data);
            echo json_encode(['status' => 'success', 'user' => $user]);
            break;

        default:
            handleError(405, "Method not allowed");
            exit(0);
    }
} catch (Exception $e) {
    $code = $e->getCode() ?: 500;
    handleError($code, $e->getMessage());
} finally {
    releaseDbConnection();
}
