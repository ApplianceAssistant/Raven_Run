<?php

$conn = getDbConnection();
function handleError($errno, $errstr, $errfile, $errline)
{
    error_log(json_encode($errstr));
    echo json_encode(array('error' => 'An internal error occurred:' . $errstr . "errline: " . $errline));
    global $conn;
    $error = array(
        'error' => $errstr,
        'file' => $errfile,
        'line' => $errline
    );
    $query = "INSERT INTO errorLog (errno, error, file, line, dateTime) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("issss", $errno, $errstr, $errfile, $errline, date('Y-m-d H:i:s'));
    $stmt->execute();
    $stmt->close();
    $conn->close();
    exit;
}
set_error_handler('handleError');
