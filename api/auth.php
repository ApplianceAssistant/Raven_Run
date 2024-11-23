<?php
if (!function_exists('getAuthorizationHeader')) {
    require_once(__DIR__ . '/../server/db_connection.php');
    require_once(__DIR__ . '/errorHandler.php');

    function getAuthorizationHeader() {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        }
        elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        }
        elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        // If we still don't have the headers, try to get from $_SERVER
        if (!$headers) {
            //The HTTP_AUTHORIZATION server variable is not set
            //Apache does not pass authorization header by default
            //For this we need to add the following rewrite rule in .htaccess file
            //RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
            $headers = $_SERVER["HTTP_AUTHORIZATION"] ?? $_SERVER["REDIRECT_HTTP_AUTHORIZATION"] ?? null;
        }
        
        return $headers;
    }
}

if (!function_exists('getBearerToken')) {
    function getBearerToken() {
        $headers = getAuthorizationHeader();
        // HEADER: Get the access token from the header
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}

if (!function_exists('authenticateUser')) {
    function authenticateUser() {
        $token = getBearerToken();
        if (!$token) {
            return null;
        }

        try {
            $conn = getDbConnection();
            $stmt = $conn->prepare("SELECT user_id, expiration FROM auth_tokens WHERE token = ?");
            $stmt->bind_param("s", $token);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($row = $result->fetch_assoc()) {
                if (strtotime($row['expiration']) < time()) {
                    invalidateAuthToken($token);
                    return null;
                }

                $userId = $row['user_id'];
                $userStmt = $conn->prepare("SELECT id, username, email FROM users WHERE id = ? LIMIT 1");
                $userStmt->bind_param("i", $userId);
                $userStmt->execute();
                $userResult = $userStmt->get_result();

                if ($user = $userResult->fetch_assoc()) {
                    return $user;
                }
            }
        } catch (Exception $e) {
            error_log("Authentication error: " . $e->getMessage());
            return null;
        }

        return null;
    }
}

if (!function_exists('generateAuthToken')) {
    function generateAuthToken($userId) {
        $conn = getDbConnection();
        $token = bin2hex(random_bytes(32));
        $expiration = date('Y-m-d H:i:s', strtotime('+1 day'));

        $stmt = $conn->prepare("INSERT INTO auth_tokens (user_id, token, expiration) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $userId, $token, $expiration);
        
        if ($stmt->execute()) {
            return $token;
        } else {
            return null;
        }
    }
}

if (!function_exists('invalidateAuthToken')) {
    function invalidateAuthToken($token) {
        $conn = getDbConnection();
        $stmt = $conn->prepare("DELETE FROM auth_tokens WHERE token = ?");
        $stmt->bind_param("s", $token);
        return $stmt->execute();
    }
}