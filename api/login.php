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
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        handleError(400, "Invalid JSON data");
        exit(0);
    }

    if (!isset($data['action'])) {
        handleError(400, "Action is required");
        exit(0);
    }

    switch ($data['action']) {
        case 'login':
            if (!isset($data['email']) || !isset($data['password'])) {
                handleError(400, "Email and password are required");
                exit(0);
            }

            $email = $data['email'];
            $password = $data['password'];

            // Get user by email
            $stmt = $conn->prepare("SELECT id, username, email, password FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if (!$user || !password_verify($password, $user['password'])) {
                handleError(401, "Invalid email or password");
                exit(0);
            }

            // Generate JWT token
            $token = generateAuthToken($user['id']);

            // Return user data and token
            unset($user['password']);
            echo json_encode([
                'status' => 'success',
                'user' => $user,
                'token' => $token
            ]);
            break;

        case 'logout':
            // For JWT, we don't need to do anything server-side
            // The client should just remove the token
            echo json_encode([
                'status' => 'success',
                'message' => 'Logged out successfully'
            ]);
            break;

        default:
            handleError(400, "Invalid action");
            exit(0);
    }
} catch (Exception $e) {
    $code = $e->getCode() ?: 500;
    handleError($code, $e->getMessage());
} finally {
    releaseDbConnection();
}