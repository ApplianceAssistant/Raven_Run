<?php
// visitors.php

// Set headers for JSON response and CORS
header('Content-Type: application/json');
require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/db_connection.php';
require_once __DIR__ . '/../../auth/admin-auth.php';

// 1. Authenticate and authorize the user as an admin
requireAdmin();

// 2. Get date range from query parameters
$startDate = $_GET['startDate'] ?? date('Y-m-d', strtotime('-30 days'));
$endDate = $_GET['endDate'] ?? date('Y-m-d');
$endDate = $endDate . ' 23:59:59';

try {
    $conn = getDbConnection();

    // 3. Prepare and execute the SQL query
    // We can provide a summary or raw data. Let's start with raw data.
    // We'll join with users to get the username for logged-in visits.
    $stmt = $conn->prepare(
        "SELECT 
            pv.id, pv.page_url, pv.ip_address, pv.visit_timestamp, u.username
         FROM PageVisits pv
         LEFT JOIN users u ON pv.user_id = u.id
         WHERE pv.visit_timestamp >= ? AND pv.visit_timestamp <= ? 
         ORDER BY pv.visit_timestamp DESC"
    );
    
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $visits = [];
    while ($row = $result->fetch_assoc()) {
        $visits[] = $row;
    }

    $stmt->close();
    $conn->close();

    // 4. Send the response
    echo json_encode([
        'status' => 'success',
        'data' => $visits,
        'query' => [
            'startDate' => $startDate,
            'endDate' => substr($endDate, 0, 10)
        ]
    ]);

} catch (Exception $e) {
    // Handle errors
    http_response_code(500);
    error_log("Admin API Error (visitors.php): " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while fetching visitor data.',
        'detail' => $e->getMessage()
    ]);
}