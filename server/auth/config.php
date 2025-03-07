<?php
require_once __DIR__ . '/../utils/db_connection.php';
require_once __DIR__ . '/../utils/encryption.php';
require_once __DIR__ . '/../utils/errorHandler.php';

// Set content type to JSON
header('Content-Type: application/json');

// Return just the encryption key
echo json_encode([
    'encryptionKey' => $_ENV['ENCRYPTION_KEY'] ?: 'MY_SECRET_ENCRYPTION_KEY'
]);
