<?php
// Include the database connection file that has CORS headers
require_once __DIR__ . '/../server/db_connection.php';

try {
    // Get database connection
    $conn = getDbConnection();
    
    if ($conn === null) {
        throw new Exception("Failed to establish database connection");
    }
    
    // Test the connection
    $testQuery = "SELECT 1";
    $result = $conn->query($testQuery);
    
    if ($result) {
        echo json_encode(['status' => 'success', 'message' => 'Database connection successful']);
    } else {
        throw new Exception("Query failed: " . $conn->error);
    }
} catch (Exception $e) {
    error_log("DB Test Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
}