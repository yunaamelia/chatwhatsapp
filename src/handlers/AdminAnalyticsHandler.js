/**
 * Admin Analytics Handler
 * Handles enhanced admin dashboard and statistics
 * Extracted from AdminHandler for better code organization
 */

const BaseHandler = require("./BaseHandler");

class AdminAnalyticsHandler extends BaseHandler {
  constructor(dashboardService, adminStatsService, sessionManager, logger) {
    super();
    this.dashboardService = dashboardService;
    this.statsService = adminStatsService;
    this.sessionManager = sessionManager;
    this.logger = logger;
  }

  /**
   * /stats [days] - Show enhanced analytics dashboard
   * Examples: /stats, /stats 7, /stats 30, /stats 90
   */
  async handleStats(adminId, days = 30) {
    try {
      // Get basic stats (existing)
      const basicStats = await this.statsService.getStats(this.sessionManager);

      // Get enhanced dashboard data
      const dashboard = this.dashboardService.getDashboardData(days);

      // Build enhanced stats message
      let response = "📊 *ADMIN DASHBOARD*\n\n";

      // === SALES OVERVIEW ===
      response += "💰 *Sales Overview* (Last " + days + " Days)\n";
      response += "━━━━━━━━━━━━━━━━━━\n";
      response += `📦 Total Orders: ${dashboard.sales.totalOrders}\n`;
      response += `✅ Completed: ${dashboard.sales.completedOrders}\n`;
      response += `⏳ Pending: ${dashboard.sales.pendingOrders}\n`;
      response += `💵 Total Revenue: ${this._formatIDR(
        dashboard.sales.totalRevenue
      )}\n`;
      response += `📈 Avg Order: ${this._formatIDR(
        dashboard.sales.avgOrderValue
      )}\n`;
      response += `✔️ Completion Rate: ${dashboard.sales.completionRate}%\n\n`;

      // === REVENUE BY PAYMENT METHOD ===
      if (dashboard.revenue.total > 0) {
        response += "💳 *Revenue by Payment Method*\n";
        response += "━━━━━━━━━━━━━━━━━━\n";
        response += this.dashboardService.generateBarChart(
          dashboard.revenue,
          15
        );
        response += "\n";
        response += `📊 Total: ${this._formatIDR(dashboard.revenue.total)}\n\n`;
      }

      // === TOP 5 PRODUCTS ===
      if (dashboard.topProducts.length > 0) {
        response += "🏆 *Top 5 Best-Selling Products*\n";
        response += "━━━━━━━━━━━━━━━━━━\n";
        dashboard.topProducts.forEach((product, index) => {
          response += `${index + 1}. ${product.productName}\n`;
          response += `   • Sold: ${product.unitsSold} units\n`;
          response += `   • Revenue: ${this._formatIDR(product.revenue)}\n`;
          if (index < dashboard.topProducts.length - 1) response += "\n";
        });
        response += "\n\n";
      }

      // === CUSTOMER RETENTION ===
      response += "👥 *Customer Retention*\n";
      response += "━━━━━━━━━━━━━━━━━━\n";
      response += `📊 Total Customers: ${dashboard.retention.totalCustomers}\n`;
      response += `🆕 First-time: ${dashboard.retention.firstTimeCustomers}\n`;
      response += `🔁 Repeat: ${dashboard.retention.repeatCustomers}\n`;
      response += `📈 Retention Rate: ${dashboard.retention.retentionRate}%\n`;
      response += `📊 Avg Orders/Customer: ${dashboard.retention.avgOrdersPerCustomer}\n\n`;

      // === QUICK STATS (from existing) ===
      response += "⚡ *Quick Stats*\n";
      response += "━━━━━━━━━━━━━━━━━━\n";
      response += `👥 Active Sessions: ${basicStats.activeSessions}\n`;
      response += `🛒 Active Carts: ${basicStats.activeCarts}\n`;
      response += `⏰ Pending Payments: ${basicStats.pendingPayments}\n\n`;

      response += "━━━━━━━━━━━━━━━━━━\n";
      response += `📅 Period: Last ${days} days\n`;
      response += `⏱️ Generated: ${new Date().toLocaleString("id-ID")}\n\n`;
      response += "💡 Use */stats 7* for last 7 days\n";
      response += "💡 Use */stats 90* for last 90 days";

      this.log(adminId, "stats_viewed", { days });
      return response;
    } catch (error) {
      this.logError(adminId, error, { action: "stats" });
      return `❌ *Error Generating Stats*\n\n${error.message}`;
    }
  }

  /**
   * Format currency to IDR
   */
  _formatIDR(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return "Rp 0";
    }
    return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
  }

  /**
   * Log action
   */
  log(adminId, action, data = {}) {
    if (this.logger) {
      this.logger.log("admin_analytics_action", {
        adminId: this._maskCustomerId(adminId),
        action,
        timestamp: new Date().toISOString(),
        ...data,
      });
    }
  }

  /**
   * Log error
   */
  logError(adminId, error, context = {}) {
    if (this.logger) {
      this.logger.error("admin_analytics_error", {
        adminId: this._maskCustomerId(adminId),
        error: error.message,
        stack: error.stack,
        ...context,
      });
    }
  }

  /**
   * Mask customer ID for privacy
   */
  _maskCustomerId(customerId) {
    if (!customerId) return "unknown";
    const parts = customerId.split("@");
    if (parts[0].length > 4) {
      return "***" + parts[0].slice(-4) + "@" + parts[1];
    }
    return customerId;
  }
}

module.exports = AdminAnalyticsHandler;
