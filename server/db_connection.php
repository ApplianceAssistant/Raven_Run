<?php
// Load environment variables from .env file
$env_path = realpath(__DIR__ . '/../../private_html/.env');
if (file_exists($env_path)) {
    $env_vars = parse_ini_file($env_path);
    foreach ($env_vars as $key => $value) {
        putenv("$key=$value");
    }
} else {
    die('Error loading .env file');
}

// Create a database connection
function getDbConnection() {
    $host = getenv('DB_HOST');
    $user = getenv('DB_USER');
    $password = getenv('DB_PASSWORD');
    $database = getenv('DB_NAME');
    $port = getenv('DB_PORT') ?: 3306;

    $conn = new mysqli($host, $user, $password, $database, $port);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    return $conn;
}
?>