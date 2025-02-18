<?php
namespace CrowTours\Services\Email\Auth;

require_once __DIR__ . '/../../../config/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? '';
$newPassword = $data['password'] ?? '';

if (empty($token) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Token and new password are required']);
    exit;
}

try {
    // TODO: Validate token from database and check expiration
    // $resetRequest = get_reset_token($token);
    // if (!$resetRequest || $resetRequest['expires_at'] < time()) {
    //     throw new Exception('Invalid or expired reset token');
    // }
    
    // TODO: Update user's password in database
    // $success = update_user_password($resetRequest['email'], password_hash($newPassword, PASSWORD_DEFAULT));
    
    // TODO: Delete used reset token
    // delete_reset_token($token);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Password has been successfully updated'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update password'
    ]);
}
