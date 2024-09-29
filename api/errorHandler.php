<?php

require_once('../server/db_connection.php');

function handleError($errno, $errstr, $errfile, $errline)
{
    $conn = getDbConnection();
    
    // Log the error
    error_log(json_encode($errstr));
    
    // Prepare the error response
    $errorResponse = array(
        'success' => false,
        'error' => 'An internal error occurred',
        'details' => $errstr,
        'file' => $errfile,
        'line' => $errline
    );
    
    // In development environment, you might want to include more details
    if ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1') {
        $errorResponse['debug'] = debug_backtrace();
    }
    
    // Set the appropriate HTTP status code
    $httpStatusCode = ($errno == E_USER_ERROR) ? 500 : 400;
    http_response_code($httpStatusCode);
    
    // Output the JSON response
    header('Content-Type: application/json');
    echo json_encode($errorResponse);
    
    // Log the error to the database
    $query = "INSERT INTO errorLog (errno, error, file, line, dateTime) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("issss", $errno, $errstr, $errfile, $errline, date('Y-m-d H:i:s'));
    $stmt->execute();
    $stmt->close();
    
    $conn->close();
    exit;
}

set_error_handler('handleError');

// Helper functions for specific error types
function handleNotFoundError($message = 'Resource not found') {
    handleError(E_USER_ERROR, $message, __FILE__, __LINE__);
}

function handleUnauthorizedError($message = 'Unauthorized access') {
    handleError(E_USER_ERROR, $message, __FILE__, __LINE__);
}

function handleBadRequestError($message = 'Bad request') {
    handleError(E_USER_WARNING, $message, __FILE__, __LINE__);
}