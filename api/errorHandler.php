<?php
function handleError($errno, $errstr, $errfile, $errline)
{
    $error = array(
        'error' => $errstr,
        'file' => $errfile,
        'line' => $errline
    );
    error_log(json_encode($error));
    echo json_encode(array('error' => 'An internal error occurred:' . $errstr . "errline: " . $errline));
    exit;
}

set_error_handler('handleError');
?>