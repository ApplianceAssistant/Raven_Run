<?php
// Load environment variables
require_once 'db_connection.php';

echo "Database Configuration:\n";
echo "Host: " . ($_ENV['DB_HOST'] ?? 'not set') . "\n";
echo "User: " . ($_ENV['DB_USER'] ?? 'not set') . "\n";
echo "Database: " . ($_ENV['DB_NAME'] ?? 'not set') . "\n";
echo "Port: " . ($_ENV['DB_PORT'] ?? 'not set') . "\n\n";

echo "Test 1: First connection attempt\n";
$conn1 = getDbConnection();
if ($conn1) {
    echo "Connection successful!\n";
    echo "Server info: " . $conn1->server_info . "\n";
    echo "Server version: " . $conn1->server_version . "\n";
} else {
    echo "Connection failed!\n";
    echo "Last error: " . mysqli_connect_error() . "\n";
}

echo "\nTest 2: Second connection attempt (should reuse connection)\n";
$conn2 = getDbConnection();
if ($conn2) {
    echo "Connection successful!\n";
    echo "Server info: " . $conn2->server_info . "\n";
    echo "Server version: " . $conn2->server_version . "\n";
} else {
    echo "Connection failed!\n";
    echo "Last error: " . mysqli_connect_error() . "\n";
}

echo "\nTest 3: Third connection attempt (should still reuse connection)\n";
$conn3 = getDbConnection();
if ($conn3) {
    echo "Connection successful!\n";
    echo "Server info: " . $conn3->server_info . "\n";
    echo "Server version: " . $conn3->server_version . "\n";
} else {
    echo "Connection failed!\n";
    echo "Last error: " . mysqli_connect_error() . "\n";
}

// Force a new connection by closing the existing one
echo "\nTest 4: Closing connection and attempting new connection\n";
$conn3->close();
$conn4 = getDbConnection();
if ($conn4) {
    echo "Connection successful!\n";
    echo "Server info: " . $conn4->server_info . "\n";
    echo "Server version: " . $conn4->server_version . "\n";
} else {
    echo "Connection failed!\n";
    echo "Last error: " . mysqli_connect_error() . "\n";
}

echo "\nTest complete!\n";