<?php

require_once(__DIR__ . '/../server/db_connection.php');

function handleError($errno, $errstr, $errfile, $errline)
{
    $error = [
        'code' => $errno,
        'message' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ];
    
    error_log(json_encode($error));
    
    if (in_array($errno, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'details' => $error]);
        exit(1);
    }
    
    return true;
}

set_error_handler('handleError');

function handleException($e) {
    $error = [
        'code' => $e->getCode(),
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
    
    error_log(json_encode($error));
    
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error', 'details' => $error]);
}

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