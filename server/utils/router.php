<?php
// Development router for PHP's built-in server
error_reporting(E_ALL);
ini_set('display_errors', 1);
// Global UTF-8 Configuration
ini_set('default_charset', 'UTF-8');
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');
mb_http_input('UTF-8');
mb_regex_encoding('UTF-8');

// Set default timezone
date_default_timezone_set('UTC');

// Force content type for all responses
header('Content-Type: application/json; charset=utf-8');

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

// Get the requested game
$request_uri = $_SERVER['REQUEST_URI'];
$game = parse_url($request_uri, PHP_URL_PATH);

// Remove leading slash if present
$game = ltrim($game, '/');

// Handle permanent_uploads directory requests
if (strpos($game, 'permanent_uploads/') === 0) {
    $file = dirname(dirname(dirname(__FILE__))) . '/' . $game;
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

// If the game is empty, serve index
if (empty($game)) {
    echo json_encode([
        'status' => 'ok',
        'message' => 'API server running',
        'endpoints' => '/test-endpoints.php'
    ]);
    exit();
}

// Map the game to the corresponding PHP file
$file = __DIR__ . '/' . $game;

if (file_exists($file)) {
    // Set up the environment
    $_SERVER['SCRIPT_FILENAME'] = $file;
    $_SERVER['SCRIPT_NAME'] = '/' . $game;
    $_SERVER['PHP_SELF'] = '/' . $game;
    $_SERVER['DOCUMENT_ROOT'] = __DIR__;
    
    // Include the PHP file
    require $file;
} else {
    error_log("File not found: " . $file);
    header('HTTP/1.1 404 Not Found');
    echo json_encode([
        'error' => 'Endpoint not found',
        'game' => $game,
        'file' => $file,
        'document_root' => __DIR__
    ]);
}
