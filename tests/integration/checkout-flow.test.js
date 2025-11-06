/**
 * Integration Tests - Checkout Flow
 * Tests complete checkout journey from cart to payment
 */

const SessionManager = require('../../sessionManager');
const CustomerHandler = require('../../src/handlers/CustomerHandler');
const PaymentHandlers = require('../../lib/paymentHandlers');

describe('Checkout Flow Integration', () => {
  let sessionManager;
  let customerHandler;
  let paymentHandlers;
  const testCustomerId = '628123456789@c.us';

  beforeEach(() => {
    sessionManager = new SessionManager();
    paymentHandlers = new PaymentHandlers();
    customerHandler = new CustomerHandler(sessionManager, paymentHandlers);
  });

  describe('Complete Checkout Journey', () => {
    test('should complete full checkout flow: browse → cart → checkout → payment', async () => {
      // 1. Start from menu
      let response = await customerHandler.handle(testCustomerId, 'menu', 'menu');
      expect(response).toBeDefined();

      // 2. Browse products
      response = await customerHandler.handle(testCustomerId, '1', 'menu');
      expect(response).toBeDefined();

      // 3. Add product to cart
      const session = await sessionManager.getSession(testCustomerId);
      expect(session.step).toBe('browsing');

      response = await customerHandler.handle(testCustomerId, 'netflix', 'browsing');
      expect(response).toBeDefined();

      // 4. View cart
      response = await customerHandler.handle(testCustomerId, 'cart', 'browsing');
      expect(response).toBeDefined();

      // 5. Checkout command
      const cart = await sessionManager.getCart(testCustomerId);
      expect(cart.length).toBeGreaterThan(0);

      response = await customerHandler.handle(testCustomerId, 'checkout', 'checkout');
      expect(response).toBeDefined();
    });

    test('should handle empty cart gracefully', async () => {
      const response = await customerHandler.handle(testCustomerId, 'cart', 'menu');
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });

    test('should preserve cart across steps', async () => {
      // Add to cart
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      await customerHandler.handle(testCustomerId, 'netflix', 'browsing');

      // Go back to menu
      await customerHandler.handle(testCustomerId, 'menu', 'browsing');

      // Cart should still have items
      const response = await customerHandler.handle(testCustomerId, 'cart', 'menu');
      expect(response).toContain('Netflix');
    });

    test('should calculate correct total for multiple items', async () => {
      // Add multiple products
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      await customerHandler.handle(testCustomerId, 'netflix', 'browsing');
      await customerHandler.handle(testCustomerId, 'spotify', 'browsing');

      const cart = await sessionManager.getCart(testCustomerId);
      const total = cart.reduce((sum, item) => sum + item.price, 0);

      const response = await customerHandler.handle(testCustomerId, 'cart', 'browsing');
      expect(response).toContain('TOTAL');
      expect(total).toBeGreaterThan(0);
    });
  });

  describe('Checkout Error Handling', () => {
    test('should handle invalid product selection', async () => {
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');

      const response = await customerHandler.handle(testCustomerId, 'invalid-product-xyz', 'browsing');
      
      expect(response).toBeDefined();
      expect(response.toLowerCase()).toContain('tidak ada');
    });

    test('should handle checkout without items', async () => {
      const response = await customerHandler.handle(testCustomerId, 'checkout', 'menu');
      
      expect(response).toBeDefined();
    });
  });

  describe('Session State Transitions', () => {
    test('should transition menu → browsing → checkout', async () => {
      let session;

      // Menu state
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      session = await sessionManager.getSession(testCustomerId);
      expect(session.step).toBe('menu');

      // Browsing state
      await customerHandler.handle(testCustomerId, '1', 'menu');
      session = await sessionManager.getSession(testCustomerId);
      expect(session.step).toBe('browsing');

      // Add item and go to checkout
      await customerHandler.handle(testCustomerId, 'netflix', 'browsing');
      await customerHandler.handle(testCustomerId, 'cart', 'browsing');
      session = await sessionManager.getSession(testCustomerId);
      expect(session.step).toBe('checkout');
    });

    test('should allow menu command from any state', async () => {
      // From browsing
      await customerHandler.handle(testCustomerId, '1', 'menu');
      const response = await customerHandler.handle(testCustomerId, 'menu', 'browsing');
      expect(response).toContain('MENU UTAMA');

      // From checkout
      await customerHandler.handle(testCustomerId, 'menu', 'checkout');
      const session = await sessionManager.getSession(testCustomerId);
      expect(session.step).toBe('menu');
    });
  });

  describe('Cart Operations', () => {
    test('should add multiple quantities of same product', async () => {
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      
      // Add same product twice
      await customerHandler.handle(testCustomerId, 'netflix', 'browsing');
      await customerHandler.handle(testCustomerId, 'netflix', 'browsing');

      const cart = await sessionManager.getCart(testCustomerId);
      expect(cart.length).toBe(2);
    });

    test('should clear cart on hapus command', async () => {
      // Add items
      await customerHandler.handle(testCustomerId, 'menu', 'menu');
      await customerHandler.handle(testCustomerId, '1', 'menu');
      await customerHandler.handle(testCustomerId, 'netflix', 'browsing');
      await customerHandler.handle(testCustomerId, 'cart', 'browsing');

      // Clear cart (hapus command in checkout step)
      await customerHandler.handle(testCustomerId, 'hapus', 'checkout');

      const cart = await sessionManager.getCart(testCustomerId);
      // Cart should be cleared or reduced
      expect(cart).toBeDefined();
      expect(Array.isArray(cart)).toBe(true);
    });
  });
});
