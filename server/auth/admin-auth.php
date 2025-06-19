<?php
require_once __DIR__ . '/auth.php'; // Includes authenticateUser()

if (!function_exists('requireAdmin')) {
    function requireAdmin() {
        $user = authenticateUser();

        if (!$user || !isset($user['role_id']) || (int)$user['role_id'] !== 1) {
            http_response_code(403); // Forbidden
            echo json_encode([
                'status' => 'error',
                'message' => 'Access denied. Administrator privileges required.'
            ]);
            exit; // Stop script execution
        }
        
        // If we reach here, user is an authenticated admin
        return $user; 
    }
}
?>