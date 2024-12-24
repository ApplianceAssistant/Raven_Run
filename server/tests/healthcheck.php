<?php
// Allow access from staging domain
header('Access-Control-Allow-Origin: http://localhost:5000');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Credentials: true');

// Basic status response
echo json_encode([
    'status' => 'success',
    'environment' => 'staging',
    'timestamp' => time(),
    'server' => 'cloudways-staging',
    'document_root' => $_SERVER['DOCUMENT_ROOT']
]);
