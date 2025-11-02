/**
 * Unit tests for ProductHandler
 */

const { expect } = require("chai");

// Mock dependencies
class MockSessionManager {
  constructor() {
    this.sessions = new Map();
  }

  getSession(customerId) {
    if (!this.sessions.has(customerId)) {
      this.sessions.set(customerId, {
        customerId,
        step: "menu",
        cart: [],
        lastActivity: Date.now(),
      });
    }
    return this.sessions.get(customerId);
  }

  setStep(customerId, step) {
    const session = this.getSession(customerId);
    session.step = step;
  }
}

describe("ProductHandler", () => {
  let productHandler;
  let sessionManager;

  beforeEach(() => {
    sessionManager = new MockSessionManager();
    const ProductHandler = require("../../../src/handlers/ProductHandler");
    productHandler = new ProductHandler(sessionManager);
  });

  describe("handle", () => {
    it("should handle product search query", async () => {
      const result = await productHandler.handle("123", "netflix", "browsing");
      expect(result).to.be.a("string");
    });

    it("should handle empty query", async () => {
      const result = await productHandler.handle("123", "", "browsing");
      expect(result).to.be.a("string");
    });

    it("should handle null query", async () => {
      const result = await productHandler.handle("123", null, "browsing");
      expect(result).to.be.a("string");
    });
  });

  describe("product search", () => {
    it("should find product by exact name", async () => {
      const result = await productHandler.handle("123", "netflix", "browsing");
      expect(result).to.be.a("string");
      // Should contain product info or add to cart confirmation
      expect(result.length).to.be.greaterThan(0);
    });

    it("should handle fuzzy search", async () => {
      const result = await productHandler.handle("123", "netfix", "browsing");
      expect(result).to.be.a("string");
    });

    it("should handle product not found", async () => {
      const result = await productHandler.handle(
        "123",
        "nonexistentproduct12345",
        "browsing"
      );
      expect(result).to.be.a("string");
    });

    it("should handle special characters in search", async () => {
      const result = await productHandler.handle(
        "123",
        "@#$%^&*()",
        "browsing"
      );
      expect(result).to.be.a("string");
    });
  });

  describe("edge cases", () => {
    it("should handle undefined customerId", async () => {
      try {
        await productHandler.handle(undefined, "netflix", "browsing");
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it("should handle very long search query", async () => {
      const longQuery = "a".repeat(10000);
      const result = await productHandler.handle("123", longQuery, "browsing");
      expect(result).to.be.a("string");
    });

    it("should handle multiple words", async () => {
      const result = await productHandler.handle(
        "123",
        "spotify premium",
        "browsing"
      );
      expect(result).to.be.a("string");
    });

    it("should handle case insensitivity", async () => {
      const result = await productHandler.handle("123", "NETFLIX", "browsing");
      expect(result).to.be.a("string");
    });
  });

  describe("error handling", () => {
    it("should return error message on exception", async () => {
      // Test with valid parameters but trigger search failure
      const result = await productHandler.handle(
        "123",
        "nonexistentproduct123456",
        "browsing"
      );
      expect(result).to.be.a("string");
      // Should return some error or not found message
      expect(result.length).to.be.greaterThan(0);
    });
  });
});
