/**
 * Input Validator
 * Validates and sanitizes user inputs
 * Includes rate limiting for spam prevention
 */

class InputValidator {
  constructor() {
    // Rate limiting storage
    this.messageCount = new Map(); // customerId -> {count, resetTime}
    this.orderCount = new Map(); // customerId -> {count, resetDate}
    this.errorCooldown = new Map(); // customerId -> cooldownUntil

    // Rate limits
    this.MESSAGE_LIMIT = 20; // messages per minute
    this.ORDER_LIMIT = 5; // orders per day
    this.ERROR_COOLDOWN = 60000; // 1 minute cooldown after error

    // Cleanup old entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Check if customer can send message (rate limiting)
   */
  canSendMessage(customerId) {
    const now = Date.now();
    const data = this.messageCount.get(customerId);

    if (!data || now > data.resetTime) {
      // Start new window
      this.messageCount.set(customerId, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
      return { allowed: true, remaining: this.MESSAGE_LIMIT - 1 };
    }

    if (data.count >= this.MESSAGE_LIMIT) {
      const waitTime = Math.ceil((data.resetTime - now) / 1000);
      return {
        allowed: false,
        reason: "rate_limit",
        waitTime,
        message: `⚠️ *Terlalu banyak pesan*\n\nAnda telah mencapai batas ${this.MESSAGE_LIMIT} pesan/menit.\n\nSilakan tunggu ${waitTime} detik.`,
      };
    }

    data.count++;
    this.messageCount.set(customerId, data);
    return { allowed: true, remaining: this.MESSAGE_LIMIT - data.count };
  }

  /**
   * Check if customer can place order (daily limit)
   */
  canPlaceOrder(customerId) {
    const now = Date.now();
    const today = new Date().toDateString();
    const data = this.orderCount.get(customerId);

    if (!data || data.resetDate !== today) {
      // Start new day
      this.orderCount.set(customerId, {
        count: 1,
        resetDate: today,
      });
      return { allowed: true, remaining: this.ORDER_LIMIT - 1 };
    }

    if (data.count >= this.ORDER_LIMIT) {
      return {
        allowed: false,
        reason: "order_limit",
        message: `⚠️ *Batas Order Harian*\n\nAnda telah mencapai batas ${this.ORDER_LIMIT} order per hari.\n\nSilakan coba lagi besok.`,
      };
    }

    data.count++;
    this.orderCount.set(customerId, data);
    return { allowed: true, remaining: this.ORDER_LIMIT - data.count };
  }

  /**
   * Set error cooldown for customer
   */
  setErrorCooldown(customerId) {
    const cooldownUntil = Date.now() + this.ERROR_COOLDOWN;
    this.errorCooldown.set(customerId, cooldownUntil);
  }

  /**
   * Check if customer is in error cooldown
   */
  isInCooldown(customerId) {
    const cooldownUntil = this.errorCooldown.get(customerId);
    if (!cooldownUntil) return { inCooldown: false };

    const now = Date.now();
    if (now < cooldownUntil) {
      const waitTime = Math.ceil((cooldownUntil - now) / 1000);
      return {
        inCooldown: true,
        waitTime,
        message: `⏱️ *Cooldown Aktif*\n\nSilakan tunggu ${waitTime} detik sebelum mencoba lagi.`,
      };
    }

    // Cooldown expired
    this.errorCooldown.delete(customerId);
    return { inCooldown: false };
  }

  /**
   * Cleanup old rate limit data
   */
  cleanup() {
    const now = Date.now();

    // Cleanup message counts
    for (const [id, data] of this.messageCount.entries()) {
      if (now > data.resetTime + 60000) {
        // 1 minute after reset
        this.messageCount.delete(id);
      }
    }

    // Cleanup order counts (keep only today's data)
    const today = new Date().toDateString();
    for (const [id, data] of this.orderCount.entries()) {
      if (data.resetDate !== today) {
        this.orderCount.delete(id);
      }
    }

    // Cleanup expired cooldowns
    for (const [id, cooldownUntil] of this.errorCooldown.entries()) {
      if (now > cooldownUntil) {
        this.errorCooldown.delete(id);
      }
    }
  }

  /**
   * Get rate limit stats for customer
   */
  getStats(customerId) {
    const msgData = this.messageCount.get(customerId);
    const orderData = this.orderCount.get(customerId);

    return {
      messages: msgData ? msgData.count : 0,
      orders: orderData ? orderData.count : 0,
      messageLimit: this.MESSAGE_LIMIT,
      orderLimit: this.ORDER_LIMIT,
    };
  }

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
