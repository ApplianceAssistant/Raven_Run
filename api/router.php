<?php
// Development router for PHP's built-in server
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers for development
header('Access-Control-Allow-Origin: http://localhost:5000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle OPTIONS requests for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 204 No Content');
    exit();
}

// Get the requested path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Debug logging
error_log("Request URI: " . $request_uri);
error_log("Path: " . $path);

// Remove leading slash if present
$path = ltrim($path, '/');

// Handle uploads directory requests
if (strpos($path, 'uploads/') === 0) {
    $file = __DIR__ . '/../' . $path;
    if (file_exists($file)) {
        // Set appropriate content type
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        $content_types = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif'
        ];
        if (isset($content_types[$ext])) {
            header('Content-Type: ' . $content_types[$ext]);
        }
        readfile($file);
        exit();
    }
    // If file not found, continue to normal routing
}

// If the path is empty, serve index
if (empty($path)) {
    echo json_encode([
        'status' => 'ok',
        'message' => 'API server running',
        'endpoints' => '/test-endpoints.php'
    ]);
    exit();
}

// Map the path to the corresponding PHP file
$file = __DIR__ . '/' . $path;

error_log("Looking for file: " . $file);

if (file_exists($file)) {
    error_log("File found: " . $file);
    // Set up the environment
    $_SERVER['SCRIPT_FILENAME'] = $file;
    $_SERVER['SCRIPT_NAME'] = '/' . $path;
    $_SERVER['PHP_SELF'] = '/' . $path;
    $_SERVER['DOCUMENT_ROOT'] = __DIR__;
    
    // Include the PHP file
    require $file;
} else {
    error_log("File not found: " . $file);
    header('HTTP/1.1 404 Not Found');
    echo json_encode([
        'error' => 'Endpoint not found',
        'path' => $path,
        'file' => $file,
        'document_root' => __DIR__
    ]);
}
