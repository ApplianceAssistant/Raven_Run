<?php
header('Content-Type: application/json');
require_once('errorHandler.php');
require_once('../server/db_connection.php');

try {
  $conn = getDbConnection();
  $stmt = $conn->prepare('SELECT 1 as test');
  $stmt->execute();
  $result = $stmt->get_result();
  $row = $result->fetch_assoc();
  
  echo json_encode([
      'status' => 'success',
      'message' => 'Database connection successful',
      'data' => $row
  ]);

  $stmt->close();
  $conn->close();
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
      'status' => 'error',
      'message' => 'Database connection failed',
      'error' => $e->getMessage()
  ]);
}
?>