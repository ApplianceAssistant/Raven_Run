<?php
require_once __DIR__ . '/../../server/utils/db_connection.php';
require_once __DIR__ . '/../../server/utils/errorHandler.php';
require_once __DIR__ . '/../../server/auth/auth-utils.php';

header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['displayName'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email and display name are required']);
    exit;
}

$email = $data['email'];
$displayName = $data['displayName'];

// Validate display name
if (strlen($displayName) > 30) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Display name must be 30 characters or less']);
    exit;
}

try {
    $conn = getDbConnection();
    
    // Check if email exists from Google sign-in
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Create new user
        $stmt = $conn->prepare("INSERT INTO users (email, username, created_at, last_login) VALUES (?, ?, NOW(), NOW())");
        $stmt->bind_param("ss", $email, $displayName);
        $stmt->execute();
        $userId = $conn->insert_id;
    } else {
        // Update existing user's display name
        $user = $result->fetch_assoc();
        $userId = $user['id'];
        $stmt = $conn->prepare("UPDATE users SET username = ? WHERE id = ?");
        $stmt->bind_param("si", $displayName, $userId);
        $stmt->execute();
    }
    
    // Generate JWT token
    $token = generateJWT([
        'user_id' => $userId,
        'email' => $email,
        'username' => $displayName
    ]);
    
    // Return success response with user data and token
    echo json_encode([
        'status' => 'success',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'username' => $displayName,
            'token' => $token
        ]
    ]);
    
} catch (Exception $e) {
    handleException($e);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error']);
}
