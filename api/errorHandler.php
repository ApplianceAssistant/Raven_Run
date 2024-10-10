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
        'error' => 'An error occurred',
        'details' => $errstr,
        'file' => $errfile,
        'line' => $errline
    );
    
    
    // Set the appropriate HTTP status code
    $httpStatusCode = ($errno == E_USER_ERROR) ? 500 : 400;
    http_response_code($httpStatusCode);
    
    // Output the JSON response
    header('Content-Type: application/json');
    if($errstr == 'Invalid credentials') {
       $errorResponse['error'] = 'Invalid credentials';
    }
    echo json_encode($errorResponse);
    $dateTime = date('Y-m-d H:i:s');
    // Log the error to the database
    $query = "INSERT INTO errorLog (`errorNo`, `record`, `file`,  `line`, `dateTime`) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    try {
        if(!$stmt) {
            throw new Exception("Prepare failed: (" . $conn->errno . ") " . $conn->error);
        }
    } catch (Exception $e) {
        echo $e->getMessage();
    }
    try {
        $bind = $stmt->bind_param("issss", $errno, $errstr, $errfile, $errline, $dateTime);
        if(!$bind) {
            throw new Exception("Binding failed: (" . $conn->errno . ") " . $conn->error);
        }
    } catch (Exception $e) {
        echo $e->getMessage();
    }

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