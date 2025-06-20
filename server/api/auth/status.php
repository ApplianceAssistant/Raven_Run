<?php
require_once __DIR__ . '/../../auth/auth.php';
require_once __DIR__ . '/../../utils/db_connection.php';
require_once __DIR__ . '/../../utils/errorHandler.php';

// Set content type to JSON and CORS headers
header('Content-Type: application/json');

// Allow CORS for development (mirroring login.php)
$allowedOrigins = [
    'http://localhost:5000',  // Development
    'http://localhost:3000',  // Alternative development port
    'https://ravenruns.com',  // Staging
    'https://crowtours.com'   // Production
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, OPTIONS'); // Allow GET for status check
    header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Authorization might not be strictly needed here but good for consistency
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight request for GET
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure this script is only accessed via GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit();
}

try {
    $user = authenticateUser(); // This now uses the HttpOnly cookie

    if ($user) {
        // User is authenticated, return user details (excluding sensitive info)
        $response = [
            'status' => 'success',
            'isAuthenticated' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role_id' => $user['role_id']
                // Do NOT include tokens or passwords here
            ]
        ];
        http_response_code(200);
        echo json_encode($response);
    } else {
        // User is not authenticated or token is invalid/expired
        $response = [
            'status' => 'success', // It's a successful check, just not authenticated
            'isAuthenticated' => false,
            'user' => null
        ];
        http_response_code(200); // Or 401 if you prefer to signal error for no auth
        echo json_encode($response);
    }
} catch (Exception $e) {
    error_log('Auth status check error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An internal server error occurred while checking authentication status.',
        'detail' => $e->getMessage() // For development; remove in production
    ]);
} finally {
    releaseDbConnection(); // Ensure connection is released if it was opened
}
