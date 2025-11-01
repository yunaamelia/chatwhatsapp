/**
 * Input Validator
 * Validates and sanitizes user inputs
 */

class InputValidator {
  /**
   * Validate and sanitize message input
   */
  static sanitizeMessage(message) {
    if (typeof message !== "string") {
      return "";
    }

    // Remove null bytes
    let sanitized = message.replace(/\0/g, "");

    // Trim whitespace
    sanitized = sanitized.trim();

    // Limit length
    const MAX_LENGTH = 1000;
    if (sanitized.length > MAX_LENGTH) {
      sanitized = sanitized.substring(0, MAX_LENGTH);
    }

    return sanitized;
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone) {
    // WhatsApp format: digits@c.us
    const phoneRegex = /^\d{10,15}@c\.us$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate order ID format
   */
  static isValidOrderId(orderId) {
    // Format: ORD-timestamp-suffix
    const orderRegex = /^ORD-\d{13}-[a-zA-Z0-9]{4}$/;
    return orderRegex.test(orderId);
  }

  /**
   * Validate admin number
   */
  static isAdmin(customerId) {
    const adminNumbers = [
      process.env.ADMIN_NUMBER_1,
      process.env.ADMIN_NUMBER_2,
      process.env.ADMIN_NUMBER_3,
    ].filter(Boolean);

    return adminNumbers.some((num) => customerId.includes(num));
  }

  /**
   * Escape special characters for safe display
   */
  static escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Validate payment choice
   */
  static isValidPaymentChoice(choice) {
    const validChoices = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "qris",
      "dana",
      "gopay",
      "shopeepay",
      "bank",
      "transfer",
    ];
    return validChoices.includes(choice.toLowerCase());
  }

  /**
   * Validate bank choice
   */
  static isValidBankChoice(choice) {
    const validBanks = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "bca",
      "bni",
      "bri",
      "mandiri",
      "permata",
    ];
    return validBanks.includes(choice.toLowerCase());
  }

  /**
   * Validate menu choice
   */
  static isValidMenuChoice(choice) {
    const validChoices = [
      "1",
      "2",
      "3",
      "4",
      "browse",
      "cart",
      "about",
      "support",
      "contact",
      "products",
    ];
    return validChoices.includes(choice.toLowerCase());
  }
}

module.exports = InputValidator;
