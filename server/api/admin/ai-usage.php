<?php
// ai-usage.php

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

    // 3. Prepare and execute the SQL query for raw data
    $stmt = $conn->prepare(
        "SELECT 
            au.id, au.ip_address, au.model_used, au.input_tokens, au.output_tokens, au.request_timestamp, u.username
         FROM AiApiUsage au
         LEFT JOIN users u ON au.user_id = u.id
         WHERE au.request_timestamp >= ? AND au.request_timestamp <= ? 
         ORDER BY au.request_timestamp DESC"
    );
    
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $usageData = [];
    $summary = [
        'total_requests' => 0,
        'total_input_tokens' => 0,
        'total_output_tokens' => 0,
        'models' => []
    ];

    while ($row = $result->fetch_assoc()) {
        $usageData[] = $row;
        // Update summary stats
        $summary['total_requests']++;
        $summary['total_input_tokens'] += (int)$row['input_tokens'];
        $summary['total_output_tokens'] += (int)$row['output_tokens'];
        if (!isset($summary['models'][$row['model_used']])) {
            $summary['models'][$row['model_used']] = 0;
        }
        $summary['models'][$row['model_used']]++;
    }

    $stmt->close();
    $conn->close();

    // 4. Send the response
    echo json_encode([
        'status' => 'success',
        'data' => $usageData,
        'summary' => $summary,
        'query' => [
            'startDate' => $startDate,
            'endDate' => substr($endDate, 0, 10)
        ]
    ]);

} catch (Exception $e) {
    // Handle errors
    http_response_code(500);
    error_log("Admin API Error (ai-usage.php): " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while fetching AI usage data.',
        'detail' => $e->getMessage()
    ]);
}