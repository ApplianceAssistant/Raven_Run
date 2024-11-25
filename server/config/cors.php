<?php

require_once __DIR__ . '/../db_connection.php';

function getAllowedOrigins() {
    // Ensure environment variables are loaded
    if (!isset($_ENV['APP_ENV'])) {
        loadEnv(); // Call loadEnv again if needed
    }

    $env = $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?? 'development';
    $originsEnvVar = strtoupper($env) . '_CORS_ORIGINS';
    $originsString = $_ENV[$originsEnvVar] ?? getenv($originsEnvVar);
    
    $debug = [
        'environment' => $env,
        'originsEnvVar' => $originsEnvVar,
        'originsString' => $originsString ?: 'null',
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        'php_version' => PHP_VERSION,
        'sapi_name' => php_sapi_name(),
        'env_check' => [
            'app_env' => $_ENV['APP_ENV'] ?? 'not set',
            'dev_cors' => $_ENV['DEVELOPMENT_CORS_ORIGINS'] ?? 'not set',
            'cors_origin' => $_ENV['CORS_ORIGIN'] ?? 'not set'
        ]
    ];
    
    if ($originsString) {
        $origins = explode(',', $originsString);
        $origins = array_map('trim', $origins);
        $debug['parsed_origins'] = $origins;
        $debug['final_origins'] = $origins;
        $GLOBALS['cors_debug'] = $debug;
        return $origins;
    }
    
    // Fallback to default CORS_ORIGIN
    $defaultOrigin = $_ENV['CORS_ORIGIN'] ?? getenv('CORS_ORIGIN');
    $debug['default_origin'] = $defaultOrigin ?: 'null';
    $origins = $defaultOrigin ? [trim($defaultOrigin)] : [];
    $debug['final_origins'] = $origins;
    
    // Store debug info in global variable
    $GLOBALS['cors_debug'] = $debug;
    
    return $origins;
}

function handleCors() {
    $allowedOrigins = getAllowedOrigins();
    $debug = $GLOBALS['cors_debug'] ?? [];
    
    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $debug['request_info'] = [
        'origin' => $requestOrigin,
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'http_referer' => $_SERVER['HTTP_REFERER'] ?? 'none',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    // Only set CORS headers if we have an Origin header
    if ($requestOrigin) {
        // Check if the request origin is allowed
        $originAllowed = in_array($requestOrigin, $allowedOrigins);
        $debug['allowed_origins'] = $allowedOrigins;
        $debug['origin_allowed'] = $originAllowed;
        
        // Set Access-Control-Allow-Origin only if origin is allowed
        if ($originAllowed) {
            header("Access-Control-Allow-Origin: $requestOrigin");
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
            header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
            header("Access-Control-Allow-Credentials: true");
            
            // Handle preflight requests
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                header("HTTP/1.1 200 OK");
                exit();
            }
        }
    }
    
    // Always set security headers
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("X-XSS-Protection: 1; mode=block");
    
    $debug['headers_sent'] = headers_list();
    $GLOBALS['cors_debug'] = $debug;
}

// Call handleCors at the end of the file
handleCors();
