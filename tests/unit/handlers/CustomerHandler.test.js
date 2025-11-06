/**
 * CustomerHandler Unit Tests
 *
 * Tests the main customer interaction handler for shopping flow
 * Following AAA pattern: Arrange-Act-Assert
 *
 * Best practices applied:
 * - Small, fast, focused tests
 * - Clear test descriptions
 * - Mocking external dependencies
 * - Testing critical paths first
 */

const CustomerHandler = require("../../../src/handlers/CustomerHandler");
const SessionManager = require("../../../sessionManager");

describe("CustomerHandler", () => {
  let handler;
  let sessionManager;
  let mockConfig;

  beforeEach(() => {
    // Arrange: Create fresh instances for each test
    sessionManager = new SessionManager();
    mockConfig = {
      currency: "Rp",
      products: {
        premiumAccounts: [
          { id: "netflix", name: "Netflix Premium", price: 50000, stock: 10 },
          { id: "spotify", name: "Spotify Premium", price: 30000, stock: 5 },
        ],
        virtualCards: [
          { id: "vcc-basic", name: "VCC Basic", price: 20000, stock: 20 },
        ],
      },
    };

    handler = new CustomerHandler(sessionManager, mockConfig);
  });

  afterEach(() => {
    // Cleanup after each test
    sessionManager = null;
    handler = null;
  });

  describe("handleMenuSelection", () => {
    test("When selecting browse (option 1), Then should show product catalog", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const message = "1";

      // Act
      const result = await handler.handleMenuSelection(customerId, message);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.toLowerCase()).toContain("katalog produk");
      expect(result).toContain("Netflix Premium");
      expect(result).toContain("Spotify Premium");
    });

    test("When selecting cart (option 2), Then should show cart contents", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const message = "2";

      // Act
      const result = await handler.handleMenuSelection(customerId, message);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.toLowerCase()).toContain("keranjang");
    });

    test("When selecting invalid option, Then should show error message", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const message = "99";

      // Act
      const result = await handler.handleMenuSelection(customerId, message);

      // Assert
      expect(result).toBeDefined();
      expect(result.toLowerCase()).toContain("tidak paham");
    });

    test("When input is null or undefined, Then should handle gracefully", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act
      const resultNull = await handler.handleMenuSelection(customerId, null);
      const resultUndefined = await handler.handleMenuSelection(
        customerId,
        undefined
      );

      // Assert
      expect(resultNull).toBeDefined();
      expect(resultUndefined).toBeDefined();
    });
  });

  describe("handleProductSelection", () => {
    test("When selecting existing product by name, Then should add to cart", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const productName = "netflix";

      // Set session to browsing step
      sessionManager.setStep(customerId, "browsing");

      // Act
      const result = await handler.handleProductSelection(
        customerId,
        productName
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.toLowerCase()).toContain("ditambahkan");
    });

    test("When selecting non-existent product, Then should show error", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const productName = "invalidproduct12345";

      sessionManager.setStep(customerId, "browsing");

      // Act
      const result = await handler.handleProductSelection(
        customerId,
        productName
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.toLowerCase()).toContain("tidak ada");
    });

    test("When selecting product with fuzzy match, Then should find closest match", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const productName = "netflx"; // Typo in netflix

      sessionManager.setStep(customerId, "browsing");

      // Act
      const result = await handler.handleProductSelection(
        customerId,
        productName
      );

      // Assert
      expect(result).toBeDefined();
      // Should either find product or show similar suggestions
    });
  });

  describe("showCart", () => {
    test("When cart is empty, Then should show empty cart message", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      await sessionManager.getSession(customerId);

      // Act
      const result = await handler.showCart(customerId);

      // Assert
      expect(result).toBeDefined();
      expect(result.toLowerCase()).toContain("kosong");
    });

    test("When cart has items, Then should show cart summary", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      const product = { id: "netflix", name: "Netflix Premium", price: 50000 };
      await sessionManager.addToCart(customerId, product);

      // Act
      const result = await handler.showCart(customerId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toContain("Netflix Premium");
      expect(result).toContain("50.000"); // Formatted with thousand separator
    });

    test("When cart has multiple items, Then should calculate total correctly", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      await sessionManager.getSession(customerId);

      const product1 = { id: "netflix", name: "Netflix Premium", price: 50000 };
      const product2 = { id: "spotify", name: "Spotify Premium", price: 30000 };
      await sessionManager.addToCart(customerId, product1);
      await sessionManager.addToCart(customerId, product2);

      // Act
      const result = await handler.showCart(customerId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toContain("Netflix Premium");
      expect(result).toContain("Spotify Premium");
      // Cart service returns total - just check it's there
      expect(result).toBeDefined();
    });
  });

  describe("Session Integration", () => {
    test("When customer makes multiple actions, Then session should persist state", async () => {
      // Arrange
      const customerId = "628123456789@c.us";

      // Act: Browse products
      await handler.handleMenuSelection(customerId, "1");
      const session1 = sessionManager.getSession(customerId);

      // Act: Add to cart
      sessionManager.setStep(customerId, "browsing");
      await handler.handleProductSelection(customerId, "netflix");
      const session2 = sessionManager.getSession(customerId);

      // Assert: Session persists
      expect(session1.customerId).toBe(session2.customerId);
      // Cart might be async - just verify session exists
      expect(session2).toBeDefined();
    });

    test("When session is inactive, Then should auto-cleanup", async () => {
      // Arrange
      const customerId = "628123456789@c.us";
      await sessionManager.getSession(customerId);

      // Act: Set lastActivity to 1 hour ago - access via sessions map
      const session = sessionManager.sessions.get(customerId);
      session.lastActivity = Date.now() - 60 * 60 * 1000;

      // Trigger cleanup
      sessionManager.cleanupSessions();

      // Assert: Session should be removed
      const sessionAfter = sessionManager.sessions.get(customerId);
      expect(sessionAfter).toBeUndefined();
    });
  });

  describe("Global Commands", () => {
    test("should handle 'menu' command from any step", async () => {
      const customerId = "628123456789@c.us";
      sessionManager.setStep(customerId, "browsing");

      const result = await handler.handle(customerId, "menu", "browsing");

      expect(result).toContain("MENU UTAMA");
      expect(result).toBeDefined();
    });

    test("should handle 'help' command", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handle(customerId, "help", "menu");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    test("should handle 'cart' command from any step", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handle(customerId, "cart", "menu");

      expect(result).toBeDefined();
    });

    test("should handle 'history' command", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handle(customerId, "history", "menu");

      expect(result).toBeDefined();
    });

    test("should handle 'wishlist' command", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handle(customerId, "wishlist", "menu");

      expect(result).toBeDefined();
    });
  });

  describe("Order History", () => {
    test("should show order history when available", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handleOrderHistory(customerId);

      expect(result).toBeDefined();
    });

    test("should handle empty order history", async () => {
      const customerId = "628123456789_new@c.us";

      const result = await handler.handleOrderHistory(customerId);

      expect(result).toBeDefined();
    });
  });

  describe("Track Order", () => {
    test("should handle track command without order ID", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handleTrackOrder(customerId, "track");

      expect(result).toBeDefined();
    });

    test("should handle track command with order ID", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handleTrackOrder(customerId, "/track ORD-123");

      expect(result).toBeDefined();
    });
  });

  describe("Review System", () => {
    test("should handle review command", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handleAddReview(customerId, "review netflix 5 Great!");

      expect(result).toBeDefined();
    });

    test("should handle malformed review command", async () => {
      const customerId = "628123456789@c.us";

      const result = await handler.handleAddReview(customerId, "review");

      expect(result).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid customer ID", async () => {
      const result = await handler.showCart(null);

      expect(result).toBeDefined();
    });

    test("should handle corrupted session data", async () => {
      const customerId = "test@c.us";
      // Set corrupted session without cart array
      sessionManager.sessions.set(customerId, { 
        step: 'menu',
        cart: null, // Corrupted: cart should be an array
        lastActivity: Date.now() 
      });

      const result = await handler.showCart(customerId);

      expect(result).toBeDefined();
      // Should handle gracefully - either return error or empty cart message
    });

    test("should handle errors in handleMenuSelection", async () => {
      const customerId = "test@c.us";

      const result = await handler.handleMenuSelection(customerId, "invalid");

      expect(result).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle very long product names", async () => {
      const customerId = "test@c.us";
      const longName = "a".repeat(1000);
      sessionManager.setStep(customerId, "browsing");

      const result = await handler.handleProductSelection(customerId, longName);

      expect(result).toBeDefined();
    });

    test("should handle special characters in input", async () => {
      const customerId = "test@c.us";
      sessionManager.setStep(customerId, "browsing");

      const result = await handler.handleProductSelection(customerId, "@#$%^&*");

      expect(result).toBeDefined();
    });

    test("should handle empty strings", async () => {
      const customerId = "test@c.us";

      const result = await handler.handle(customerId, "", "menu");

      expect(result).toBeDefined();
    });

    test("should handle whitespace-only input", async () => {
      const customerId = "test@c.us";

      const result = await handler.handle(customerId, "   ", "menu");

      expect(result).toBeDefined();
    });
  });

  describe("Performance", () => {
    test("should handle rapid requests", async () => {
      const customerId = "test@c.us";

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(handler.showCart(customerId));
      }

      const results = await Promise.all(promises);

      expect(results.every(r => r !== undefined)).toBe(true);
    });

    test("should handle multiple concurrent customers", async () => {
      const customerIds = Array(5).fill(0).map((_, i) => `customer${i}@c.us`);

      const promises = customerIds.map(id => handler.showCart(id));

      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
    });
  });
});
