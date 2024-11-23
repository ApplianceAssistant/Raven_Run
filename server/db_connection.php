<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header('Access-Control-Allow-Origin: http://localhost:5000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// If this is a preflight request, end it here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 204 No Content');
    exit(0);
}

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// deny direct access to env file
if (php_sapi_name() !== 'cli') {
    if (preg_match('/\.env$/', $_SERVER['REQUEST_URI'])) {
        header('HTTP/1.0 403 Forbidden');
        exit('Access denied');
    }
}

// Load environment variables manually
function loadEnv() {
    $dotenv = __DIR__ . '/../.env';
    if (file_exists($dotenv)) {
        $lines = file($dotenv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                putenv(sprintf('%s=%s', $key, $value));
                $_ENV[$key] = $value;
            }
        }
    }
}

loadEnv();

// Detect environment
$env = getenv('APP_ENV');
if (!$env) {
    // Check if we're running locally
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
    $env = (strpos($host, 'localhost') !== false || $host === '127.0.0.1') ? 'development' : 'production';
    putenv("APP_ENV=$env");
}

// Set CORS headers based on environment
$allowedOrigins = [
    'production' => [getenv('PRODUCTION_URL')],
    'staging' => [getenv('STAGING_URL')],
    'development' => ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000']
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (isset($allowedOrigins[$env]) && in_array($origin, $allowedOrigins[$env])) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

session_start();

function validateConfig($config) {
    $required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    foreach ($required as $field) {
        if (!isset($config[$field]) || empty($config[$field])) {
            throw new Exception("Missing required configuration: {$field}");
        }
    }
    return true;
}

// Initialize global connection variable
$GLOBALS['db_connection'] = null;
$GLOBALS['db_connection_count'] = 0;

/**
 * Get database connection
 * @return mysqli|null Database connection
 */
function getDbConnection() {
    if (!isset($GLOBALS['db_connection']) || !($GLOBALS['db_connection'] instanceof mysqli) || $GLOBALS['db_connection']->connect_errno) {
        try {
            $host = getenv('DB_HOST') ?: 'localhost';
            $user = getenv('DB_USER') ?: 'crow_local';
            $password = getenv('DB_PASSWORD') ?: 'uQMXWPP6ys';
            $database = getenv('DB_NAME') ?: 'raven_run';
            $port = getenv('DB_PORT') ?: 3306;

            // Create connection
            $GLOBALS['db_connection'] = @new mysqli($host, $user, $password, $database, $port);

            // Check connection
            if ($GLOBALS['db_connection']->connect_error) {
                error_log("Connection failed: " . $GLOBALS['db_connection']->connect_error);
                return null;
            }

            // Set charset to utf8mb4
            if (!$GLOBALS['db_connection']->set_charset("utf8mb4")) {
                error_log("Error setting charset utf8mb4: " . $GLOBALS['db_connection']->error);
                return null;
            }
        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null;
        }
    }
    
    // Increment connection reference count
    $GLOBALS['db_connection_count']++;
    return $GLOBALS['db_connection'];
}

/**
 * Release a database connection
 */
function releaseDbConnection() {
    if (isset($GLOBALS['db_connection_count'])) {
        $GLOBALS['db_connection_count']--;
    }
}

/**
 * Close the database connection if it exists and no one is using it
 */
function closeDbConnection() {
    if (isset($GLOBALS['db_connection']) && 
        $GLOBALS['db_connection'] instanceof mysqli && 
        (!isset($GLOBALS['db_connection_count']) || $GLOBALS['db_connection_count'] <= 0)) {
        $GLOBALS['db_connection']->close();
        $GLOBALS['db_connection'] = null;
        $GLOBALS['db_connection_count'] = 0;
    }
}

// Register shutdown function to ensure connection is closed
register_shutdown_function('closeDbConnection');
