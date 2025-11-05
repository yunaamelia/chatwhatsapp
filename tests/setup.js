/**
 * Jest Global Setup
 * Runs after Jest framework is installed but before test files execute
 * Used for extending matchers and setting up global test hooks
 *
 * Best practices from Context7:
 * - Global setup runs once for all tests
 * - Use setupFilesAfterEnv for test framework extensions
 * - Access to Jest globals (expect, describe, test, etc.)
 */

// Global timeout for all tests (30 seconds for WhatsApp operations)
jest.setTimeout(30000);

// Clean up after each test to prevent test pollution
afterEach(() => {
  // Restore all mocks
  jest.restoreAllMocks();

  // Clear all timers
  jest.clearAllTimers();
});

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection in tests:", error);
});

console.log("✓ Jest test environment initialized");
console.log("✓ Global timeout: 30000ms");
console.log("✓ Auto-cleanup enabled after each test");
