/**
 * Transaction Logger
 * Logs all transactions and important events for audit trail
 */

const fs = require("fs");
const path = require("path");

class TransactionLogger {
  constructor(logDir = "./logs") {
    this.logDir = logDir;

    // Create logs directory if not exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Get log file path for today
   */
  getLogFilePath(type = "transactions") {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return path.join(this.logDir, `${type}-${date}.log`);
  }

  /**
   * Write log entry
   */
  writeLog(type, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      ...data,
    };

    const logLine = JSON.stringify(logEntry) + "\n";
    const logFile = this.getLogFilePath(type);

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error(`❌ Error writing to log file: ${error.message}`);
    }
  }

  /**
   * Log order creation
   */
  logOrder(customerId, orderId, cart, totalUSD, totalIDR) {
    this.writeLog("transactions", {
      event: "order_created",
      customerId: this.maskPhone(customerId),
      orderId,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
      })),
      totalUSD,
      totalIDR,
    });
  }

  /**
   * Log payment initiation
   */
  logPaymentInit(customerId, orderId, method, amount, invoiceId) {
    this.writeLog("transactions", {
      event: "payment_initiated",
      customerId: this.maskPhone(customerId),
      orderId,
      paymentMethod: method,
      amount,
      invoiceId,
    });
  }

  /**
   * Log payment success
   */
  logPaymentSuccess(customerId, orderId, method, amount, invoiceId) {
    this.writeLog("transactions", {
      event: "payment_success",
      customerId: this.maskPhone(customerId),
      orderId,
      paymentMethod: method,
      amount,
      invoiceId,
    });
  }

  /**
   * Log payment failure
   */
  logPaymentFailure(customerId, orderId, method, reason) {
    this.writeLog("transactions", {
      event: "payment_failed",
      customerId: this.maskPhone(customerId),
      orderId,
      paymentMethod: method,
      reason,
    });
  }

  /**
   * Log product delivery
   */
  logDelivery(customerId, orderId, products) {
    this.writeLog("transactions", {
      event: "products_delivered",
      customerId: this.maskPhone(customerId),
      orderId,
      products: products.map((p) => p.name),
      count: products.length,
    });
  }

  /**
   * Log admin action
   */
  logAdminAction(adminId, action, target, details = {}) {
    this.writeLog("admin", {
      event: "admin_action",
      adminId: this.maskPhone(adminId),
      action,
      target,
      ...details,
    });
  }

  /**
   * Log security event
   */
  logSecurity(customerId, event, reason, details = {}) {
    this.writeLog("security", {
      event,
      customerId: this.maskPhone(customerId),
      reason,
      ...details,
    });
  }

  /**
   * Log error
   */
  logError(customerId, error, context = {}) {
    this.writeLog("errors", {
      event: "error",
      customerId: this.maskPhone(customerId),
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Mask phone number for privacy (keep last 4 digits)
   */
  maskPhone(phone) {
    if (!phone || phone.length < 8) return phone;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) return phone;
    return `***${digits.slice(-4)}`;
  }

  /**
   * Get today's transaction stats
   */
  getTodayStats() {
    const logFile = this.getLogFilePath("transactions");

    if (!fs.existsSync(logFile)) {
      return {
        totalOrders: 0,
        completedPayments: 0,
        failedPayments: 0,
        deliveredProducts: 0,
      };
    }

    try {
      const content = fs.readFileSync(logFile, "utf8");
      const lines = content.trim().split("\n").filter(Boolean);

      const stats = {
        totalOrders: 0,
        completedPayments: 0,
        failedPayments: 0,
        deliveredProducts: 0,
      };

      lines.forEach((line) => {
        try {
          const entry = JSON.parse(line);
          if (entry.event === "order_created") stats.totalOrders++;
          if (entry.event === "payment_success") stats.completedPayments++;
          if (entry.event === "payment_failed") stats.failedPayments++;
          if (entry.event === "products_delivered") stats.deliveredProducts++;
        } catch (e) {
          // Skip invalid lines
        }
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error reading log file: ${error.message}`);
      return {
        totalOrders: 0,
        completedPayments: 0,
        failedPayments: 0,
        deliveredProducts: 0,
      };
    }
  }

  /**
   * Get recent transactions (last N entries)
   */
  getRecentTransactions(limit = 10) {
    const logFile = this.getLogFilePath("transactions");

    if (!fs.existsSync(logFile)) {
      return [];
    }

    try {
      const content = fs.readFileSync(logFile, "utf8");
      const lines = content.trim().split("\n").filter(Boolean);
      const recent = lines.slice(-limit);

      return recent
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.error(`❌ Error reading log file: ${error.message}`);
      return [];
    }
  }
}

module.exports = TransactionLogger;
