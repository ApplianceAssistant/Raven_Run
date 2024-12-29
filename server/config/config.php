<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/env.php';

// Set CORS headers
cors();

header('Content-Type: application/json');

// Return the encryption key and environment
echo json_encode([
    'encryptionKey' => getenv('ENCRYPTION_KEY'),
    'environment' => getenv('NODE_ENV') ?: 'development'
]);
