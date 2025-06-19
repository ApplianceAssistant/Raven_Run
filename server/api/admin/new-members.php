<?php
// new-members.php

// Set headers for JSON response and CORS
header('Content-Type: application/json');
require_once __DIR__ . '/../../utils/cors.php'; // Manages CORS headers
require_once __DIR__ . '/../../utils/db_connection.php';
require_once __DIR__ . '/../../auth/admin-auth.php';

// 1. Authenticate and authorize the user as an admin
requireAdmin();

// 2. Get date range from query parameters
// Default to the last 30 days if not provided
$startDate = $_GET['startDate'] ?? date('Y-m-d', strtotime('-30 days'));
$endDate = $_GET['endDate'] ?? date('Y-m-d');

// Add time to endDate to include the entire day
$endDate = $endDate . ' 23:59:59';

try {
    $conn = getDbConnection();

    // 3. Prepare and execute the SQL query
    $stmt = $conn->prepare(
        "SELECT id, username, email, created_at, temporary_account 
         FROM users 
         WHERE created_at >= ? AND created_at <= ? 
         ORDER BY created_at DESC"
    );
    
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $newMembers = [];
    while ($row = $result->fetch_assoc()) {
        $newMembers[] = $row;
    }

    $stmt->close();
    $conn->close();

    // 4. Send the response
    echo json_encode([
        'status' => 'success',
        'data' => $newMembers,
        'query' => [
            'startDate' => $startDate,
            'endDate' => substr($endDate, 0, 10) // Return date part only
        ]
    ]);

} catch (Exception $e) {
    // Handle errors
    http_response_code(500);
    error_log("Admin API Error (new-members.php): " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while fetching new members.',
        'detail' => $e->getMessage() // For debugging, consider removing in production
    ]);
}