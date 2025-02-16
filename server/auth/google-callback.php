<?php
require_once __DIR__ . '/../utils/db_connection.php';
require_once __DIR__ . '/../utils/errorHandler.php';
require_once __DIR__ . '/auth-utils.php';

session_start();

if (!isset($_GET['code'])) {
    handleOAuthError('No authorization code provided');
}

// Verify state parameter to prevent CSRF
if (!isset($_GET['state']) || !isset($_SESSION['oauth_state']) || $_GET['state'] !== $_SESSION['oauth_state']) {
    handleOAuthError('Invalid state parameter');
}

// Clear the state from session
unset($_SESSION['oauth_state']);

// Google OAuth configuration
$client_id = $_ENV['GOOGLE_CLIENT_ID'];
$client_secret = $_ENV['GOOGLE_CLIENT_SECRET'];

// Load environment variables
$env = getenv('APP_ENV') ?? 'development';
error_log("Current environment (APP_ENV): " . $env);
error_log("Environment variables:");
error_log("NODE_ENV: " . getenv('NODE_ENV'));
error_log("APP_ENV: " . getenv('APP_ENV'));
error_log("\$_ENV contents: " . print_r($_ENV, true));

$base_url = match($env) {
    'production' => 'https://crowtours.com',
    'staging' => 'https://ravenruns.com',
    default => 'http://localhost:5000'
};

// Use consistent callback path for all environments
$redirect_uri = $base_url . '/server/auth/google-callback.php';
error_log("Using redirect URI: " . $redirect_uri);

try {
    // Exchange authorization code for access token
    $token_url = 'https://oauth2.googleapis.com/token';
    $params = [
        'code' => $_GET['code'],
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'redirect_uri' => $redirect_uri,
        'grant_type' => 'authorization_code'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $token_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception('Failed to get access token: ' . curl_error($ch));
    }
    curl_close($ch);

    $token_data = json_decode($response, true);

    if (!isset($token_data['access_token'])) {
        throw new Exception('Invalid token response from Google');
    }

    // Get user info with access token
    $user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $user_info_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token_data['access_token']
    ]);
    $user_info = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception('Failed to get user info: ' . curl_error($ch));
    }
    curl_close($ch);

    $user_data = json_decode($user_info, true);

    if (!isset($user_data['email'])) {
        throw new Exception('Email not provided by Google');
    }

    // Check if user exists
    $conn = getDbConnection();
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $user_data['email']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Existing user - update login time
        $user = $result->fetch_assoc();
        $stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->bind_param("i", $user['id']);
        $stmt->execute();

        // Generate JWT token
        $token = generateJWT([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username']
        ]);

        handleOAuthSuccess($token);
    } else {
        // New user - store email in session and redirect to display name modal
        $_SESSION['google_signup_email'] = $user_data['email'];
        $frontend_url = $base_url;
        header("Location: $frontend_url/create-profile?needDisplayName=true&email=" . urlencode($user_data['email']));
        exit;
    }

} catch (Exception $e) {
    handleException($e);
    handleOAuthError($e->getMessage());
}
