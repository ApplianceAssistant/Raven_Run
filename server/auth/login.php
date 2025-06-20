<?php
require_once __DIR__ . '/../utils/db_connection.php';
require_once __DIR__ . '/../utils/encryption.php';
require_once __DIR__ . '/../utils/errorHandler.php';
require_once __DIR__ . '/auth.php';

// Set content type to JSON and CORS headers
header('Content-Type: application/json');

// Allow CORS for development
$allowedOrigins = [
    'http://localhost:5000',  // Development
    'http://localhost:3000',  // Alternative development port
    'https://ravenruns.com',  // Staging
    'https://crowtours.com'   // Production
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

// Get database connection
$conn = getDbConnection();
if (!$conn) {
    $response = [
        'status' => 'error',
        'message' => 'Failed to connect to database',
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
            'message' => 'Invalid JSON data: ' . json_last_error_msg(),
            'code' => 400
        ];
        echo json_encode($response);
        exit(0);
    }

    if (!isset($data['action'])) {
        $response = [
            'status' => 'error',
            'message' => 'Action is required',
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
                    'message' => 'Email and password are required',
                    'code' => 400
                ];
                echo json_encode($response);
                exit(0);
            }

            $email = $data['email'];
            $password = $data['password'];

            // Get user by email
            $stmt = $conn->prepare('SELECT id, username, email, password, temporary_account, role_id FROM users WHERE email = ?');
            if (!$stmt) {
                error_log('Prepare failed: ' . $conn->error);
                $response = [
                    'status' => 'error',
                    'message' => 'Database error: Failed to prepare statement',
                    'debug_info' => $conn->error,
                    'code' => 500
                ];
                echo json_encode($response);
                exit(0);
            }

            $stmt->bind_param('s', $email);
            if (!$stmt->execute()) {
                error_log('Execute failed: ' . $stmt->error);
                $response = [
                    'status' => 'error',
                    'message' => 'Database error: Failed to execute query',
                    'debug_info' => $stmt->error,
                    'code' => 500
                ];
                echo json_encode($response);
                exit(0);
            }

            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if (!$user) {
                error_log('Login failed: User not found for email: ' . $email);
                $response = [
                    'status' => 'error',
                    'message' => 'Invalid email or password',
                    'debug_info' => 'User not found',
                    'code' => 401
                ];
                echo json_encode($response);
                exit(0);
            }

            if (!verifyPassword($password, $user['password'])) {
                error_log('Login failed: Invalid password for email: ' . $email);
                $response = [
                    'status' => 'error',
                    'message' => 'Invalid email or password',
                    'debug_info' => 'Password verification failed',
                    'code' => 401
                ];
                echo json_encode($response);
                exit(0);
            }

            // Generate JWT token
            $token = generateAuthToken($user['id']);

            // Remove password from user data
            unset($user['password']);

            // Set HttpOnly cookie for the auth token
            $cookieName = 'authToken';
            $cookieValue = $token;
            $expiry = time() + (86400 * 30); // 30 days
            $path = '/';
            $domain = ''; // Current domain
            $secure = true; // True for HTTPS only, false for HTTP/HTTPS. Set to false for local dev if not using HTTPS.
            $httpOnly = true;
            $sameSite = 'Lax'; // Lax or Strict

            setcookie($cookieName, $cookieValue, [
                'expires' => $expiry,
                'path' => $path,
                'domain' => $domain,
                'secure' => $secure,
                'httponly' => $httpOnly,
                'samesite' => $sameSite
            ]);

            $response = [
                'status' => 'success',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'temporary_account' => (bool)$user['temporary_account'],
                    'role_id' => (int)$user['role_id']
                ]
                // Token is no longer sent in the response body
            ];

            echo json_encode($response);
            break;

        case 'logout':
            // Get the current token from the Authorization header
            $token = getBearerToken(); // This will need to be updated to check cookie
            if ($token) {
                // Invalidate the token
                if (invalidateAuthToken($token)) { // This logic might also change based on cookie
                    $response = [
                        'status' => 'success',
                        'message' => 'Logged out successfully'
                    ];
                } else {
                    error_log('Failed to invalidate token during logout');
                    $response = [
                        'status' => 'warning',
                        'message' => 'Logged out but failed to clear session token'
                    ];
                }
            } else {
                $response = [
                    'status' => 'success',
                    'message' => 'Logged out successfully (no token found)'
                ];
            }
            // Clear the HttpOnly cookie
            setcookie('authToken', '', [
                'expires' => time() - 3600, // Set to past to expire immediately
                'path' => '/',
                'domain' => '',
                'secure' => true, // Match settings from login
                'httponly' => true,
                'samesite' => 'Lax' // Match settings from login
            ]);

            echo json_encode($response);
            break;

        default:
            $response = [
                'status' => 'error',
                'message' => 'Invalid action',
                'code' => 400
            ];
            echo json_encode($response);
            exit(0);
    }
} catch (Exception $e) {
    error_log('Exception caught: ' . $e->getMessage());
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
