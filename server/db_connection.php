<?php
// Enable error reporting
error_reporting(E_ALL);
header('Content-Type: application/json');
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
header('Access-Control-Allow-Origin: https://crowtours.com');
session_start();

function getDbConnection()
{

    $configPath = realpath($_SERVER["DOCUMENT_ROOT"] . '/../private_html/conf.php');

    if ($configPath === false) {
        die('Configuration file not found');
    }
    if (!is_readable($configPath)) {
        die('Configuration file not readable');
    }
    $mainConfig = include($configPath);

    // Verify that the configuration was loaded successfully
    if (!is_array($mainConfig)) {
        die('Invalid configuration file');
    }

    $dbHost = $mainConfig['DB_HOST'];
    $dbUser = $mainConfig['DB_USER'];
    $dbPassword = $mainConfig['DB_PASSWORD'];
    $dbName = $mainConfig['DB_NAME'];
    $dbPort = $mainConfig['DB_PORT'] ?? 3306; // Use null coalescing operator for optional values
    $conn = new mysqli($dbHost, $dbUser, $dbPassword, $dbName, $dbPort);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    return $conn;
}
