<?php
require_once __DIR__ . '/../server/db_connection.php';

// Get request method and game
$method = $_SERVER['REQUEST_METHOD'];
$game = $_SERVER['REQUEST_URI'];

// Add environment debugging
$envDebug = [
    'env_file_exists' => file_exists(__DIR__ . '/../.env'),
    'app_env' => $_ENV['APP_ENV'] ?? null,
    'dev_cors' => $_ENV['DEVELOPMENT_CORS_ORIGINS'] ?? null,
    'cors_origin' => $_ENV['CORS_ORIGIN'] ?? null,
    'env_vars' => $_ENV,
    'server_vars' => array_filter($_SERVER, function($key) {
        return in_array($key, ['APP_ENV', 'DEVELOPMENT_CORS_ORIGINS', 'CORS_ORIGIN']);
    }, ARRAY_FILTER_USE_KEY)
];

// Simulate different response types based on request method
$response = [
    'status' => 'success',
    'message' => 'API endpoint accessible',
    'request' => [
        'method' => $method,
        'game' => $game,
        'headers' => getallheaders(),
        'query' => $_GET,
        'body' => json_decode(file_get_contents('php://input'), true)
    ],
    'env_debug' => $envDebug,
    'cors_debug' => $GLOBALS['cors_debug'] ?? 'No debug info available'
];

// Set content type to JSON
header('Content-Type: application/json');

// Output response
echo json_encode($response, JSON_PRETTY_PRINT);
