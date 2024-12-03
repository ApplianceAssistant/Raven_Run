<?php
require_once(__DIR__ . '/../server/db_connection.php');
require_once(__DIR__ . '/../server/encryption.php');
require_once(__DIR__ . '/errorHandler.php');
require_once(__DIR__ . '/auth.php');

// Set content type to JSON
header('Content-Type: application/json');

// Get database connection
$conn = getDbConnection();
if (!$conn) {
    $response = [
        'status' => 'error',
        'message' => "Failed to connect to database",
        'code' => 500
    ];
    echo json_encode($response);
    exit(0);
}

try {
    // Get POST data
    $rawInput = file_get_contents('php://input');    
    $data = json_decode($rawInput, true);
    
    if (!$data) {
        $response = [
            'status' => 'error',
            'message' => "Invalid JSON data: " . json_last_error_msg(),
            'code' => 400
        ];
        echo json_encode($response);
        exit(0);
    }

    if (!isset($data['action'])) {
        $response = [
            'status' => 'error',
            'message' => "Action is required",
            'code' => 400
        ];
        echo json_encode($response);
        exit(0);
    }

    switch ($data['action']) {
        case 'login':
            if (!isset($data['email']) || !isset($data['password'])) {
                $response = [
                    'status' => 'error',
                    'message' => "Email and password are required",
                    'code' => 400
                ];
                echo json_encode($response);
                exit(0);
            }

            $email = $data['email'];
            $password = $data['password'];
            
            // Get user by email
            $stmt = $conn->prepare("SELECT id, username, email, password FROM users WHERE email = ?");
            if (!$stmt) {
                error_log("Prepare failed: " . $conn->error);
                $response = [
                    'status' => 'error',
                    'message' => "Database error",
                    'code' => 500
                ];
                echo json_encode($response);
                exit(0);
            }

            $stmt->bind_param("s", $email);
            if (!$stmt->execute()) {
                error_log("Execute failed: " . $stmt->error);
                $response = [
                    'status' => 'error',
                    'message' => "Database error",
                    'code' => 500
                ];
                echo json_encode($response);
                exit(0);
            }

            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
                        
            if (!$user || !verifyPassword($password, $user['password'])) {
                $response = [
                    'status' => 'error',
                    'message' => "Invalid email or password",
                    'code' => 401
                ];
                echo json_encode($response);
                exit(0);
            }

            // Generate JWT token
            $token = generateAuthToken($user['id']);
            
            // Remove password from user data
            unset($user['password']);
            
            $response = [
                'status' => 'success',
                'user' => $user,
                'token' => $token
            ];
            
            echo json_encode($response);
            break;

        case 'logout':
            $response = [
                'status' => 'success',
                'message' => 'Logged out successfully'
            ];
            echo json_encode($response);
            break;

        default:
            $response = [
                'status' => 'error',
                'message' => "Invalid action",
                'code' => 400
            ];
            echo json_encode($response);
            exit(0);
    }
} catch (Exception $e) {
    error_log("Exception caught: " . $e->getMessage());
    $code = $e->getCode() ?: 500;
    $response = [
        'status' => 'error',
        'message' => $e->getMessage(),
        'code' => $code
    ];
    echo json_encode($response);
} finally {
    releaseDbConnection();
}