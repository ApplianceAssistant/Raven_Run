<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../utils/db_connection.php';
require_once __DIR__ . '/../utils/rateLimit.php';
require_once __DIR__ . '/../utils/errorHandler.php';
require_once __DIR__ . '/auth.php';

// Set content type to JSON and CORS headers
header('Content-Type: application/json');

// Allow CORS for development
$allowedOrigins = [
    'http://localhost:5000',  // Development
    'http://localhost:3000',  // Alternative development port
    'https://ravenruns.com',  // Staging
    'https://crowtours.com'   // Production
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use Postmark\PostmarkClient;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Initialize Postmark client with better error handling
try {
    // Configure Guzzle client for development environment
    if ($_ENV['APP_ENV'] === 'development') {
        $client = new PostmarkClient('POSTMARK_API_TEST');
    } else {
        $client = new PostmarkClient($_ENV['POSTMARK_API_TOKEN']);
    }
} catch (Exception $e) {
    error_log('Postmark client initialization error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Email service configuration error']);
    exit;
}

$fromEmail = $_ENV['POSTMARK_FROM_EMAIL'];
$fromName = $_ENV['POSTMARK_FROM_NAME'];

header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get the email from the request body
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email is required']);
    exit;
}

// Check rate limiting
$rateLimit = new RateLimit(getDbConnection());
if (!$rateLimit->isAllowed($email, 'password_reset', 3, 3600)) { // 3 attempts per hour
    http_response_code(429);
    echo json_encode(['status' => 'error', 'message' => 'Too many password reset attempts. Please try again later.']);
    exit;
}

try {
    $conn = getDbConnection();
    
    // Check if user exists and get username
    $stmt = $conn->prepare("SELECT id, username FROM users WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Don't reveal that the email doesn't exist
        echo json_encode(['status' => 'success', 'message' => 'If an account exists with this email, you will receive password reset instructions.']);
        exit;
    }
    
    $user = $result->fetch_assoc();
    $userId = $user['id'];
    $username = $user['username'];
    
    // Generate a secure random token
    $token = bin2hex(random_bytes(32));
    $expiration = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Store the token in the database
    $stmt = $conn->prepare("INSERT INTO password_reset_tokens (user_id, token, expiration) VALUES (?, ?, ?)");
    $stmt->bind_param('iss', $userId, $token, $expiration);
    $stmt->execute();
    
    // Generate the reset URL
    $resetUrl = $_ENV['REACT_APP_URL'] . "/reset-password?token=" . $token;
    
    // Get browser and OS info
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    $browser = get_browser_name($userAgent);
    $os = get_operating_system($userAgent);
    
    // Prepare template model
    $templateModel = [
        'product_name' => 'Crow Tours',
        'name' => $username,
        'action_url' => $resetUrl,
        'operating_system' => $os,
        'browser_name' => $browser,
        'support_url' => $_ENV['REACT_APP_URL'] . '/contact',
        'product_url' => $_ENV['REACT_APP_URL'],
        'company_name' => 'Crow Tours',
        'company_address' => '' // Add if needed
    ];
    
    // Send the email using Postmark template
    try {
        $client->sendEmailWithTemplate(
            $fromEmail,
            $email,
            'password-reset', // Template alias
            $templateModel
        );
        
        echo json_encode(['status' => 'success', 'message' => 'If an account exists with this email, you will receive password reset instructions.']);
    } catch (\Postmark\Models\PostmarkException $e) {
        error_log('Postmark template error: ' . $e->getMessage() . ' Template data: ' . json_encode($templateModel));
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'An error occurred while sending the reset email']);
        exit;
    } catch (Exception $e) {
        error_log('Email sending error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'An error occurred while processing your request']);
        exit;
    }
    
} catch (Exception $e) {
    error_log('Password reset error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'An error occurred while processing your request']);
}

// Helper function to get browser name
function get_browser_name($userAgent) {
    if (strpos($userAgent, 'Opera') || strpos($userAgent, 'OPR/')) return 'Opera';
    elseif (strpos($userAgent, 'Edge')) return 'Microsoft Edge';
    elseif (strpos($userAgent, 'Chrome')) return 'Chrome';
    elseif (strpos($userAgent, 'Safari')) return 'Safari';
    elseif (strpos($userAgent, 'Firefox')) return 'Firefox';
    elseif (strpos($userAgent, 'MSIE') || strpos($userAgent, 'Trident/7')) return 'Internet Explorer';
    return 'Unknown';
}

// Helper function to get operating system
function get_operating_system($userAgent) {
    if (strpos($userAgent, 'Windows NT 10.0')) return 'Windows 10';
    elseif (strpos($userAgent, 'Windows NT 6.3')) return 'Windows 8.1';
    elseif (strpos($userAgent, 'Windows NT 6.2')) return 'Windows 8';
    elseif (strpos($userAgent, 'Windows NT 6.1')) return 'Windows 7';
    elseif (strpos($userAgent, 'Windows NT 6.0')) return 'Windows Vista';
    elseif (strpos($userAgent, 'Windows NT 5.1')) return 'Windows XP';
    elseif (strpos($userAgent, 'Windows NT 5.0')) return 'Windows 2000';
    elseif (strpos($userAgent, 'Mac')) return 'Mac OS X';
    elseif (strpos($userAgent, 'Linux')) return 'Linux';
    return 'Unknown';
}
