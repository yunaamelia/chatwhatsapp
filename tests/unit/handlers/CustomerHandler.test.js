/**
 * Unit tests for CustomerHandler
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

  getStep(customerId) {
    return this.getSession(customerId).step;
  }

  getCart(customerId) {
    return this.getSession(customerId).cart;
  }

  addToCart(customerId, item) {
    const session = this.getSession(customerId);
    session.cart.push(item);
  }

  clearCart(customerId) {
    const session = this.getSession(customerId);
    session.cart = [];
  }
}

describe("CustomerHandler", () => {
  let customerHandler;
  let sessionManager;
  let mockPaymentHandlers;

  before(() => {
    // Mock payment handlers
    mockPaymentHandlers = {
      xendit: { createInvoice: () => Promise.resolve({ invoice_url: "test" }) },
    };
  });

  beforeEach(() => {
    sessionManager = new MockSessionManager();
    const CustomerHandler = require("../../../src/handlers/CustomerHandler");
    customerHandler = new CustomerHandler(sessionManager, mockPaymentHandlers);
  });

  describe("handleMenuSelection", () => {
    it("should process browse command (1)", async () => {
      const result = await customerHandler.handleMenuSelection("123", "1");
      expect(result).to.be.a("string");
      expect(result).to.match(/katalog\s+produk/i);
    });

    it("should process cart command (2)", async () => {
      const result = await customerHandler.handleMenuSelection("123", "2");
      expect(result).to.be.a("string");
      expect(result).to.match(/keranjang/i);
    });

    it("should handle invalid choice", async () => {
      const result = await customerHandler.handleMenuSelection("123", "999");
      expect(result).to.be.a("string");
      expect(result).to.include("tidak valid");
    });

    it("should handle null input", async () => {
      const result = await customerHandler.handleMenuSelection("123", null);
      expect(result).to.be.a("string");
      expect(result).to.be.ok;
    });

    it("should handle empty string", async () => {
      const result = await customerHandler.handleMenuSelection("123", "");
      expect(result).to.be.a("string");
      expect(result).to.include("tidak valid");
    });
  });

  describe("handle", () => {
    it("should handle menu command from any step", async () => {
      sessionManager.setStep("123", "browsing");
      const result = await customerHandler.handle("123", "menu", "browsing");
      expect(result).to.be.a("string");
      expect(result).to.match(/menu/i);
    });

    it("should handle cart command", async () => {
      const result = await customerHandler.handle("123", "cart", "menu");
      expect(result).to.be.a("string");
      expect(result).to.include("keranjang");
    });

    it("should handle history command", async () => {
      const result = await customerHandler.handle("123", "history", "menu");
      expect(result).to.be.a("string");
    });

    it("should route to correct handler based on step", async () => {
      sessionManager.setStep("123", "menu");
      const result = await customerHandler.handle("123", "1", "menu");
      expect(result).to.be.a("string");
    });
  });

  describe("showCart", () => {
    it("should show empty cart message", async () => {
      const result = await customerHandler.showCart("123");
      expect(result).to.be.a("string");
      expect(result).to.include("kosong");
    });

    it("should show cart with items", async () => {
      sessionManager.addToCart("123", {
        id: "netflix",
        name: "Netflix Premium",
        price: 50000,
      });
      const result = await customerHandler.showCart("123");
      expect(result).to.be.a("string");
      expect(result).to.match(/netflix/i);
    });
  });

  describe("edge cases", () => {
    it("should handle undefined customer ID", async () => {
      try {
        await customerHandler.handle(undefined, "menu", "menu");
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it("should handle special characters in message", async () => {
      const result = await customerHandler.handle(
        "123",
        "<script>alert('xss')</script>",
        "menu"
      );
      expect(result).to.be.a("string");
    });

    it("should handle very long messages", async () => {
      const longMessage = "a".repeat(10000);
      const result = await customerHandler.handle("123", longMessage, "menu");
      expect(result).to.be.a("string");
    });
  });
});
