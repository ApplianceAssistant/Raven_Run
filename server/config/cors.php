<?php

require_once __DIR__ . '/../utils/db_connection.php';

function getAllowedOrigins() {
    // Ensure environment variables are loaded
    if (!isset($_ENV['APP_ENV'])) {
        loadEnv(); // Call loadEnv again if needed
    }

    $env = $_ENV['APP_ENV'] ?? 'development';

    // In development, allow both localhost ports
    if ($env === 'development') {
        return [
            'http://localhost:5000',
            'http://localhost:3000', // Also allow default React port
            'http://127.0.0.1:5000',
            'http://127.0.0.1:3000'
        ];
    }

    // Get CORS origins from environment variables
    $originsEnvVar = strtoupper($env) . '_CORS_ORIGINS';
    $originsString = $_ENV[$originsEnvVar] ?? '*';
    
    if ($originsString) {
        $origins = explode(',', $originsString);
        $origins = array_map('trim', $origins);
        return $origins;
    }
    
    return ['*']; // Default to allow all origins if none specified
}

function handleCors() {
    $allowedOrigins = getAllowedOrigins();
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    
    // If the origin is in our allowed list or we're allowing all origins
    if (in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins)) {
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
