<?php

namespace CrowTours\Tests\Api\Tracking;

use PHPUnit\Framework\TestCase;
use mysqli;

// This test needs to run in a separate process to handle the `exit()` calls in the script.
/**
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class LogVisitTest extends TestCase
{
    private $conn;

    protected function setUp(): void
    {
        parent::setUp();
        // Database connection using an absolute path to the correct file
        $configPath = realpath(__DIR__ . '/../../../config/config.php');
        require $configPath;

        // Database connection
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);
        $this->conn->begin_transaction();
    }

    protected function tearDown(): void
    {
        $this->conn->rollback();
        $this->conn->close();
        parent::tearDown();
    }

    private function callLogVisitScript($userId, $pageUrl, $ipAddress)
    {
        // Set up the environment for the script
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REMOTE_ADDR'] = $ipAddress;
        $_COOKIE['authToken'] = 'test-token-user-' . $userId;

        // Define the raw input directly for the script to use
        $rawInput = json_encode(['page_url' => $pageUrl]);

        // Start output buffering
        ob_start();

        // Load dependencies and the script itself.
        // The $rawInput variable is now in the direct scope for the included script.
        $errorHandlerPath = realpath(__DIR__ . '/../../../utils/errorHandler.php');
        $scriptToTestPath = realpath(__DIR__ . '/../../../api/tracking/log_visit.php');

        require_once $errorHandlerPath;
        include $scriptToTestPath;

        // Get the output and clean the buffer
        return ob_get_clean();
    }

    public function testCallingLogVisitTwiceDoesNotCreateDuplicateRecords()
    {
        $pageUrl = '/test-page-for-duplicates';
        $ipAddress = '127.0.0.1';

        // Call the script the first time
        $output1 = $this->callLogVisitScript(1, $pageUrl, $ipAddress);
        $response1 = json_decode($output1, true);
        $this->assertEquals('success', $response1['status'] ?? null, "First call to log_visit failed. Output: $output1");

        // Call the script the second time
        $output2 = $this->callLogVisitScript(1, $pageUrl, $ipAddress);
        $response2 = json_decode($output2, true);
        $this->assertEquals('success', $response2['status'] ?? null, "Second call to log_visit failed. Output: $output2");

        // Check the database for duplicates
        $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM PageVisits WHERE page_url = ? AND ip_address = ?");
        $stmt->bind_param('ss', $pageUrl, $ipAddress);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $this->assertEquals(1, $result['count'], "Duplicate records were created in the database.");
    }
}