<?php
require_once __DIR__ . '/db_connection.php';
require_once __DIR__ . '/errorHandler.php';

function checkRateLimit($ip_address, $endpoint, $limit = 30, $window = 60) {
    $conn = getDbConnection();
    if (!$conn) {
        return false;
    }

    try {
        // Clean up old rate limit records first
        $cleanup_sql = "DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL ? SECOND)";
        $cleanup_stmt = $conn->prepare($cleanup_sql);
        $cleanup_stmt->bind_param('i', $window);
        $cleanup_stmt->execute();

        // Check current rate limit
        $sql = "SELECT id, requests, window_start FROM rate_limits 
                WHERE ip_address = ? AND endpoint = ? 
                AND window_start > DATE_SUB(NOW(), INTERVAL ? SECOND)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ssi', $ip_address, $endpoint, $window);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if ($row['requests'] >= $limit) {
                return false; // Rate limit exceeded
            }

            // Update request count
            $update_sql = "UPDATE rate_limits SET requests = requests + 1 WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param('i', $row['id']);
            $update_stmt->execute();
        } else {
            // Create new rate limit record
            $insert_sql = "INSERT INTO rate_limits (ip_address, endpoint, requests) VALUES (?, ?, 1)";
            $insert_stmt = $conn->prepare($insert_sql);
            $insert_stmt->bind_param('ss', $ip_address, $endpoint);
            $insert_stmt->execute();
        }

        return true; // Rate limit not exceeded
    } catch (Exception $e) {
        logError($e->getMessage(), 'rateLimit.php');
        return false;
    }
}
