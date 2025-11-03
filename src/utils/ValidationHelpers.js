/**
 * Validation Helpers
 * Reusable validation functions to reduce code duplication
 * Imported from PR #1 - GitHub Copilot Agent optimization
 */

class ValidationHelpers {
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  static isValidEmail(email) {
    if (!email || typeof email !== "string") {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (WhatsApp format)
   * @param {string} phone
   * @returns {boolean}
   */
  static isValidPhoneNumber(phone) {
    if (!phone || typeof phone !== "string") {
      return false;
    }
    // WhatsApp format: digits@c.us
    return /^\d+@c\.us$/.test(phone);
  }

  /**
   * Validate product ID format
   * @param {string} productId
   * @returns {boolean}
   */
  static isValidProductId(productId) {
    if (!productId || typeof productId !== "string") {
      return false;
    }
    // Product IDs should be alphanumeric with hyphens
    return /^[a-z0-9-]+$/.test(productId);
  }

  /**
   * Validate positive integer
   * Fixed from PR #1: Now properly rejects decimals
   * @param {*} value
   * @returns {boolean}
   */
  static isPositiveInteger(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
  }

  /**
   * Validate positive number (including decimals)
   * @param {*} value
   * @returns {boolean}
   */
  static isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }

  /**
   * Validate rating (1-5)
   * @param {*} rating
   * @returns {boolean}
   */
  static isValidRating(rating) {
    const num = parseInt(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} dateString
   * @returns {boolean}
   */
  static isValidDate(dateString) {
    if (!dateString || typeof dateString !== "string") {
      return false;
    }
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Validate string length
   * @param {string} str
   * @param {number} minLength
   * @param {number} maxLength
   * @returns {boolean}
   */
  static isValidLength(str, minLength = 1, maxLength = 1000) {
    if (!str || typeof str !== "string") {
      return false;
    }
    return str.length >= minLength && str.length <= maxLength;
  }

  /**
   * Sanitize string for safe display
   * @param {string} str
   * @returns {string}
   */
  static sanitizeString(str) {
    if (!str || typeof str !== "string") {
      return "";
    }
    // Remove null bytes and trim
    return str.replace(/\0/g, "").trim();
  }

  /**
   * Validate command format
   * @param {string} command
   * @returns {boolean}
   */
  static isValidCommand(command) {
    if (!command || typeof command !== "string") {
      return false;
    }
    return command.startsWith("/") && command.length > 1;
  }

  /**
   * Parse command and arguments
   * Added from PR #1 - useful helper
   * @param {string} message
   * @returns {{command: string, args: string[]}}
   */
  static parseCommand(message) {
    if (!message || typeof message !== "string") {
      return { command: "", args: [] };
    }
    const parts = message.trim().split(/\s+/);
    return {
      command: parts[0],
      args: parts.slice(1),
    };
  }

  /**
   * Validate promo code format
   * @param {string} code
   * @returns {boolean}
   */
  static isValidPromoCode(code) {
    if (!code || typeof code !== "string") {
      return false;
    }
    // Promo codes: alphanumeric, 3-20 characters
    return /^[A-Z0-9]{3,20}$/i.test(code);
  }

  /**
   * Validate discount percentage
   * @param {*} discount
   * @returns {boolean}
   */
  static isValidDiscount(discount) {
    const num = parseFloat(discount);
    return !isNaN(num) && num > 0 && num <= 100;
  }

  /**
   * Validate order ID format
   * @param {string} orderId
   * @returns {boolean}
   */
  static isValidOrderId(orderId) {
    if (!orderId || typeof orderId !== "string") {
      return false;
    }
    // Order IDs: ORD-timestamp-hash format
    return /^ORD-\d+-[a-z0-9]+$/i.test(orderId);
  }

  /**
   * Validate review ID format
   * @param {string} reviewId
   * @returns {boolean}
   */
  static isValidReviewId(reviewId) {
    if (!reviewId || typeof reviewId !== "string") {
      return false;
    }
    // Review IDs: REV-timestamp-hash format
    return /^REV-\d+-[a-z0-9]+$/i.test(reviewId);
  }

  /**
   * Check if string is empty or whitespace only
   * @param {string} str
   * @returns {boolean}
   */
  static isEmpty(str) {
    return !str || typeof str !== "string" || str.trim().length === 0;
  }

  /**
   * Check if value is null or undefined
   * @param {*} value
   * @returns {boolean}
   */
  static isNullOrUndefined(value) {
    return value === null || value === undefined;
  }

  /**
   * Safe JSON parse with fallback
   * @param {string} jsonString
   * @param {*} defaultValue
   * @returns {*}
   */
  static safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Validate URL format
   * @param {string} url
   * @returns {boolean}
   */
  static isValidUrl(url) {
    if (!url || typeof url !== "string") {
      return false;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = ValidationHelpers;
