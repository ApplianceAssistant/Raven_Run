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

function createOrUpdateUser($email, $name, $provider) {
    $conn = getDbConnection();
    
    try {
        // Check if user exists
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Update existing user
            $user = $result->fetch_assoc();
            $stmt = $conn->prepare("UPDATE users SET last_login = NOW(), auth_provider = ? WHERE id = ?");
            $stmt->bind_param("si", $provider, $user['id']);
            $stmt->execute();
            return $user;
        } else {
            // Create new user
            $username = explode('@', $email)[0];
            $stmt = $conn->prepare("INSERT INTO users (email, username, display_name, auth_provider, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->bind_param("ssss", $email, $username, $name, $provider);
            $stmt->execute();
            return [
                'id' => $conn->insert_id,
                'email' => $email,
                'username' => $username,
                'display_name' => $name
            ];
        }
    } catch(Exception $e) {
        handleException($e);
        return false;
    } finally {
        releaseDbConnection();
    }
}

function handleOAuthError($message) {
    $env = $_ENV['APP_ENV'] ?? 'development';
    $frontend_url = match($env) {
        'production' => $_ENV['REACT_APP_PRODUCTION_URL'],
        'staging' => $_ENV['REACT_APP_STAGING_URL'],
        default => $_ENV['REACT_APP_DEVELOPMENT_URL']
    };
    header("Location: $frontend_url/login?error=" . urlencode($message));
    exit;
}

function handleOAuthSuccess($token) {
    $env = $_ENV['APP_ENV'] ?? 'development';
    $frontend_url = match($env) {
        'production' => $_ENV['REACT_APP_PRODUCTION_URL'],
        'staging' => $_ENV['REACT_APP_STAGING_URL'],
        default => $_ENV['REACT_APP_DEVELOPMENT_URL']
    };
    header("Location: $frontend_url/login-callback?token=" . urlencode($token));
    exit;
}
