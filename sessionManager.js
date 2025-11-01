/**
 * Session Manager
 * Manages customer sessions and shopping carts
 */

class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Get or create a session for a customer
   * @param {string} customerId - WhatsApp number
   * @returns {Object} Session object
   */
  getSession(customerId) {
    if (!this.sessions.has(customerId)) {
      this.sessions.set(customerId, {
        customerId,
        cart: [],
        step: 'menu',
        lastActivity: Date.now()
      });
    }
    
    // Update last activity
    const session = this.sessions.get(customerId);
    session.lastActivity = Date.now();
    return session;
  }

  /**
   * Add item to cart
   * @param {string} customerId 
   * @param {Object} product 
   */
  addToCart(customerId, product) {
    const session = this.getSession(customerId);
    session.cart.push(product);
  }

  /**
   * Clear cart
   * @param {string} customerId 
   */
  clearCart(customerId) {
    const session = this.getSession(customerId);
    session.cart = [];
  }

  /**
   * Get cart items
   * @param {string} customerId 
   * @returns {Array} Cart items
   */
  getCart(customerId) {
    const session = this.getSession(customerId);
    return session.cart;
  }

  /**
   * Set session step
   * @param {string} customerId 
   * @param {string} step 
   */
  setStep(customerId, step) {
    const session = this.getSession(customerId);
    session.step = step;
  }

  /**
   * Get session step
   * @param {string} customerId 
   * @returns {string} Current step
   */
  getStep(customerId) {
    const session = this.getSession(customerId);
    return session.step;
  }

  /**
   * Clean up inactive sessions (older than 30 minutes)
   */
  cleanupSessions() {
    const thirtyMinutes = 30 * 60 * 1000;
    const now = Date.now();
    
    for (const [customerId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > thirtyMinutes) {
        this.sessions.delete(customerId);
      }
    }
  }
}

module.exports = SessionManager;
