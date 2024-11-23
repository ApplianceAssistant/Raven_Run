<?php

function encryptData($data) {
    $key = getenv('ENCRYPTION_KEY');
    if (!$key) {
        throw new Exception('Encryption key not found');
    }
    
    $ivlen = openssl_cipher_iv_length($cipher = "AES-256-CBC");
    $iv = openssl_random_pseudo_bytes($ivlen);
    $ciphertext_raw = openssl_encrypt($data, $cipher, $key, OPENSSL_RAW_DATA, $iv);
    $hmac = hash_hmac('sha256', $ciphertext_raw, $key, true);
    return base64_encode($iv . $hmac . $ciphertext_raw);
}

function decryptData($encryptedData) {
    $key = getenv('ENCRYPTION_KEY');
    if (!$key) {
        throw new Exception('Encryption key not found');
    }
    
    $c = base64_decode($encryptedData);
    $ivlen = openssl_cipher_iv_length($cipher = "AES-256-CBC");
    $iv = substr($c, 0, $ivlen);
    $hmac = substr($c, $ivlen, $sha2len = 32);
    $ciphertext_raw = substr($c, $ivlen + $sha2len);
    $original_plaintext = openssl_decrypt($ciphertext_raw, $cipher, $key, OPENSSL_RAW_DATA, $iv);
    $calcmac = hash_hmac('sha256', $ciphertext_raw, $key, true);
    if (hash_equals($hmac, $calcmac)) {
        return $original_plaintext;
    }
    return false;
}

function hashPassword($password) {
    $salt = getenv('SALT');
    if (!$salt) {
        throw new Exception('Salt not found');
    }
    
    // Add salt to password before hashing
    $saltedPassword = $password . $salt;
    return password_hash($saltedPassword, PASSWORD_BCRYPT);
}

function verifyPassword($password, $hash) {
    $salt = getenv('SALT');
    if (!$salt) {
        throw new Exception('Salt not found');
    }
    
    // Add salt to password before verifying
    $saltedPassword = $password . $salt;
    return password_verify($saltedPassword, $hash);
}