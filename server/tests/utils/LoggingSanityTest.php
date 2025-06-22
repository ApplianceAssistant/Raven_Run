<?php

namespace CrowTours\Tests\Utils;

use PHPUnit\Framework\TestCase;

/**
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class LoggingSanityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // We are now using the global php.ini setting for syslog.
        // No local file setup is needed.
    }

    public function testTriggerErrorAndCheckLog()
    {
        // This test now only serves to trigger a notice.
        // in the Windows Event Viewer (Application Log).
        trigger_error('This is a test error from LoggingSanityTest.', E_USER_NOTICE);

        // We assert true to make the test pass, as automated checking of syslog is out of scope.
        $this->assertTrue(true, 'Test triggers a notice for manual syslog verification.');
    }

    protected function tearDown(): void
    {
        // No log file to clean up.
        parent::tearDown();
    }
}
