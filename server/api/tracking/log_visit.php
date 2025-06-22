<?php
require_once __DIR__ . '/../../utils/db_connection.php';
require_once __DIR__ . '/../../auth/auth.php'; // For authenticateUser()
require_once __DIR__ . '/../../utils/errorHandler.php'; // For error handling, if you have one

header('Content-Type: application/json; charset=utf-8');

// Handle CORS if necessary (copy from ai.php if needed)
/*
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    // Add other CORS headers if your frontend sends them (e.g., Content-Type)
    header('Access-Control-Allow-Headers: Content-Type, Authorization'); 
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: POST, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Only POST method is accepted.']);
    exit;
}

try {
    // Allow raw input to be injected for testing purposes
    if (!isset($rawInput)) {
        $rawInput = file_get_contents('php://input');
    }
    $data = json_decode($rawInput, true);

    if (json_last_error() !== JSON_ERROR_NONE || !isset($data['page_url'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Invalid input. "page_url" is required.']);
        exit;
    }

    $pageUrl = filter_var($data['page_url'], FILTER_SANITIZE_URL);
    if (empty($pageUrl)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Invalid "page_url".']);
        exit;
    }

    $authenticatedUser = authenticateUser();
    $userId = $authenticatedUser ? (int)$authenticatedUser['id'] : null;
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    $conn = getDbConnection();
    if (!$conn) {
        // Log error internally, don't expose DB issues to client
        error_log("log_visit.php: Failed to get database connection.");
        http_response_code(500); // Internal Server Error
        echo json_encode(['status' => 'error', 'message' => 'Server error, please try again later.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO PageVisits (user_id, ip_address, page_url) VALUES (?, ?, ?)");
    if (!$stmt) {
        error_log("log_visit.php: Failed to prepare statement: " . $conn->error);
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error, please try again later.']);
        exit;
    }

    // For user_id, if it's null, it should be bound as NULL, not 0.
    // The type 'i' for user_id expects an integer. If $userId is null, bind_param might coerce it.
    // It's often safer to handle NULL explicitly or ensure your table/DB handles 0 as expected if $userId can be 0.
    // However, our $userId is null if not authenticated. The 'i' type with a null PHP value usually works correctly with MySQL to insert NULL.
    $stmt->bind_param(is_null($userId) ? "sss" : "iss", $userId, $ipAddress, $pageUrl);
    
    // Correction for bind_param if user_id is null:
    // We need to pass $userId directly. If it's null, mysqli handles it correctly for nullable INT columns when 'i' is used.
    // However, to be absolutely explicit or if issues arise:
    if (is_null($userId)) {
        $stmt->bind_param("sss", $dummyNull, $ipAddress, $pageUrl); // This is not quite right for 'i'
        // A common way is to bind all as strings if one can be null and the DB handles conversion,
        // or use a conditional bind. For simplicity, relying on mysqli's coercion of null for 'i' type.
        // Let's stick to the direct approach first as it's usually fine:
        $stmt->bind_param($userId === null ? "sss" : "iss", $userId, $ipAddress, $pageUrl);
         // Actually, the most robust way is to pass $userId as is, and ensure the column is nullable.
         // The 'i' type specifier in bind_param will correctly handle a PHP null value for an SQL NULL integer.
         // So, the original $stmt->bind_param("iss", $userId, $ipAddress, $pageUrl); is fine if $userId is null.
         // The issue in my thought process was overcomplicating the null binding.
         // Sticking to the simpler original:
    }
    // The original simple bind should be:
    $stmt->bind_param("iss", $userId, $ipAddress, $pageUrl);
    // If $userId is null, it will be inserted as NULL in the DB if the column is nullable.


    if (!$stmt->execute()) {
        error_log("log_visit.php: Failed to execute statement: " . $stmt->error);
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error, please try again later.']);
        exit;
    }

    $stmt->close();
    // Do not close $conn if it's managed globally or persistently

    echo json_encode(['status' => 'success', 'message' => 'Visit logged.']);

} catch (Exception $e) {
    error_log("log_visit.php: Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An unexpected error occurred.',
        // 'detail' => $e->getMessage() // Optionally include for debugging, not for production
    ]);
}
?>