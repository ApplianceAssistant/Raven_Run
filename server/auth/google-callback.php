<?php
require_once __DIR__ . '/../utils/db_connection.php';
require_once __DIR__ . '/../utils/errorHandler.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/auth-utils.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

error_log("Google OAuth Callback - Start");
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
error_log("Query String: " . $_SERVER['QUERY_STRING']);
error_log("Full URL: " . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]");

// Get state from query parameters
$state = $_GET['state'] ?? null;
$code = $_GET['code'] ?? null;

if (!$code) {
    error_log("Error: No authorization code provided");
    handleOAuthError('No authorization code provided');
    exit;
}

if (!$state) {
    error_log("Error: No state parameter received");
    handleOAuthError("Missing state parameter");
    exit;
}

// Store state in session temporarily (it will be used and cleared by the OAuth process)
$_SESSION['oauth_state'] = $state;

// Debug session data
error_log("Session Data: " . print_r($_SESSION, true));

$env = $_ENV['APP_ENV'] ?? 'development';
error_log("Environment: " . $env);

// Get base URL from environment
$base_url = $_ENV['REACT_APP_URL'];
error_log("Using base URL: " . $base_url);

// Set redirect URI
$redirect_uri = $base_url . '/server/auth/google-callback.php';
error_log("Using redirect URI: " . $redirect_uri);

// Google OAuth configuration
$client_id = $_ENV['GOOGLE_CLIENT_ID'];
$client_secret = $_ENV['GOOGLE_CLIENT_SECRET'];

error_log("client_id: " . $client_id);

// Verify client ID and secret are set
if (empty($client_id) || empty($client_secret)) {
    error_log("Error: Missing OAuth credentials");
    error_log("Client ID: " . ($client_id ? 'set' : 'not set'));
    error_log("Client Secret: " . ($client_secret ? 'set' : 'not set'));
    handleOAuthError('OAuth configuration error');
}

try {
    // Initialize Google API client
    $client = new Google_Client();
    $client->setClientId($client_id);
    $client->setClientSecret($client_secret);
    $client->setRedirectUri($redirect_uri);

    // In development, bypass SSL verification
    if ($env === 'development') {
        error_log("Development environment detected - bypassing SSL verification");
        $guzzleClient = new \GuzzleHttp\Client([
            'verify' => false,
            'curl' => [
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false
            ]
        ]);
        $client->setHttpClient($guzzleClient);
    }

    // Exchange authorization code for access token
    $token_url = 'https://oauth2.googleapis.com/token';
    $params = [
        'code' => $code,
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'redirect_uri' => $redirect_uri,
        'grant_type' => 'authorization_code'
    ];

    // Initialize cURL session
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $token_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

    // Disable SSL verification in development environment only
    if ($env === 'development') {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        error_log("Development environment: SSL verification disabled");
    }

    $response = curl_exec($ch);
    $error = curl_error($ch);
    
    if ($error) {
        error_log("cURL Error: " . $error);
        throw new Exception("Failed to get access token: " . $error);
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

    // Disable SSL verification in development environment only
    if ($env === 'development') {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        error_log("Development environment: SSL verification disabled for user info request");
    }

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

        // Generate auth token and store in database
        $authToken = generateAuthToken($user['id']);
        handleError(000, "authToken Returend: $authToken", __FILE__, __LINE__);
        if (!$authToken) {
            throw new Exception('Failed to generate auth token');
        }

        // Generate JWT token with auth token
        $token = generateJWT([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'temporary_account' => (bool)$user['temporary_account'],
            'token' => $authToken  // Include the auth token in JWT
        ]);

        handleOAuthSuccess($token);
    } else {
        // New user - create temporary account
        try {
            // Generate temporary username from email
            $email_parts = explode('@', $user_data['email']);
            $temp_username = $email_parts[0] . '_' . bin2hex(random_bytes(4));
            
            // Create temporary user account
            require_once __DIR__ . '/../api/users/users.php';
            $newUser = createGoogleUser($user_data['email'], $temp_username);
            
            if (!$newUser) {
                throw new Exception('Failed to create temporary account');
            }

            // Generate auth token for new user
            $authToken = generateAuthToken($newUser['id']);
            if (!$authToken) {
                throw new Exception('Failed to generate auth token');
            }

            // Generate JWT for new temporary user with auth token
            $token = generateJWT([
                'user_id' => $newUser['id'],
                'email' => $newUser['email'],
                'username' => $newUser['username'],
                'temporary_account' => true,
                'token' => $authToken  // Include the auth token in JWT
            ]);

            handleOAuthSuccess($token);
        } catch (Exception $e) {
            error_log("Error creating temporary account: " . $e->getMessage());
            handleOAuthError('Failed to create account: ' . $e->getMessage());
        }
    }

} catch (Exception $e) {
    handleException($e);
    handleOAuthError($e->getMessage());
}
