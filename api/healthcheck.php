<?php
// Allow access from staging domain
header('Access-Control-Allow-Origin: https://phpstack-1356899-4990868.cloudwaysapps.com');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');

// Basic status response
echo json_encode([
    'status' => 'ok',
    'environment' => 'staging',
    'timestamp' => time(),
    'server' => 'cloudways-staging',
    'document_root' => $_SERVER['DOCUMENT_ROOT']
]);
