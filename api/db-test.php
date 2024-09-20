<?php
header('Content-Type: application/json');

require_once('../server/db_connection.php');

try {
  $conn = getDbConnection();
  $result = $conn->query('SELECT 1 as test');
  $row = $result->fetch_assoc();
  
  echo json_encode([
      'status' => 'success',
      'message' => 'Database connection successful',
      'data' => $row
  ]);

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