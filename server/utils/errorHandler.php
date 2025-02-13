<?php

require_once __DIR__ . '/db_connection.php';

function handleError($errno, $errstr, $errfile, $errline)
{
    $error = [
        'code' => $errno ?? 0,
        'message' => $errstr ?? 'unknown',
        'file' => $errfile ?? 'unknown',
        'line' => $errline ?? 0,
        'timestamp' => date('Y-m-d H:i:s'),
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
    ];
    
    // Format error message in a human-readable way
    $logMessage = sprintf(
        "[%s] %s: %s in %s on line %d (URI: %s, Method: %s)\n",
        $error['timestamp'],
        getErrorTypeName($errno),
        $error['message'],
        $error['file'],
        $error['line'],
        $error['request_uri'],
        $error['request_method']
    );
    
    error_log($logMessage);
    
    if (in_array($errno, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'details' => $error]);
        exit(1);
    }
    
    return true;
}

function handleException($e) {
    $error = [
        'type' => get_class($e) ?? 'unknown',
        'message' => $e->getMessage() ?? 'unknown',
        'file' => $e->getFile() ?? 'unknown',
        'line' => $e->getLine() ?? 0,
        'trace' => $e->getTraceAsString() ?? '',
        'timestamp' => date('Y-m-d H:i:s'),
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
    ];
    
    // Format exception message in a human-readable way
    $logMessage = sprintf(
        "[%s] Exception %s: %s in %s on line %d\nStack Trace:\n%s\n(URI: %s, Method: %s)\n",
        $error['timestamp'],
        $error['type'],
        $error['message'],
        $error['file'],
        $error['line'],
        $error['trace'],
        $error['request_uri'],
        $error['request_method']
    );
    
    error_log($logMessage);
    
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error', 'details' => $error]);
}

// Helper function to get error type name
function getErrorTypeName($errno) {
    switch ($errno) {
        case E_ERROR: return 'E_ERROR';
        case E_WARNING: return 'E_WARNING';
        case E_PARSE: return 'E_PARSE';
        case E_NOTICE: return 'E_NOTICE';
        case E_CORE_ERROR: return 'E_CORE_ERROR';
        case E_CORE_WARNING: return 'E_CORE_WARNING';
        case E_COMPILE_ERROR: return 'E_COMPILE_ERROR';
        case E_COMPILE_WARNING: return 'E_COMPILE_WARNING';
        case E_USER_ERROR: return 'E_USER_ERROR';
        case E_USER_WARNING: return 'E_USER_WARNING';
        case E_USER_NOTICE: return 'E_USER_NOTICE';
        case E_RECOVERABLE_ERROR: return 'E_RECOVERABLE_ERROR';
        case E_DEPRECATED: return 'E_DEPRECATED';
        case E_USER_DEPRECATED: return 'E_USER_DEPRECATED';
        default: return 'UNKNOWN';
    }
}

set_error_handler('handleError');

set_exception_handler('handleException');

// Common HTTP error handling functions
function handleBadRequestError($message) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Bad Request',
        'message' => $message
    ]);
    exit;
}

function handleUnauthorizedError($message) {
    http_response_code(401);
    echo json_encode([
        'error' => 'Unauthorized',
        'message' => $message
    ]);
    exit;
}

function handleForbiddenError($message) {
    http_response_code(403);
    echo json_encode([
        'error' => 'Forbidden',
        'message' => $message
    ]);
    exit;
}

function handleNotFoundError($message) {
    http_response_code(404);
    echo json_encode([
        'error' => 'Not Found',
        'message' => $message
    ]);
    exit;
}

function handleMethodNotAllowedError($message) {
    http_response_code(405);
    echo json_encode([
        'error' => 'Method Not Allowed',
        'message' => $message
    ]);
    exit;
}

function handleConflictError($message) {
    http_response_code(409);
    echo json_encode([
        'error' => 'Conflict',
        'message' => $message
    ]);
    exit;
}