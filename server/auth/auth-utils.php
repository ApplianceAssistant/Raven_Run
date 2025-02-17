<?php
require_once __DIR__ . '/../utils/db_connection.php';
require_once __DIR__ . '/../utils/errorHandler.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use \Firebase\JWT\JWT;

function generateJWT($payload) {
    $key = $_ENV['JWT_SECRET'];
    $issuedAt = time();
    $expirationTime = $issuedAt + (int)$_ENV['JWT_EXPIRATION']; // Use existing expiration time

    $token_payload = array(
        "iat" => $issuedAt,
        "exp" => $expirationTime,
        "data" => $payload
    );

    return JWT::encode($token_payload, $key, 'HS256');
}

function verifyJWT($token) {
    try {
        $key = $_ENV['JWT_SECRET'];
        $decoded = JWT::decode($token, $key, array('HS256'));
        return $decoded->data;
    } catch(Exception $e) {
        handleException($e);
        return false;
    }
}

function getFrontendUrl() {
    $env = $_ENV['APP_ENV'] ?? 'development';
    return match($env) {
        'production' => 'https://crowtours.com',
        'staging' => 'https://ravenruns.com',
        'development' => 'http://localhost:5000',
        default => 'http://localhost:5000'
    };
}

function handleOAuthError($message) {
    $frontend_url = getFrontendUrl();
    header("Location: $frontend_url/log-in?error=" . urlencode($message));
    exit;
}

function handleOAuthSuccess($token) {
    $frontend_url = getFrontendUrl();
    header("Location: $frontend_url/log-in?token=" . urlencode($token));
    exit;
}
