<?php
require_once __DIR__ . '/db_connection.php';
require_once __DIR__ . '/errorHandler.php';

class RateLimit {
    private $conn;
    private $table = 'rate_limits';
    
    public function __construct($conn) {
        $this->conn = $conn;
        $this->ensureTableExists();
    }
    
    private function ensureTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            action VARCHAR(50) NOT NULL,
            attempts INT DEFAULT 1,
            first_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_identifier_action (identifier, action)
        )";
        
        $this->conn->query($sql);
    }
    
    public function isAllowed($identifier, $action, $maxAttempts, $windowSeconds) {
        // Clean up old entries first
        $this->cleanup();
        
        // Check current limits
        $stmt = $this->conn->prepare(
            "SELECT attempts, first_attempt, last_attempt 
             FROM {$this->table} 
             WHERE identifier = ? AND action = ?"
        );
        
        $stmt->bind_param('ss', $identifier, $action);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $windowStart = strtotime("-{$windowSeconds} seconds");
            $firstAttempt = strtotime($row['first_attempt']);
            
            // Reset if outside window
            if ($firstAttempt < $windowStart) {
                $this->resetAttempts($identifier, $action);
                return true;
            }
            
            return $row['attempts'] < $maxAttempts;
        }
        
        return true;
    }
    
    public function increment($identifier, $action) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (identifier, action, attempts) 
             VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE 
             attempts = attempts + 1,
             last_attempt = CURRENT_TIMESTAMP"
        );
        
        $stmt->bind_param('ss', $identifier, $action);
        return $stmt->execute();
    }
    
    private function resetAttempts($identifier, $action) {
        $stmt = $this->conn->prepare(
            "DELETE FROM {$this->table} 
             WHERE identifier = ? AND action = ?"
        );
        
        $stmt->bind_param('ss', $identifier, $action);
        return $stmt->execute();
    }
    
    private function cleanup() {
        // Remove entries older than 24 hours
        $stmt = $this->conn->prepare(
            "DELETE FROM {$this->table} 
             WHERE last_attempt < DATE_SUB(NOW(), INTERVAL 24 HOUR)"
        );
        
        return $stmt->execute();
    }
}

function checkRateLimit($ip_address, $endpoint, $limit = 30, $window = 60) {
    $conn = getDbConnection();
    if (!$conn) {
        return false;
    }

    try {
        // Clean up old rate limit records first
        $cleanup_sql = "DELETE FROM rate_limits WHERE first_attempt < DATE_SUB(NOW(), INTERVAL ? SECOND)";
        $cleanup_stmt = $conn->prepare($cleanup_sql);
        $cleanup_stmt->bind_param('i', $window);
        $cleanup_stmt->execute();

        // Check current rate limit
        $sql = "SELECT id, attempts, first_attempt FROM rate_limits 
                WHERE identifier = ? AND action = ? 
                AND first_attempt > DATE_SUB(NOW(), INTERVAL ? SECOND)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ssi', $ip_address, $endpoint, $window);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if ($row['attempts'] >= $limit) {
                return false; // Rate limit exceeded
            }

            // Update attempt count
            $update_sql = "UPDATE rate_limits SET attempts = attempts + 1 WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param('i', $row['id']);
            $update_stmt->execute();
        } else {
            // Create new rate limit record
            $insert_sql = "INSERT INTO rate_limits (identifier, action, attempts) VALUES (?, ?, 1)";
            $insert_stmt = $conn->prepare($insert_sql);
            $insert_stmt->bind_param('ss', $ip_address, $endpoint);
            $insert_stmt->execute();
        }

        return true; // Rate limit not exceeded
    } catch (Exception $e) {
        error_log($e->getMessage(), 'rateLimit.php');
        return false;
    }
}
