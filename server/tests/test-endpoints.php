<?php
require_once(__DIR__ . '/../server/db_connection.php');

// Test endpoint that returns available API routes
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Track included files to prevent multiple inclusions
$GLOBALS['included_files'] = [];

function safeInclude($file) {
    $fullGame = realgame($file);
    if (!$fullGame) {
        return false;
    }
    
    if (!isset($GLOBALS['included_files'][$fullGame])) {
        $GLOBALS['included_files'][$fullGame] = true;
        return include $file;
    }
    return true;
}

// Helper function to get request body
function getRequestBody() {
    global $__test_input;
    return isset($__test_input) ? $__test_input : file_get_contents('php://input');
}

function captureOutput($file, $method = 'GET', $data = null) {
    // Start output buffering
    ob_start();
    
    // Set up request data
    $_SERVER['REQUEST_METHOD'] = $method;
    
    if ($method === 'POST' && $data) {
        $_POST = $data;
        $_SERVER['CONTENT_TYPE'] = 'application/json';
        $GLOBALS['__test_input'] = json_encode($data);
    }
    
    // Include the file
    $fullGame = __DIR__ . $file;
    if (file_exists($fullGame)) {
        try {
            // Get headers before including file
            $headers = headers_list();
            
            // Include the file safely
            safeInclude($fullGame);
            
            // Get the output
            $output = ob_get_clean();
            
            // Get new headers after including file
            $newHeaders = array_diff(headers_list(), $headers);
            
            // Parse the output as JSON if possible
            $jsonOutput = json_decode($output, true);
            
            return [
                'code' => http_response_code() ?: 200,
                'headers' => $newHeaders,
                'body' => $jsonOutput !== null ? $jsonOutput : $output,
                'error' => null
            ];
        } catch (Exception $e) {
            ob_end_clean();
            return [
                'code' => 500,
                'headers' => [],
                'body' => null,
                'error' => $e->getMessage()
            ];
        }
    } else {
        ob_end_clean();
        return [
            'code' => 404,
            'headers' => [],
            'body' => null,
            'error' => 'File not found: ' . $file
        ];
    }
}

// Define test data for each endpoint
$testData = [
    'db_test' => [
        'method' => 'GET',
        'data' => null
    ],
    'users' => [
        'method' => 'GET',
        'data' => null
    ],
    'auth' => [
        'method' => 'POST',
        'data' => [
            'token' => 'test_token'
        ]
    ],
    'login' => [
        'method' => 'POST',
        'data' => [
            'action' => 'login',
            'email' => 'test@example.com',
            'password' => 'test_password'
        ]
    ],
    'friends' => [
        'method' => 'GET',
        'data' => null
    ]
];

$apiEndpoints = [
    'db_test' => [
        'url' => '/db-test.php',
        'methods' => ['GET'],
        'description' => 'Test database connection'
    ],
    'users' => [
        'url' => '/users.php',
        'methods' => ['GET', 'POST'],
        'description' => 'User management endpoints'
    ],
    'auth' => [
        'url' => '/server/auth/auth.php',
        'methods' => ['POST'],
        'description' => 'Authentication endpoint'
    ],
    'login' => [
        'url' => '/server/auth/login.php',
        'methods' => ['POST'],
        'description' => 'User login endpoint'
    ],
    'friends' => [
        'url' => '/friends.php',
        'methods' => ['GET', 'POST', 'DELETE'],
        'description' => 'Friend management endpoints'
    ]
];

// Initialize database connection before testing
$conn = getDbConnection();

// Test each endpoint
$results = [];
foreach ($apiEndpoints as $key => &$endpoint) {
    try {
        $testConfig = $testData[$key];
        
        // Test the endpoint by including the file directly
        $result = captureOutput($endpoint['url'], $testConfig['method'], $testConfig['data']);
        
        // Determine endpoint status
        $isSuccess = in_array($result['code'], [200, 201, 204, 400, 401, 403]);
        
        // Set response data
        $endpoint['status'] = $isSuccess ? 'available' : 'error';
        $endpoint['statusCode'] = $result['code'];
        $endpoint['response'] = [
            'headers' => $result['headers'],
            'body' => $result['body']
        ];
        
        if (!empty($result['error'])) {
            $endpoint['error'] = $result['error'];
        }
        
        // Store result
        $results[$key] = $result;
        
    } catch (Exception $e) {
        $endpoint['status'] = 'error';
        $endpoint['statusCode'] = 500;
        $endpoint['error'] = $e->getMessage();
    }
}

// Release database connection
releaseDbConnection();

// Get the environment-specific API URL
function getApiUrl() {
    return $_ENV['REACT_APP_URL'] ?? 'http://localhost:8000';
}

// Output results
echo json_encode([
    'timestamp' => date('Y-m-d H:i:s'),
    'baseUrl' => getApiUrl(),
    'endpoints' => $apiEndpoints,
    'server' => [
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'script_filename' => $_SERVER['SCRIPT_FILENAME'],
        'php_include_game' => get_include_game(),
        'included_files' => array_keys($GLOBALS['included_files'])
    ]
]);
