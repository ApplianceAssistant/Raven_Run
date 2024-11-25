<?php
// Configure error reporting at the very top
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_errors.log');

// Create logs directory if it doesn't exist
if (!file_exists(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0777, true);
}

// Include CORS configuration
require_once __DIR__ . '/config/cors.php';

// Handle CORS before any output
handleCors();

// Start session before any output
session_start();

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
    error_log("Loading environment from: " . $dotenv);
    
    if (file_exists($dotenv)) {
        error_log(".env file exists");
        $lines = file($dotenv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove surrounding quotes if present
                $value = trim($value, '"\'');
                
                // Handle ${VAR} style interpolation
                $value = preg_replace_callback('/\${([^}]+)}/', function($matches) {
                    return getenv($matches[1]) ?: $matches[0];
                }, $value);
                
                error_log("Setting env var: {$key} = {$value}");
                putenv(sprintf('%s=%s', $key, $value));
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;  // Also set in $_SERVER for good measure
            }
        }
        error_log("Environment variables loaded: " . print_r($_ENV, true));
    } else {
        error_log(".env file not found at: " . $dotenv);
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
            $database = getenv('DB_NAME') ?: 'crow_tours';
            $port = getenv('DB_PORT') ?: 3306;

            error_log("DB Connection Attempt - Host: $host, User: $user, Database: $database, Port: $port");
            
            // Test if we can connect without selecting a database first
            $test_conn = @new mysqli($host, $user, $password, null, $port);
            if ($test_conn->connect_error) {
                error_log("Initial connection failed (without database): " . $test_conn->connect_error);
                return null;
            }
            
            // Now try to select the database
            if (!$test_conn->select_db($database)) {
                error_log("Database selection failed: " . $test_conn->error);
                $test_conn->close();
                return null;
            }
            
            $GLOBALS['db_connection'] = $test_conn;

            error_log("Database connection and selection successful");

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
