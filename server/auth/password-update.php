<?php
namespace CrowTours\Services\Email\Auth;

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../utils/db_connection.php';
require_once (__DIR__ . '/../utils/encryption.php');
require_once __DIR__ . '/../utils/rateLimit.php';
require_once __DIR__ . '/../utils/errorHandler.php';
require_once __DIR__ . '/auth.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Set content type to JSON and CORS headers
header('Content-Type: application/json');

// Allow CORS for development
$allowedOrigins = [
    'http://localhost:5000',  // Development
    'http://localhost:3000',  // Alternative development port
    'https://ravenruns.com',  // Staging
    'https://crowtours.com'  // Production
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log('Invalid request method: ' . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
error_log('Received password update request with data: ' . print_r($data, true));

$token = $data['token'] ?? '';
$newPassword = $data['password'] ?? '';

if (empty($token) || empty($newPassword)) {
    error_log('Missing required fields. Token or password not provided');
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Token and new password are required']);
    exit;
}

try {
    $conn = getDbConnection();

    error_log('Validating token...');
    // Validate token and get user information
    $stmt = $conn->prepare('SELECT ptr.user_id, ptr.expiration, u.email 
                           FROM password_reset_tokens ptr 
                           JOIN users u ON ptr.user_id = u.id 
                           WHERE ptr.token = ? AND ptr.used = 0');
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        error_log('Invalid or expired token');
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired reset token']);
        exit;
    }

    $resetRequest = $result->fetch_assoc();

    // Check if token has expired using UTC
    $currentTime = new \DateTime('now', new \DateTimeZone('UTC'));
    $expirationTime = new \DateTime($resetRequest['expiration'], new \DateTimeZone('UTC'));

    error_log('Current time (UTC): ' . $currentTime->format('Y-m-d H:i:s'));
    error_log('Token expires (UTC): ' . $expirationTime->format('Y-m-d H:i:s'));

    if ($currentTime > $expirationTime) {
        error_log('Token has expired');
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Reset token has expired']);
        exit;
    }

    error_log('Updating password...');
    // Update user's password using consistent hashing method
    $hashedPassword = hashPassword($newPassword);
    $updateStmt = $conn->prepare('UPDATE users SET password = ? WHERE id = ?');
    $updateStmt->bind_param('si', $hashedPassword, $resetRequest['user_id']);

    if (!$updateStmt->execute()) {
        error_log('Failed to update password: ' . $updateStmt->error);
        throw new Exception('Failed to update password');
    }

    error_log('Password updated successfully for user ID: ' . $resetRequest['user_id']);

    error_log('Marking token as used...');
    // Mark the token as used
    $markUsedStmt = $conn->prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?');
    $markUsedStmt->bind_param('s', $token);
    $markUsedStmt->execute();

    echo json_encode([
        'status' => 'success',
        'message' => 'Password has been successfully updated'
    ]);
} catch (Exception $e) {
    error_log('Password update error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while updating the password'
    ]);
}
