<?php
// Generate a secure random string for JWT_SECRET
$secret = bin2hex(random_bytes(32));
echo "Generated JWT_SECRET: " . $secret . "\n";
