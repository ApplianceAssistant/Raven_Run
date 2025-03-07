<?php

require_once __DIR__ . '/../utils/db_connection.php';

function getAllowedOrigins() {
    // Ensure environment variables are loaded
    if (!isset($_ENV['APP_ENV'])) {
        loadEnv(); // Call loadEnv again if needed
    }

    // Get CORS origin from environment variable
    $origin = $_ENV['CORS_ORIGIN'] ?? 'http://localhost:5000';
    
    return [$origin];
}

function handleCors() {
    $allowedOrigins = getAllowedOrigins();
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    
    // If the origin is in our allowed list
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header("HTTP/1.1 200 OK");
            exit();
        }
    }
    
    // Always set security headers
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("X-XSS-Protection: 1; mode=block");
}

// Call handleCors at the end of the file
handleCors();
