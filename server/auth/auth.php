<?php
require_once __DIR__ . '/../utils/db_connection.php';
require_once __DIR__ . '/../utils/encryption.php';
require_once __DIR__ . '/../utils/errorHandler.php';

if (!function_exists('getAuthorizationHeader')) {
    function getAuthorizationHeader()
    {
        $headers = null;
        
        // Get all headers
        $allHeaders = getallheaders();
        
        // Case-insensitive search for Authorization header
        foreach ($allHeaders as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $headers = $value;
                break;
            }
        }
        
        // Fallbacks if still not found
        if (!$headers) {
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
            } elseif (isset($_SERVER['Authorization'])) {
                $headers = trim($_SERVER['Authorization']);
            } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
            }
        }
        
        return $headers;
    }
}


if (!function_exists('getBearerToken')) {
    function getBearerToken()
    {
        // Check for the authToken cookie
        if (isset($_COOKIE['authToken'])) {
            return $_COOKIE['authToken'];
        }
        
        // Fallback to Authorization header (optional, can be removed if strictly cookie-only)
        // For now, let's keep it to see if any part of the system still relies on it during transition.
        // In a final version, this fallback might be removed for stricter security.
        $headers = getAuthorizationHeader();
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        
        // Don't throw an error, just return null if no token found
        return null;
    }
}

if (!function_exists('authenticateUser')) {
    function authenticateUser()
    {
        try {
            $token = getBearerToken();
            if (!$token) {
                error_log('No bearer token found in request');
                return null;
            }

            $conn = getDbConnection();
            if (!$conn) {
                error_log('Failed to get database connection');
                return null;
            }
            
            // First verify the token exists and get user info
            $stmt = $conn->prepare('SELECT at.user_id, at.expiration, u.id, u.username, u.email, u.role_id 
                                  FROM auth_tokens at 
                                  JOIN users u ON at.user_id = u.id 
                                  WHERE at.token = ? 
                                  LIMIT 1');
            
            if (!$stmt) {
                error_log('Failed to prepare token verification statement: ' . $conn->error);
                return null;
            }
            
            $stmt->bind_param('s', $token);
            if (!$stmt->execute()) {
                error_log('Failed to execute token verification query: ' . $stmt->error);
                return null;
            }
            
            $result = $stmt->get_result();
            if (!$result) {
                error_log('Failed to get result from token verification query');
                return null;
            }

            if ($row = $result->fetch_assoc()) {
                $expirationTime = strtotime($row['expiration']);
                
                if ($expirationTime < time()) {
                    return null;
                }
                
                return [
                    'id' => $row['id'],
                    'username' => $row['username'],
                    'email' => $row['email'],
                    'role_id' => $row['role_id']
                ];
            } else {
                return null;
            }
        } catch (Exception $e) {
            error_log('Authentication error: ' . $e->getMessage());
            return null;
        }
    }
}

if (!function_exists('refreshAuthToken')) {
    function refreshAuthToken($oldToken)
    {
        try {
            $conn = getDbConnection();
            if (!$conn) {
                error_log('Failed to get database connection for token refresh');
                return null;
            }
            // Get user_id from old token
            $stmt = $conn->prepare('SELECT user_id FROM auth_tokens WHERE token = ?');
            if (!$stmt) {
                error_log('Failed to prepare refresh token statement: ' . $conn->error);
                return null;
            }
            $stmt->bind_param('s', $oldToken);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($row = $result->fetch_assoc()) {
                $userId = $row['user_id'];

                // Generate new token
                $newToken = generateAuthToken($userId);
                if (!$newToken) {
                    error_log('Failed to generate new token for user: ' . $userId);
                    return null;
                }

                // Invalidate old token
                if (!invalidateAuthToken($oldToken)) {
                    error_log('Warning: Failed to invalidate old token: ' . $oldToken);
                }

                return $newToken;
            }

            error_log('No user found for token: ' . $oldToken);
            return null;
        } catch (Exception $e) {
            error_log('Token refresh error: ' . $e->getMessage());
            return null;
        }
    }
}

if (!function_exists('generateAuthToken')) {
    function generateAuthToken($userId)
    {
        $conn = getDbConnection();
        $maxAttempts = 3;  // Prevent infinite loops
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            try {
                $token = bin2hex(random_bytes(32));
                $expiration = date('Y-m-d H:i:s', strtotime('+1 day'));

                $stmt = $conn->prepare('INSERT INTO auth_tokens (user_id, token, expiration) VALUES (?, ?, ?)');
                $stmt->bind_param('iss', $userId, $token, $expiration);

                if ($stmt->execute()) {
                    return $token;
                }
            } catch (Exception $e) {
                // If duplicate token, try again
                if ($e->getCode() === 1062) {  // MySQL duplicate entry error
                    $attempt++;
                    continue;
                }
                throw $e;  // Re-throw other errors
            }
            $attempt++;
        }
        return null;  // Could not generate unique token after max attempts
    }
}

if (!function_exists('invalidateAuthToken')) {
    function invalidateAuthToken($token)
    {
        try {
            $conn = getDbConnection();
            if (!$conn) {
                error_log('Failed to get database connection for token invalidation');
                return false;
            }

            $stmt = $conn->prepare('DELETE FROM auth_tokens WHERE token = ?');
            if (!$stmt) {
                error_log('Failed to prepare invalidate token statement: ' . $conn->error);
                return false;
            }

            $stmt->bind_param('s', $token);
            $result = $stmt->execute();
            
            if (!$result) {
                error_log('Failed to execute invalidate token: ' . $stmt->error);
                return false;
            }

            return true;
        } catch (Exception $e) {
            error_log('Error invalidating token: ' . $e->getMessage());
            return false;
        }
    }
}
