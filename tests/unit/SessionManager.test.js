const SessionManager = require("../../sessionManager");

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
};

describe("SessionManager", () => {
  let sessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  afterEach(() => {
    // Cleanup sessions after each test
    sessionManager.sessions.clear();
    sessionManager.messageCount.clear();
  });

  describe("getSession", () => {
    test("When customer has no session, Then should create new session", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act
      const session = await sessionManager.getSession(customerId);

      // Assert
      expect(session).toBeDefined();
      expect(session.customerId).toBe(customerId);
      expect(session.step).toBe("menu");
      expect(session.cart).toEqual([]);
      expect(session.wishlist).toEqual([]);
    });

    test("When customer has existing session, Then should return same instance", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act
      const session1 = await sessionManager.getSession(customerId);
      const session2 = await sessionManager.getSession(customerId);

      // Assert
      expect(session1).toBe(session2);
    });

    test("When different customers, Then should have isolated sessions", async () => {
      // Arrange
      const customer1 = "628111111111@c.us";
      const customer2 = "628222222222@c.us";

      // Act
      const session1 = await sessionManager.getSession(customer1);
      const session2 = await sessionManager.getSession(customer2);

      // Assert
      expect(session1).not.toBe(session2);
      expect(session1.customerId).toBe(customer1);
      expect(session2.customerId).toBe(customer2);
    });
  });

  describe("setStep", () => {
    test("When setting new step, Then should update session step", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      await sessionManager.getSession(customerId);

      // Act
      await sessionManager.setStep(customerId, "browsing");

      // Assert
      const session = await sessionManager.getSession(customerId);
      expect(session.step).toBe("browsing");
    });

    test("When setting step, Then should update lastActivity timestamp", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const session = await sessionManager.getSession(customerId);
      const oldActivity = session.lastActivity;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act
      await sessionManager.setStep(customerId, "checkout");

      // Assert
      const newSession = await sessionManager.getSession(customerId);
      expect(newSession.lastActivity).toBeGreaterThanOrEqual(oldActivity);
    });
  });

  describe("Rate Limiting", () => {
    test("When under rate limit, Then should allow messages", () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const results = [];

      // Act: Send 25 messages
      for (let i = 0; i < 25; i++) {
        results.push(sessionManager.canSendMessage(customerId));
      }

      // Assert: First 20 allowed, rest blocked
      expect(results.slice(0, 20).every((r) => r === true)).toBe(true);
      expect(results.slice(20).every((r) => r === false)).toBe(true);
    });

    test("When rate limit exceeded, Then should block messages", () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act: Hit rate limit
      for (let i = 0; i < 20; i++) {
        sessionManager.canSendMessage(customerId);
      }

      // Try one more (21st)
      const blocked = sessionManager.canSendMessage(customerId);

      // Assert
      expect(blocked).toBe(false);
    });

    test("When rate limit window resets, Then should allow messages again", () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Hit rate limit
      for (let i = 0; i < 20; i++) {
        sessionManager.canSendMessage(customerId);
      }

      // Should be blocked
      expect(sessionManager.canSendMessage(customerId)).toBe(false);

      // Act: Manually reset (simulating 60s passing)
      sessionManager.messageCount.delete(customerId);

      // Assert: Should allow again
      const result = sessionManager.canSendMessage(customerId);
      expect(result).toBe(true);
    });
  });

  describe("cleanupSessions", () => {
    test("When session is active, Then should NOT be cleaned up", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      await sessionManager.getSession(customerId);

      // Act
      sessionManager.cleanupSessions();

      // Assert
      const session = sessionManager.sessions.get(customerId);
      expect(session).toBeDefined();
    });

    test("When session is inactive for 30+ minutes, Then should be cleaned up", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const session = await sessionManager.getSession(customerId);

      // Set session lastActivity to 31 minutes ago
      session.lastActivity = Date.now() - 31 * 60 * 1000;

      // Act
      sessionManager.cleanupSessions();

      // Assert
      const sessionAfter = sessionManager.sessions.get(customerId);
      expect(sessionAfter).toBeUndefined();
    });

    test("When multiple sessions with mixed activity, Then should cleanup only inactive", async () => {
      // Arrange
      const activeCustomer = "628111111111@c.us";
      const inactiveCustomer = "628222222222@c.us";

      // Create sessions
      const activeSession = await sessionManager.getSession(activeCustomer);
      const inactiveSession = await sessionManager.getSession(inactiveCustomer);

      // Set times
      inactiveSession.lastActivity = Date.now() - 31 * 60 * 1000; // 31 min ago
      activeSession.lastActivity = Date.now() - 5 * 60 * 1000; // 5 min ago

      // Act
      sessionManager.cleanupSessions();

      // Assert
      const activeSessionCheck = sessionManager.sessions.get(activeCustomer);
      const inactiveSessionCheck =
        sessionManager.sessions.get(inactiveCustomer);
      expect(activeSessionCheck).toBeDefined();
      expect(inactiveSessionCheck).toBeUndefined();
    });
  });
});
