<?php
// Set development environment
putenv('APP_ENV=development');

require_once 'db_connection.php';

echo "Test 1: First connection attempt\n";
$conn1 = getDbConnection();

echo "\nTest 2: Second connection attempt (should reuse connection)\n";
$conn2 = getDbConnection();

echo "\nTest 3: Third connection attempt (should still reuse connection)\n";
$conn3 = getDbConnection();

// Force a new connection by closing the existing one
echo "\nTest 4: Closing connection and attempting new connection\n";
$conn3->close();
$conn4 = getDbConnection();

echo "\nTest complete!\n";