<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

// Now we can use $mainConfig['ENCRYPTION_KEY'] and $mainConfig['SALT']

function encryptData($data) {
    global $mainConfig;
    $cipher = "aes-256-cbc";
    $ivlen = openssl_cipher_iv_length($cipher);
    $iv = openssl_random_pseudo_bytes($ivlen);
    $encrypted = openssl_encrypt($data, $cipher, $mainConfig['ENCRYPTION_KEY'], 0, $iv, $tag);
    return base64_encode($iv . $encrypted . $tag);
}

function decryptData($encryptedData) {
    global $mainConfig;
    $cipher = "aes-256-cbc";
    $data = base64_decode($encryptedData);
    $ivlen = openssl_cipher_iv_length($cipher);
    $iv = substr($data, 0, $ivlen);
    $tag = substr($data, -16);
    $encrypted = substr($data, $ivlen, -16);
    return openssl_decrypt($encrypted, $cipher, $mainConfig['ENCRYPTION_KEY'], 0, $iv, $tag);
}

function hashPassword($password) {
    global $mainConfig;
    return password_hash($password . $mainConfig['SALT'], PASSWORD_BCRYPT);
}

function verifyPassword($password, $hash) {
    global $mainConfig;
    return password_verify($password . $mainConfig['SALT'], $hash);
}
?>