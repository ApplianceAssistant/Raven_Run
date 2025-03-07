<?php
require_once __DIR__ . '/../server/db_connection.php';

// Get request method and game
$method = $_SERVER['REQUEST_METHOD'];
$game = $_SERVER['REQUEST_URI'];

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
    'cors_debug' => $GLOBALS['cors_debug'] ?? 'No debug info available'
];

// Set content type to JSON
header('Content-Type: application/json');

// Output response
echo json_encode($response, JSON_PRETTY_PRINT);
