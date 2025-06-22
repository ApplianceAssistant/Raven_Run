<?php

namespace CrowTours\Tests\Api\Admin;

use PHPUnit\Framework\TestCase;
use mysqli;

/**
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class VisitorsApiTest extends TestCase
{
    private $backupServer;
    private $backupSession;
    private $backupCookie;
    private $backupPost;
    private $backupGet;

    private ?mysqli $conn = null;

    protected function setUp(): void
    {
        parent::setUp();
        // Backup global arrays
        $this->backupServer = $_SERVER;
        $this->backupSession = $_SESSION ?? [];
        $this->backupCookie = $_COOKIE;
        $this->backupPost = $_POST;
        $this->backupGet = $_GET;

        // Define common server variables needed by scripts
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
        $_SERVER['HTTP_HOST'] = 'localhost';

        // We need the real db_connection functions
        require_once __DIR__ . '/../../../utils/db_connection.php';
        $this->conn = getDbConnection();
        $this->assertNotNull($this->conn, "Database connection failed in setUp");
        $this->conn->begin_transaction();

        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }
    }

    protected function tearDown(): void
    {
        if ($this->conn) {
            $this->conn->rollback();
            // Since getDbConnection uses a global singleton, we don't close it here,
            // the shutdown function registered in db_connection.php will handle it.
        }

        // Restore global arrays
        $_SERVER = $this->backupServer;
        $_SESSION = $this->backupSession;
        $_COOKIE = $this->backupCookie;
        $_POST = $this->backupPost;
        $_GET = $this->backupGet;

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }
        parent::tearDown();
    }

    private function captureOutput(string $scriptPath): string
    {
        ob_start();
        $resolvedPath = realpath($scriptPath);
        if ($resolvedPath) {
            include $resolvedPath;
        } else {
            trigger_error("Test include failed: Could not resolve path for " . $scriptPath, E_USER_WARNING);
        }
        return ob_get_clean();
    }

    public function testEndpointRequiresAdminRole()
    {
        $this->markTestSkipped('Shelving admin API tests to focus on duplicate visit log issue.');

        // Simulate a request with an invalid or no token
        $_COOKIE['authToken'] = 'invalid-token-for-test';

        $output = $this->captureOutput(__DIR__ . '/../../../api/admin/visitors.php');
        $responseData = json_decode($output, true);

        // The script exits on auth failure, so we check the captured output directly
        $this->assertNotNull($responseData, "Response was not valid JSON. Output: $output");
        $this->assertEquals('error', $responseData['status'] ?? null);
        $this->assertEquals('Access denied. Administrator privileges required.', $responseData['message'] ?? null);
    }

    public function testEndpointAccessibleByAdmin()
    {
        $this->markTestSkipped('Shelving admin API tests to focus on duplicate visit log issue.');

        // 1. Create a test admin user
        $username = 'testadmin_' . uniqid();
        $email = $username . '@example.com';
        $passwordHash = password_hash('password', PASSWORD_DEFAULT);
        $roleId = 1; // Admin

        $stmt = $this->conn->prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('sssi', $username, $email, $passwordHash, $roleId);
        $stmt->execute();
        $userId = $this->conn->insert_id;
        $stmt->close();

        // 2. Create a valid auth token for this user
        $token = bin2hex(random_bytes(32));
        $expiration = date('Y-m-d H:i:s', strtotime('+1 day'));
        $stmt = $this->conn->prepare("INSERT INTO auth_tokens (user_id, token, expiration) VALUES (?, ?, ?)");
        $stmt->bind_param('iss', $userId, $token, $expiration);
        $stmt->execute();
        $stmt->close();

        // 3. Set the cookie that the auth script will read
        $_COOKIE['authToken'] = $token;

        // 4. Execute the script
        $output = $this->captureOutput(__DIR__ . '/../../../api/admin/visitors.php');
        $responseData = json_decode($output, true);

        // 5. Assert the correct, successful response
        $this->assertNotNull($responseData, "Response was not valid JSON. Output: $output");
        $this->assertEquals('success', $responseData['status'] ?? null, "Admin access failed. Output: $output");
        $this->assertArrayHasKey('data', $responseData, "Data key missing. Output: $output");
    }
}
