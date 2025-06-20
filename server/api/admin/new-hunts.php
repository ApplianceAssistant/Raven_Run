<?php
// new-hunts.php

// Set headers for JSON response and CORS
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../utils/db_connection.php';
require_once __DIR__ . '/../../auth/admin-auth.php';

// 1. Authenticate and authorize the user as an admin
requireAdmin();

// 2. Get date range from query parameters
$startDate = $_GET['startDate'] ?? date('Y-m-d', strtotime('-30 days'));
$endDate = $_GET['endDate'] ?? date('Y-m-d');
$endDate = $endDate . ' 23:59:59'; // Include the entire end day

try {
    $conn = getDbConnection();

    // 3. Prepare and execute the SQL query
    // We join with the users table to get the creator's username
    $stmt = $conn->prepare(
        "SELECT 
            g.id, g.gameId, g.title, g.created_at, g.is_public, u.username as creator_username, g.challenge_data
         FROM games g
         LEFT JOIN users u ON g.user_id = u.id
         WHERE g.created_at >= ? AND g.created_at <= ? 
         ORDER BY g.created_at DESC"
    );
    
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $newHunts = [];
    while ($row = $result->fetch_assoc()) {
        // Convert is_public to a boolean for cleaner JSON
        $row['is_public'] = (bool)$row['is_public'];
        
        // Decode challenge data and count challenges
        $challenges = json_decode($row['challenge_data'], true);
        $row['challenge_count'] = is_array($challenges) ? count($challenges) : 0;
        unset($row['challenge_data']); // Don't send the raw JSON to the client

        $newHunts[] = $row;
    }

    $stmt->close();

    // 4. Send the response
    echo json_encode([
        'status' => 'success',
        'data' => $newHunts,
        'query' => [
            'startDate' => $startDate,
            'endDate' => substr($endDate, 0, 10)
        ]
    ]);

} catch (Exception $e) {
    // Handle errors
    http_response_code(500);
    error_log("Admin API Error (new-hunts.php): " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while fetching new scavenger hunts.',
        'detail' => $e->getMessage()
    ]);
}