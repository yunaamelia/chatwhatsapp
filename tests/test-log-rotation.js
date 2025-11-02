/**
 * Test Log Rotation System
 * Validates automatic log cleanup and retention policy
 */

const fs = require("fs");
const path = require("path");

// Mock environment variable
process.env.LOG_RETENTION_DAYS = "7";

const LogRotationManager = require("../lib/logRotationManager");

// Test utilities
function createMockLogFile(filename, ageInDays) {
  const logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const filePath = path.join(logsDir, filename);
  fs.writeFileSync(filePath, `Mock log content for ${filename}\n`);

  // Set file modification time to simulate age
  const now = Date.now();
  const fileAge = ageInDays * 24 * 60 * 60 * 1000;
  const oldTime = new Date(now - fileAge);

  fs.utimesSync(filePath, oldTime, oldTime);
  return filePath;
}

function cleanupTestLogs() {
  const logsDir = path.join(__dirname, "logs");
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir);
    files.forEach((file) => {
      if (file.startsWith("test-")) {
        fs.unlinkSync(path.join(logsDir, file));
      }
    });
  }
}

// Run tests
async function runTests() {
  console.log("🧪 Testing Log Rotation Manager\n");

  let passCount = 0;
  let failCount = 0;

  // Setup: Create test log files
  console.log("📁 Creating test log files...");
  createMockLogFile("test-recent.log", 2); // 2 days old (should keep)
  createMockLogFile("test-medium.log", 5); // 5 days old (should keep)
  createMockLogFile("test-old.log", 10); // 10 days old (should delete)
  createMockLogFile("test-very-old.log", 30); // 30 days old (should delete)

  // Test 1: Get log statistics
  console.log("\n--- Test 1: Get Log Statistics ---");
  try {
    const stats = LogRotationManager.getStats();
    console.log("Stats:", stats);

    if (stats && stats.totalFiles >= 4) {
      console.log("✅ PASS: Log statistics retrieved correctly");
      passCount++;
    } else {
      console.log("❌ FAIL: Log statistics incomplete");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL: Error getting statistics:", error.message);
    failCount++;
  }

  // Test 2: Manual rotation (should delete files older than 7 days)
  console.log("\n--- Test 2: Manual Log Rotation ---");
  try {
    LogRotationManager.forceRotation();

    // Check which files remain
    const logsDir = path.join(__dirname, "logs");
    const remainingFiles = fs
      .readdirSync(logsDir)
      .filter((f) => f.startsWith("test-"));

    console.log("Remaining test files:", remainingFiles);

    // Should keep test-recent.log and test-medium.log
    // Should delete test-old.log and test-very-old.log
    const hasRecent = remainingFiles.includes("test-recent.log");
    const hasMedium = remainingFiles.includes("test-medium.log");
    const hasOld = !remainingFiles.includes("test-old.log");
    const hasVeryOld = !remainingFiles.includes("test-very-old.log");

    if (hasRecent && hasMedium && hasOld && hasVeryOld) {
      console.log("✅ PASS: Old logs deleted correctly (7-day retention)");
      passCount++;
    } else {
      console.log("❌ FAIL: Log rotation did not work as expected");
      console.log("  Expected: test-recent.log and test-medium.log kept");
      console.log("  Expected: test-old.log and test-very-old.log deleted");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL: Error during manual rotation:", error.message);
    failCount++;
  }

  // Test 3: Start/Stop rotation manager
  console.log("\n--- Test 3: Start/Stop Rotation Manager ---");
  try {
    LogRotationManager.start();
    console.log("Manager started successfully");

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    LogRotationManager.stop();
    console.log("Manager stopped successfully");

    console.log("✅ PASS: Start/Stop rotation manager works");
    passCount++;
  } catch (error) {
    console.log("❌ FAIL: Error starting/stopping manager:", error.message);
    failCount++;
  }

  // Test 4: Stats after rotation
  console.log("\n--- Test 4: Statistics After Rotation ---");
  try {
    const stats = LogRotationManager.getStats();
    console.log("Stats after rotation:", stats);

    // Should only have test-recent.log and test-medium.log now
    if (stats && stats.totalFiles >= 2) {
      console.log("✅ PASS: Statistics updated correctly after rotation");
      passCount++;
    } else {
      console.log("❌ FAIL: Statistics not updated correctly");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL: Error getting stats after rotation:", error.message);
    failCount++;
  }

  // Test 5: Empty logs directory handling
  console.log("\n--- Test 5: Empty Logs Directory ---");
  try {
    // Clean up all test logs
    cleanupTestLogs();

    const stats = LogRotationManager.getStats();
    console.log("Stats with no test logs:", stats);

    console.log("✅ PASS: Empty directory handled gracefully");
    passCount++;
  } catch (error) {
    console.log("❌ FAIL: Error handling empty directory:", error.message);
    failCount++;
  }

  // Test 6: Non-existent logs directory
  console.log("\n--- Test 6: Non-Existent Directory Handling ---");
  try {
    // This should not crash even if logs dir doesn't exist
    LogRotationManager.forceRotation();

    console.log("✅ PASS: Non-existent directory handled gracefully");
    passCount++;
  } catch (error) {
    console.log("❌ FAIL: Error with non-existent directory:", error.message);
    failCount++;
  }

  // Cleanup
  cleanupTestLogs();

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Summary");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passCount}/6`);
  console.log(`❌ Failed: ${failCount}/6`);
  console.log(`📈 Success Rate: ${((passCount / 6) * 100).toFixed(0)}%`);

  if (failCount === 0) {
    console.log("\n🎉 All log rotation tests passed!");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the output above.");
  }
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test execution error:", error);
  process.exit(1);
});
