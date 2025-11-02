/**
 * Chatbot Logic - Refactored & Modular
 * Handles message processing and response generation
 */

const {
  formatProductList,
  getProductById,
  getAllProducts,
} = require("./config");
const XenditService = require("./services/xenditService");
const UIMessages = require("./lib/uiMessages");
const PaymentMessages = require("./lib/paymentMessages");
const PaymentHandlers = require("./lib/paymentHandlers");
const InputValidator = require("./lib/inputValidator");
const TransactionLogger = require("./lib/transactionLogger");

class ChatbotLogic {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.xenditService = XenditService;
    this.validator = new InputValidator(); // Instance for rate limiting
    this.logger = new TransactionLogger();
    this.paymentHandlers = new PaymentHandlers(
      XenditService,
      sessionManager,
      this.logger
    );
  }

  /**
   * Process incoming message and generate response
   */
  async processMessage(customerId, message) {
    // Check rate limiting
    const rateLimitCheck = this.validator.canSendMessage(customerId);
    if (!rateLimitCheck.allowed) {
      this.logger.logSecurity(
        customerId,
        "rate_limit_exceeded",
        rateLimitCheck.reason,
        {
          limit: this.validator.MESSAGE_LIMIT,
        }
      );
      return rateLimitCheck.message;
    }

    // Check error cooldown
    const cooldownCheck = this.validator.isInCooldown(customerId);
    if (cooldownCheck.inCooldown) {
      return cooldownCheck.message;
    }

    // Validate and sanitize input
    const sanitizedMessage = InputValidator.sanitizeMessage(message);
    if (!sanitizedMessage) {
      return UIMessages.invalidOption();
    }

    const step = await this.sessionManager.getStep(customerId);
    const normalizedMessage = sanitizedMessage.toLowerCase().trim();

    // Handle admin commands
    if (normalizedMessage.startsWith("/approve ")) {
      return await this.handleAdminApprove(customerId, normalizedMessage);
    }

    if (normalizedMessage.startsWith("/broadcast ")) {
      return await this.handleAdminBroadcast(customerId, sanitizedMessage);
    }

    if (normalizedMessage.startsWith("/stats")) {
      return await this.handleAdminStats(customerId);
    }

    if (normalizedMessage.startsWith("/status")) {
      return this.handleAdminStatus(customerId);
    }

    if (normalizedMessage.startsWith("/stock")) {
      return this.handleAdminStock(customerId, normalizedMessage);
    }

    if (normalizedMessage.startsWith("/addproduct")) {
      return this.handleAddProduct(customerId, sanitizedMessage);
    }

    if (normalizedMessage.startsWith("/removeproduct")) {
      return this.handleRemoveProduct(customerId, normalizedMessage);
    }

    if (normalizedMessage.startsWith("/editproduct")) {
      return this.handleEditProduct(customerId, sanitizedMessage);
    }

    if (normalizedMessage.startsWith("/settings")) {
      return this.handleAdminSettings(customerId, normalizedMessage);
    }

    // Handle customer commands
    if (normalizedMessage === "history" || normalizedMessage === "/history") {
      return this.handleOrderHistory(customerId);
    }

    // Handle global commands
    if (normalizedMessage === "menu" || normalizedMessage === "help") {
      await this.sessionManager.setStep(customerId, "menu");
      return UIMessages.mainMenu();
    }

    if (normalizedMessage === "cart") {
      return await this.showCart(customerId);
    }

    // Route to step handler
    return await this.routeToHandler(customerId, normalizedMessage, step);
  }

  /**
   * Route message to appropriate handler based on step
   */
  async routeToHandler(customerId, message, step) {
    switch (step) {
      case "menu":
        return await this.handleMenuSelection(customerId, message);
      case "browsing":
        return await this.handleProductSelection(customerId, message);
      case "checkout":
        return await this.handleCheckout(customerId, message);
      case "select_payment":
        return await this.paymentHandlers.handlePaymentSelection(
          customerId,
          message
        );
      case "select_bank":
        return await this.paymentHandlers.handleBankChoice(customerId, message);
      case "awaiting_payment":
        return await this.handleAwaitingPayment(customerId, message);
      case "awaiting_admin_approval":
        return UIMessages.awaitingAdminApproval();
      default:
        return UIMessages.mainMenu();
    }
  }

  /**
   * Handle main menu selection
   */
  async handleMenuSelection(customerId, message) {
    if (message === "1" || message === "browse" || message === "products") {
      await this.sessionManager.setStep(customerId, "browsing");
      return this.showProducts();
    }

    if (message === "2" || message === "cart") {
      return await this.showCart(customerId);
    }

    if (message === "3" || message === "about") {
      return UIMessages.about();
    }

    if (message === "4" || message === "support" || message === "contact") {
      return UIMessages.contact();
    }

    return UIMessages.invalidOption() + "\n\n" + UIMessages.mainMenu();
  }

  /**
   * Show available products
   */
  showProducts() {
    const productList = formatProductList();
    return UIMessages.browsingInstructions(productList);
  }

  /**
   * Handle product selection
   */
  async handleProductSelection(customerId, message) {
    const allProducts = getAllProducts();

    // Try exact match by ID first
    let product = getProductById(message);

    // If not found, try fuzzy search
    if (!product) {
      product = this.fuzzySearchProduct(allProducts, message);
    }

    if (product) {
      await this.sessionManager.addToCart(customerId, product);
      const priceIDR = product.price * 15800;
      return UIMessages.productAdded(product.name, priceIDR);
    }

    return UIMessages.productNotFound();
  }

  /**
   * Fuzzy search for products using Levenshtein distance
   */
  fuzzySearchProduct(products, query) {
    const queryLower = query.toLowerCase();

    // First try partial match (contains)
    const match = products.find(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.id.toLowerCase().includes(queryLower)
    );

    if (match) return match;

    // If no partial match, try fuzzy matching with Levenshtein distance
    let bestMatch = null;
    let bestScore = Infinity;
    const threshold = 3; // Max allowed distance

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      // Cache lowercased name and id
      const nameLower = product.name.toLowerCase();
      const idLower = product.id.toLowerCase();

      const nameDistance = this.levenshteinDistance(nameLower, queryLower);
      const idDistance = this.levenshteinDistance(idLower, queryLower);

      const minDistance = Math.min(nameDistance, idDistance);

      if (minDistance === 0) {
        // Perfect match, break early
        bestMatch = product;
        break;
      }

      if (minDistance < bestScore && minDistance <= threshold) {
        bestScore = minDistance;
        bestMatch = product;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Show cart contents
   */
  /**
   * Show cart contents
   */
  async showCart(customerId) {
    const cart = await this.sessionManager.getCart(customerId);

    if (cart.length === 0) {
      return UIMessages.emptyCart();
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    await this.sessionManager.setStep(customerId, "checkout");

    return UIMessages.cartView(cart, total);
  }

  /**
   * Handle checkout process
   */
  async handleCheckout(customerId, message) {
    if (message === "checkout" || message === "buy" || message === "order") {
      return await this.processCheckout(customerId);
    }

    if (message === "clear") {
      await this.sessionManager.clearCart(customerId);
      await this.sessionManager.setStep(customerId, "menu");
      return {
        message: UIMessages.cartCleared(),
        qrisData: null,
      };
    }

    return {
      message: UIMessages.checkoutPrompt(),
      qrisData: null,
    };
  }

  /**
   * Process checkout and show payment options
   */
  async processCheckout(customerId) {
    // Check order rate limit
    const orderLimitCheck = this.validator.canPlaceOrder(customerId);
    if (!orderLimitCheck.allowed) {
      this.logger.logSecurity(
        customerId,
        "order_limit_exceeded",
        orderLimitCheck.reason,
        {
          limit: this.validator.ORDER_LIMIT,
        }
      );
      return {
        message: orderLimitCheck.message,
        qrisData: null,
      };
    }

    const cart = await this.sessionManager.getCart(customerId);

    // Check stock availability
    const { isInStock } = require("./config");
    const outOfStockItems = cart.filter((item) => !isInStock(item.id));

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map((item) => item.name).join(", ");
      this.logger.logSecurity(
        customerId,
        "out_of_stock_checkout",
        "stock_unavailable",
        {
          items: outOfStockItems.map((i) => i.id),
        }
      );
      return {
        message: `❌ *Stok Habis*\n\nMaaf, produk berikut tidak tersedia:\n${itemNames}\n\nSilakan hapus dari keranjang dengan ketik *clear* dan pilih produk lain.`,
        qrisData: null,
      };
    }

    const totalUSD = cart.reduce((sum, item) => sum + item.price, 0);
    const orderId = `ORD-${Date.now()}-${customerId.slice(-4)}`;

    await this.sessionManager.setOrderId(customerId, orderId);
    await this.sessionManager.setStep(customerId, "select_payment");

    const totalIDR = this.xenditService.convertToIDR(totalUSD);

    // Log order creation
    this.logger.logOrder(customerId, orderId, cart, totalUSD, totalIDR);

    const orderSummary = UIMessages.orderSummary(orderId, cart, totalIDR);
    const paymentMenu = PaymentMessages.paymentMethodSelection(orderId);

    return {
      message: orderSummary + paymentMenu,
      qrisData: null,
    };
  }

  /**
   * Handle awaiting payment state
   */
  async handleAwaitingPayment(customerId, message) {
    if (message === "cek" || message === "check" || message === "status") {
      return await this.paymentHandlers.checkPaymentStatus(customerId);
    }

    return PaymentMessages.awaitingPayment();
  }

  /**
   * Handle admin approval command
   */
  async handleAdminApprove(adminId, message) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    const parts = message.split(" ");
    if (parts.length < 2) {
      return UIMessages.adminApprovalFormat();
    }

    const approveOrderId = parts[1];
    const targetCustomerId = await this.sessionManager.findCustomerByOrderId(
      approveOrderId
    );

    if (!targetCustomerId) {
      return UIMessages.orderNotFound(approveOrderId);
    }

    const step = await this.sessionManager.getStep(targetCustomerId);
    if (step !== "awaiting_admin_approval") {
      return UIMessages.orderNotPending(approveOrderId);
    }

    // Double-check payment status via Xendit API
    const paymentData = await this.sessionManager.getPaymentMethod(
      targetCustomerId
    );
    if (paymentData.invoiceId) {
      try {
        const paymentStatus = await this.xenditService.checkPaymentStatus(
          paymentData.invoiceId
        );

        if (paymentStatus.status !== "SUCCEEDED") {
          this.logger.logSecurity(
            adminId,
            "payment_not_verified",
            "payment_status_mismatch",
            {
              orderId: approveOrderId,
              invoiceId: paymentData.invoiceId,
              status: paymentStatus.status,
            }
          );
          return `❌ *Payment Belum Berhasil*\n\nOrder: ${approveOrderId}\nStatus: ${paymentStatus.status}\n\nTidak bisa approve sebelum payment SUCCEEDED.`;
        }

        console.log(
          `✅ Payment verified for ${approveOrderId}: ${paymentStatus.status}`
        );
      } catch (error) {
        this.logger.logError(adminId, error, {
          orderId: approveOrderId,
          action: "payment_double_check",
        });
        return `⚠️ *Gagal Verifikasi Payment*\n\nError: ${error.message}\n\nSilakan cek manual di dashboard Xendit.`;
      }
    }

    const cart = await this.sessionManager.getCart(targetCustomerId);
    const ProductDelivery = require("./productDelivery");
    const productDelivery = new ProductDelivery();
    const deliveryResult = productDelivery.deliverProducts(
      targetCustomerId,
      approveOrderId,
      cart
    );

    if (!deliveryResult.success) {
      this.logger.logError(targetCustomerId, new Error("Delivery failed"), {
        orderId: approveOrderId,
        reason: "no_products_available",
      });
      return UIMessages.deliveryFailed(approveOrderId);
    }

    const customerMessage = productDelivery.formatDeliveryMessage(
      deliveryResult,
      approveOrderId
    );

    // Log admin approval and delivery
    this.logger.logAdminAction(adminId, "approve_order", approveOrderId, {
      customerId: targetCustomerId,
      products: cart.map((p) => p.name),
    });
    this.logger.logDelivery(targetCustomerId, approveOrderId, cart);

    // Decrement stock for delivered products
    const { decrementStock } = require("./config");
    cart.forEach((item) => {
      decrementStock(item.id);
      console.log(`📦 Stock decremented for ${item.id}`);
    });

    await this.sessionManager.clearCart(targetCustomerId);
    await this.sessionManager.setStep(targetCustomerId, "menu");

    return {
      message: UIMessages.approvalSuccess(approveOrderId),
      deliverToCustomer: true,
      customerId: targetCustomerId,
      customerMessage: customerMessage,
    };
  }

  /**
   * Admin Command: /stats
   * Shows active sessions, orders, revenue, and error rate
   */
  async handleAdminStats(adminId) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    const fs = require("fs");
    const path = require("path");
    const logsDir = path.join(__dirname, "logs");

    try {
      // Get active sessions
      const activeSessions = this.sessionManager.getActiveSessionCount
        ? await this.sessionManager.getActiveSessionCount()
        : 0;

      // Parse transaction logs
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

      let ordersToday = 0;
      let ordersWeek = 0;
      let ordersMonth = 0;
      let revenueToday = 0;
      let revenueWeek = 0;
      let revenueMonth = 0;
      let errorCount = 0;
      let totalLogs = 0;

      // Read all order logs
      if (fs.existsSync(logsDir)) {
        const logFiles = fs
          .readdirSync(logsDir)
          .filter((f) => f.startsWith("orders-"));

        logFiles.forEach((file) => {
          const filePath = path.join(logsDir, file);
          const content = fs.readFileSync(filePath, "utf-8");
          const lines = content.split("\n").filter((line) => line.trim());

          lines.forEach((line) => {
            totalLogs++;
            try {
              const log = JSON.parse(line);
              const logDate = new Date(log.timestamp);

              if (log.event === "order_created") {
                const revenue = log.metadata.totalPrice || 0;

                // Count today
                if (log.timestamp.startsWith(todayStr)) {
                  ordersToday++;
                  revenueToday += revenue;
                }

                // Count week
                if (logDate >= weekAgo) {
                  ordersWeek++;
                  revenueWeek += revenue;
                }

                // Count month
                if (logDate >= monthAgo) {
                  ordersMonth++;
                  revenueMonth += revenue;
                }
              }
            } catch {
              errorCount++;
            }
          });
        });

        // Read error logs
        const errorLogFiles = fs
          .readdirSync(logsDir)
          .filter((f) => f.startsWith("errors-"));

        errorLogFiles.forEach((file) => {
          const filePath = path.join(logsDir, file);
          const content = fs.readFileSync(filePath, "utf-8");
          const lines = content.split("\n").filter((line) => line.trim());

          lines.forEach((line) => {
            totalLogs++;
            try {
              JSON.parse(line);
              errorCount++;
            } catch {
              // Ignore parse errors
            }
          });
        });
      }

      // Calculate error rate
      const errorRate =
        totalLogs > 0 ? ((errorCount / totalLogs) * 100).toFixed(2) : "0.00";

      // Format response
      let response = `📊 *Admin Statistics*\n\n`;
      response += `👥 *Active Sessions:* ${activeSessions}\n\n`;
      response += `📦 *Orders*\n`;
      response += `• Today: ${ordersToday}\n`;
      response += `• This Week: ${ordersWeek}\n`;
      response += `• This Month: ${ordersMonth}\n\n`;
      response += `💰 *Revenue (IDR)*\n`;
      response += `• Today: ${this.formatIDR(revenueToday)}\n`;
      response += `• This Week: ${this.formatIDR(revenueWeek)}\n`;
      response += `• This Month: ${this.formatIDR(revenueMonth)}\n\n`;
      response += `⚠️ *Error Rate:* ${errorRate}%\n`;
      response += `📝 *Total Logs:* ${totalLogs}`;

      this.logger.logAdminAction(adminId, "stats_viewed", "system", {
        timestamp: now,
      });
      return response;
    } catch (error) {
      console.error("❌ Error generating stats:", error);
      return `❌ *Error Generating Stats*\n\n${error.message}`;
    }
  }

  /**
   * Format IDR currency
   */
  formatIDR(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Admin Command: /status
   * Shows system health status
   */
  handleAdminStatus(adminId) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    try {
      const redisClient = require("./lib/redisClient");
      const logRotationManager = require("./lib/logRotationManager");

      // Check WhatsApp status (will be checked from index.js)
      const whatsappStatus = "✅ Connected"; // Placeholder - will be real in production

      // Check Redis status
      const redisStatus = redisClient.isReady()
        ? "✅ Available"
        : "⚠️ Fallback";

      // Check Webhook status (check if server is running)
      const webhookStatus = "✅ Active"; // Placeholder - assuming webhook started

      // Get memory usage
      const memUsage = process.memoryUsage();
      const memUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
      const memTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
      const memPercent = (
        (memUsage.heapUsed / memUsage.heapTotal) *
        100
      ).toFixed(1);

      // Get uptime
      const uptimeSeconds = process.uptime();
      const uptimeHours = Math.floor(uptimeSeconds / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

      // Get log stats
      const logStats = logRotationManager.getStats();

      // Format response
      let response = `🔍 *System Status*\n\n`;
      response += `📱 *WhatsApp:* ${whatsappStatus}\n`;
      response += `💾 *Redis:* ${redisStatus}\n`;
      response += `🌐 *Webhook:* ${webhookStatus}\n\n`;
      response += `🧠 *Memory Usage*\n`;
      response += `• Used: ${memUsedMB} MB / ${memTotalMB} MB\n`;
      response += `• Utilization: ${memPercent}%\n\n`;
      response += `⏱️ *Uptime:* ${uptimeHours}h ${uptimeMinutes}m\n\n`;
      response += `📋 *Log Files*\n`;
      response += `• Total: ${logStats.totalFiles}\n`;
      response += `• Size: ${logStats.totalSize}\n`;
      response += `• Retention: ${logStats.retentionDays} days`;

      this.logger.logAdminAction(adminId, "status_viewed", "system", {
        timestamp: new Date(),
      });
      return response;
    } catch (error) {
      console.error("❌ Error generating status:", error);
      return `❌ *Error Generating Status*\n\n${error.message}`;
    }
  }

  /**
   * Customer Command: history
   * Shows customer's order history
   */
  handleOrderHistory(customerId) {
    const fs = require("fs");
    const path = require("path");
    const logsDir = path.join(__dirname, "logs");

    try {
      const customerOrders = [];

      // Read all order logs
      if (fs.existsSync(logsDir)) {
        const logFiles = fs
          .readdirSync(logsDir)
          .filter((f) => f.startsWith("orders-"));

        logFiles.forEach((file) => {
          const filePath = path.join(logsDir, file);
          const content = fs.readFileSync(filePath, "utf-8");
          const lines = content.split("\n").filter((line) => line.trim());

          lines.forEach((line) => {
            try {
              const log = JSON.parse(line);

              // Check if this order belongs to this customer
              if (
                log.customerId === customerId &&
                log.event === "order_created"
              ) {
                customerOrders.push({
                  orderId: log.metadata.orderId,
                  timestamp: log.timestamp,
                  totalPrice: log.metadata.totalPrice,
                  products: log.metadata.products,
                  status: "completed", // Default status
                });
              }
            } catch {
              // Skip invalid lines
            }
          });
        });
      }

      // Sort by timestamp (newest first)
      customerOrders.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // Show last 5 orders
      const recentOrders = customerOrders.slice(0, 5);

      if (recentOrders.length === 0) {
        return `📋 *Riwayat Pesanan*\n\nAnda belum memiliki pesanan.\n\nKetik *menu* untuk mulai berbelanja! 🛍️`;
      }

      let response = `📋 *Riwayat Pesanan* (5 terakhir)\n\n`;

      recentOrders.forEach((order, index) => {
        const date = new Date(order.timestamp);
        const dateStr = date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const timeStr = date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        response += `*${index + 1}. Order #${order.orderId}*\n`;
        response += `📅 ${dateStr} - ${timeStr}\n`;
        response += `📦 Produk:\n`;

        order.products.forEach((product) => {
          response += `   • ${product}\n`;
        });

        response += `💰 Total: ${this.formatIDR(order.totalPrice)}\n`;
        response += `✅ Status: ${
          order.status === "completed" ? "Selesai" : "Pending"
        }\n\n`;
      });

      response += `Total pesanan: ${customerOrders.length}\n\n`;
      response += `Ketik *menu* untuk order lagi! 🛒`;

      this.logger.logAdminAction(customerId, "view_history", "self", {
        orderCount: customerOrders.length,
      });

      return response;
    } catch (error) {
      console.error("❌ Error fetching order history:", error);
      return `❌ *Error Mengambil Riwayat*\n\n${error.message}`;
    }
  }

  /**
   * Admin Command: /stock <productId> <quantity>
   * Update product stock quantity
   */
  handleAdminStock(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    // Parse command: /stock <productId> <quantity>
    const parts = fullMessage.split(/\s+/);

    if (parts.length === 1) {
      // Show current stock if no parameters
      return this.showAllStock();
    }

    if (parts.length !== 3) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /stock <productId> <jumlah>\n\n` +
        `*Contoh:*\n` +
        `/stock netflix 50\n` +
        `/stock spotify 30\n\n` +
        `*Atau ketik /stock untuk melihat semua stok*\n\n` +
        `*Product IDs:*\n` +
        `• netflix\n` +
        `• spotify\n` +
        `• youtube\n` +
        `• disney\n` +
        `• vcc-basic\n` +
        `• vcc-standard`
      );
    }

    const [, productId, quantity] = parts;
    const { setStock } = require("./config");
    const result = setStock(productId.toLowerCase(), quantity);

    if (result.success) {
      // Log admin action
      this.logger.logAdminAction(adminId, "stock_update", productId, {
        oldStock: result.oldStock,
        newStock: result.newStock,
      });

      return (
        `✅ *Stok Berhasil Diupdate*\n\n` +
        `📦 *Produk:* ${result.product.name}\n` +
        `🔢 *Stok Lama:* ${result.oldStock}\n` +
        `🔢 *Stok Baru:* ${result.newStock}\n` +
        `⏰ *Diupdate:* ${new Date().toLocaleString("id-ID")}`
      );
    } else {
      return result.message;
    }
  }

  /**
   * Show all product stock levels
   */
  showAllStock() {
    const { getAllProducts } = require("./config");
    const products = getAllProducts();

    let message = "📊 *STOCK INVENTORY*\n\n";

    message += "📺 *Akun Premium:*\n";
    products
      .filter((p) => p.category === "Premium Account")
      .forEach((p, idx) => {
        const status = p.stock > 10 ? "✅" : p.stock > 0 ? "⚠️" : "❌";
        message += `${idx + 1}. ${p.name}\n`;
        message += `   ID: ${p.id}\n`;
        message += `   ${status} Stok: ${p.stock}\n\n`;
      });

    message += "💳 *Kartu Kredit Virtual:*\n";
    products
      .filter((p) => p.category === "Virtual Card")
      .forEach((p, idx) => {
        const status = p.stock > 10 ? "✅" : p.stock > 0 ? "⚠️" : "❌";
        message += `${idx + 1}. ${p.name}\n`;
        message += `   ID: ${p.id}\n`;
        message += `   ${status} Stok: ${p.stock}\n\n`;
      });

    message += "\n*Update Stok:*\n";
    message += "/stock <productId> <jumlah>\n\n";
    message += "*Contoh:*\n";
    message += "/stock netflix 50";

    return message;
  }

  /**
   * Admin Command: /addproduct
   * Add new product to catalog
   * Format: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>
   */
  async handleAddProduct(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    // Parse command: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>
    const commandText = fullMessage.substring("/addproduct ".length).trim();

    if (!commandText) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>\n\n` +
        `*Contoh:*\n` +
        `/addproduct hbo | HBO Max Premium (1 Month) | 1 | Full HD streaming | 10 | premium\n\n` +
        `*Kategori:*\n` +
        `• premium - Akun premium\n` +
        `• vcc - Virtual credit card`
      );
    }

    const parts = commandText.split("|").map((p) => p.trim());

    if (parts.length !== 6) {
      return (
        `❌ *Format Salah*\n\n` +
        `Harus ada 6 bagian dipisah dengan |\n\n` +
        `Format: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>\n\n` +
        `*Contoh:*\n` +
        `/addproduct hbo | HBO Max Premium (1 Month) | 1 | Full HD streaming | 10 | premium`
      );
    }

    const [id, name, price, description, stock, category] = parts;
    const { addProduct } = require("./config");
    const result = addProduct({
      id,
      name,
      price,
      description,
      stock,
      category,
    });

    if (result.success) {
      // Log admin action
      this.logger.logAdminAction(adminId, "product_add", id, {
        name,
        price,
        stock,
        category,
      });

      const priceIDR = result.product.price * 15800;
      return (
        `✅ *Produk Berhasil Ditambahkan*\n\n` +
        `🆔 *ID:* ${result.product.id}\n` +
        `📦 *Nama:* ${result.product.name}\n` +
        `💰 *Harga:* Rp ${priceIDR.toLocaleString("id-ID")}\n` +
        `📝 *Deskripsi:* ${result.product.description}\n` +
        `🔢 *Stok:* ${result.product.stock}\n` +
        `⏰ *Ditambahkan:* ${new Date().toLocaleString("id-ID")}`
      );
    } else {
      return result.message;
    }
  }

  /**
   * Admin Command: /removeproduct
   * Remove product from catalog
   * Format: /removeproduct <productId>
   */
  async handleRemoveProduct(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    const parts = fullMessage.split(/\s+/);

    if (parts.length !== 2) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /removeproduct <productId>\n\n` +
        `*Contoh:*\n` +
        `/removeproduct netflix\n` +
        `/removeproduct hbo\n\n` +
        `⚠️ *PERHATIAN:* Produk yang dihapus tidak bisa dikembalikan!`
      );
    }

    const [, productId] = parts;
    const { removeProduct } = require("./config");
    const result = removeProduct(productId.toLowerCase());

    if (result.success) {
      // Log admin action
      this.logger.logAdminAction(adminId, "product_remove", productId, {
        name: result.product.name,
      });

      return (
        `✅ *Produk Berhasil Dihapus*\n\n` +
        `🗑️ *Produk:* ${result.product.name}\n` +
        `🆔 *ID:* ${result.product.id}\n` +
        `⏰ *Dihapus:* ${new Date().toLocaleString("id-ID")}`
      );
    } else {
      return result.message;
    }
  }

  /**
   * Admin Command: /editproduct
   * Edit product details
   * Format: /editproduct <id> | <field> | <newValue>
   */
  async handleEditProduct(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    const commandText = fullMessage.substring("/editproduct ".length).trim();

    if (!commandText) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /editproduct <id> | <field> | <newValue>\n\n` +
        `*Field yang bisa diedit:*\n` +
        `• name - Nama produk\n` +
        `• price - Harga (dalam USD)\n` +
        `• description - Deskripsi\n\n` +
        `*Contoh:*\n` +
        `/editproduct netflix | name | Netflix Premium HD (1 Month)\n` +
        `/editproduct spotify | price | 1.5\n` +
        `/editproduct youtube | description | Ad-free, 4K quality`
      );
    }

    const parts = commandText.split("|").map((p) => p.trim());

    if (parts.length !== 3) {
      return (
        `❌ *Format Salah*\n\n` +
        `Harus ada 3 bagian dipisah dengan |\n\n` +
        `Format: /editproduct <id> | <field> | <newValue>\n\n` +
        `*Contoh:*\n` +
        `/editproduct netflix | price | 1.5`
      );
    }

    const [productId, field, newValue] = parts;
    const validFields = ["name", "price", "description"];

    if (!validFields.includes(field.toLowerCase())) {
      return (
        `❌ *Field Tidak Valid*\n\n` +
        `Field yang bisa diedit:\n` +
        `• name\n` +
        `• price\n` +
        `• description`
      );
    }

    const { updateProduct } = require("./config");
    const updates = {};
    updates[field.toLowerCase()] = newValue;

    const result = updateProduct(productId.toLowerCase(), updates);

    if (result.success) {
      // Log admin action
      this.logger.logAdminAction(adminId, "product_edit", productId, {
        field,
        oldValue: result.oldData[field.toLowerCase()],
        newValue,
      });

      return (
        `✅ *Produk Berhasil Diupdate*\n\n` +
        `📦 *Produk:* ${result.product.name}\n` +
        `🔄 *Field:* ${field}\n` +
        `📝 *Nilai Baru:* ${newValue}\n` +
        `⏰ *Diupdate:* ${new Date().toLocaleString("id-ID")}`
      );
    } else {
      return result.message;
    }
  }

  /**
   * Admin Command: /addproduct
   * Add new product to catalog
   * Format: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>
   */
  async handleAddProduct(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    // Parse command: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>
    const commandText = fullMessage.substring("/addproduct ".length).trim();

    if (!commandText) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>\n\n` +
        `*Contoh:*\n` +
        `/addproduct hbo | HBO Max Premium (1 Month) | 1 | Full HD streaming | 10 | premium\n\n` +
        `*Kategori:*\n` +
        `• premium - Akun premium\n` +
        `• vcc - Virtual credit card`
      );
    }

    const parts = commandText.split("|").map((p) => p.trim());

    if (parts.length !== 6) {
      return (
        `❌ *Format Salah*\n\n` +
        `Harus ada 6 bagian dipisah dengan |\n\n` +
        `Format: /addproduct <id> | <name> | <price> | <description> | <stock> | <category>\n\n` +
        `*Contoh:*\n` +
        `/addproduct hbo | HBO Max Premium (1 Month) | 1 | Full HD streaming | 10 | premium`
      );
    }

    const [id, name, price, description, stock, category] = parts;
    const { addProduct } = require("./config");
    const result = addProduct({
      id,
      name,
      price,
      description,
      stock,
      category,
    });

    if (result.success) {
      // Log admin action
      this.logger.logAdminAction(adminId, "product_add", id, {
        name,
        price,
        stock,
        category,
      });

      const priceIDR = result.product.price * 15800;
      return (
        `✅ *Produk Berhasil Ditambahkan*\n\n` +
        `🆔 *ID:* ${result.product.id}\n` +
        `📦 *Nama:* ${result.product.name}\n` +
        `💰 *Harga:* Rp ${priceIDR.toLocaleString("id-ID")}\n` +
        `📝 *Deskripsi:* ${result.product.description}\n` +
        `🔢 *Stok:* ${result.product.stock}\n` +
        `⏰ *Ditambahkan:* ${new Date().toLocaleString("id-ID")}`
      );
    } else {
      return result.message;
    }
  }

  /**
   * Admin Command: /removeproduct
   * Remove product from catalog
   * Format: /removeproduct <productId>
   */
  async handleRemoveProduct(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    const parts = fullMessage.split(/\s+/);

    if (parts.length !== 2) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /removeproduct <productId>\n\n` +
        `*Contoh:*\n` +
        `/removeproduct netflix\n` +
        `/removeproduct hbo\n\n` +
        `⚠️ *PERHATIAN:* Produk yang dihapus tidak bisa dikembalikan!`
      );
    }

    const [, productId] = parts;
    const { removeProduct } = require("./config");
    const result = removeProduct(productId.toLowerCase());

    if (result.success) {
      // Log admin action
      this.logger.logAdminAction(adminId, "product_remove", productId, {
        name: result.product.name,
      });

      return (
        `✅ *Produk Berhasil Dihapus*\n\n` +
        `🗑️ *Produk:* ${result.product.name}\n` +
        `🆔 *ID:* ${result.product.id}\n` +
        `⏰ *Dihapus:* ${new Date().toLocaleString("id-ID")}`
      );
    } else {
      return result.message;
    }
  }

  /**
   * Admin Command: /editproduct
   * Edit product details
   * Format: /editproduct <id> | <field> | <newValue>
   */
  async handleEditProduct(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    const commandText = fullMessage.substring("/editproduct ".length).trim();

    if (!commandText) {
      return (
        `❌ *Format Salah*\n\n` +
        `Gunakan: /editproduct <id> | <field> | <newValue>\n\n` +
        `*Field yang bisa diedit:*\n` +
        `• name - Nama produk\n` +
        `• price - Harga (dalam USD)\n` +
        `• description - Deskripsi\n\n` +
        `*Contoh:*\n` +
        `/editproduct netflix | name | Netflix Premium HD (1 Month)\n` +
        `/editproduct spotify | price | 1.5\n` +
        `/editproduct youtube | description | Ad-free, 4K quality`
      );
    }

    const parts = commandText.split("|").map((p) => p.trim());

    if (parts.length !== 3) {
      return (
        `❌ *Format Salah*\n\n` +
        `Harus ada 3 bagian dipisah dengan |\n\n` +
        `Format: /editproduct <id> | <field> | <newValue>\n\n` +
        `*Contoh:*\n` +
        `/editproduct netflix | price | 1.5`
      );
    }

    const [productId, field, newValue] = parts;
    const validFields = ["name", "price", "description"];

    if (!validFields.includes(field.toLowerCase())) {
      return (
        `❌ *Field Tidak Valid*\n\n` +
        `Field yang bisa diedit:\n` +
        `• name\n` +
        `• price\n` +
        `• description`
      );
    }

    const { updateProduct } = require("./config");
    const updates = {};
    updates[field.toLowerCase()] = newValue;

    const result = updateProduct(productId.toLowerCase(), updates);

    if (result.success) {
      // Log admin action
      this.logger.logAdminAction(adminId, "product_edit", productId, {
        field,
        oldValue: result.oldData[field.toLowerCase()],
        newValue,
      });

      return (
        `✅ *Produk Berhasil Diupdate*\n\n` +
        `📦 *Produk:* ${result.product.name}\n` +
        `🔄 *Field:* ${field}\n` +
        `📝 *Nilai Baru:* ${newValue}\n` +
        `⏰ *Diupdate:* ${new Date().toLocaleString("id-ID")}`
      );
    } else {
      return result.message;
    }
  }

  /**
   * Admin Command: /settings
   * View and configure system settings
   * Format: /settings (view all) or /settings <key> <value> (update)
   */
  async handleAdminSettings(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    const parts = fullMessage.split(/\s+/);

    // View all settings
    if (parts.length === 1) {
      return this.showAllSettings();
    }

    // Show help
    if (parts.length === 2 && parts[1] === "help") {
      return this.showSettingsHelp();
    }

    // Update setting
    if (parts.length === 3) {
      const [, key, value] = parts;
      const { updateSetting } = require("./config");
      const result = updateSetting(key, value);

      if (result.success) {
        // Log admin action
        this.logger.logAdminAction(adminId, "settings_update", key, {
          oldValue: result.oldValue,
          newValue: result.newValue,
        });

        return (
          `✅ *Setting Berhasil Diupdate*\n\n` +
          `🔧 *Key:* ${result.key}\n` +
          `📝 *Nilai Lama:* ${result.oldValue}\n` +
          `📝 *Nilai Baru:* ${result.newValue}\n` +
          `⏰ *Diupdate:* ${new Date().toLocaleString("id-ID")}`
        );
      } else {
        return result.message;
      }
    }

    // Invalid format
    return (
      `❌ *Format Salah*\n\n` +
      `*Cara menggunakan:*\n` +
      `• /settings - Lihat semua settings\n` +
      `• /settings help - Lihat panduan\n` +
      `• /settings <key> <value> - Update setting\n\n` +
      `*Contoh:*\n` +
      `/settings usdToIdrRate 16000\n` +
      `/settings maintenanceMode true`
    );
  }

  /**
   * Show all system settings
   */
  showAllSettings() {
    const { getAllSettings } = require("./config");
    const settings = getAllSettings();

    let message = "⚙️ *SYSTEM SETTINGS*\n\n";

    message += "💱 *Currency & Pricing:*\n";
    message += `• usdToIdrRate: ${settings.usdToIdrRate}\n`;
    message += `• currency: ${settings.currency}\n\n`;

    message += "⏱️ *Session & Rate Limit:*\n";
    message += `• sessionTimeout: ${settings.sessionTimeout} minutes\n`;
    message += `• maxMessagesPerMinute: ${settings.maxMessagesPerMinute}\n\n`;

    message += "🏪 *Business Info:*\n";
    message += `• shopName: ${settings.shopName}\n`;
    message += `• supportEmail: ${settings.supportEmail}\n`;
    message += `• supportWhatsapp: ${settings.supportWhatsapp}\n\n`;

    message += "📦 *Delivery & Stock:*\n";
    message += `• autoDeliveryEnabled: ${settings.autoDeliveryEnabled}\n`;
    message += `• lowStockThreshold: ${settings.lowStockThreshold}\n\n`;

    message += "🔧 *System:*\n";
    message += `• maintenanceMode: ${settings.maintenanceMode}\n`;
    message += `• welcomeMessageEnabled: ${settings.welcomeMessageEnabled}\n`;
    message += `• logLevel: ${settings.logLevel}\n\n`;

    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "💡 *Tips:*\n";
    message += "• Ketik /settings help untuk panduan\n";
    message += "• Ketik /settings <key> <value> untuk update";

    return message;
  }

  /**
   * Show settings help guide
   */
  showSettingsHelp() {
    let message = "📖 *SETTINGS GUIDE*\n\n";

    message += "🔑 *Available Settings:*\n\n";

    message += "💱 *Currency & Pricing:*\n";
    message += "• usdToIdrRate - Kurs USD ke IDR\n";
    message += "  Contoh: /settings usdToIdrRate 16000\n\n";

    message += "⏱️ *Session & Rate Limit:*\n";
    message += "• sessionTimeout - Timeout session (menit)\n";
    message += "  Contoh: /settings sessionTimeout 45\n";
    message += "• maxMessagesPerMinute - Max pesan per menit\n";
    message += "  Contoh: /settings maxMessagesPerMinute 30\n\n";

    message += "🏪 *Business Info:*\n";
    message += "• shopName - Nama toko\n";
    message += '  Contoh: /settings shopName "Toko Voucher"\n';
    message += "• supportEmail - Email support\n";
    message += "  Contoh: /settings supportEmail support@toko.com\n";
    message += "• supportWhatsapp - Nomor WA support\n";
    message += "  Contoh: /settings supportWhatsapp 628123456789\n\n";

    message += "📦 *Delivery & Stock:*\n";
    message += "• autoDeliveryEnabled - Auto kirim produk (true/false)\n";
    message += "  Contoh: /settings autoDeliveryEnabled true\n";
    message += "• lowStockThreshold - Batas stok rendah\n";
    message += "  Contoh: /settings lowStockThreshold 10\n\n";

    message += "🔧 *System:*\n";
    message += "• maintenanceMode - Mode maintenance (true/false)\n";
    message += "  Contoh: /settings maintenanceMode false\n";
    message += "• welcomeMessageEnabled - Welcome message (true/false)\n";
    message += "  Contoh: /settings welcomeMessageEnabled true\n";
    message += "• logLevel - Level logging (info/debug/error)\n";
    message += "  Contoh: /settings logLevel debug\n\n";

    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "⚠️ *Perhatian:*\n";
    message += "• Setting bersifat temporary (hilang saat restart)\n";
    message += "• Untuk permanent, edit file .env\n";
    message += "• Restart bot setelah edit .env";

    return message;
  }

  /**
   * Admin Command: /broadcast <message>
   * Send message to all active customers
   */
  async handleAdminBroadcast(adminId, fullMessage) {
    if (!InputValidator.isAdmin(adminId)) {
      this.logger.logSecurity(
        adminId,
        "unauthorized_admin_access",
        "not_in_whitelist"
      );
      return UIMessages.unauthorized();
    }

    // Extract message after "/broadcast "
    const message = fullMessage.substring("/broadcast ".length).trim();

    if (!message) {
      return `❌ *Format Salah*\n\nGunakan: /broadcast <pesan>\n\nContoh:\n/broadcast Promo spesial! Diskon 20% semua produk hari ini! 🎉`;
    }

    try {
      // Get all active customer IDs from session manager
      const activeCustomers = this.sessionManager.getAllCustomerIds
        ? await this.sessionManager.getAllCustomerIds()
        : [];

      if (activeCustomers.length === 0) {
        return `⚠️ *Tidak Ada Customer Aktif*\n\nTidak ada customer yang bisa menerima broadcast saat ini.`;
      }

      // Return broadcast info - actual sending will be handled by index.js
      this.logger.logAdminAction(adminId, "broadcast_initiated", "all", {
        message: message.substring(0, 100),
        recipientCount: activeCustomers.length,
      });

      return {
        type: "broadcast",
        message: message,
        recipients: activeCustomers,
        confirmMessage: `📢 *Broadcast Dikirim*\n\n✅ Pesan dikirim ke ${
          activeCustomers.length
        } customer aktif\n\n*Preview:*\n${message.substring(0, 200)}${
          message.length > 200 ? "..." : ""
        }`,
      };
    } catch (error) {
      console.error("❌ Error initiating broadcast:", error);
      return `❌ *Error Broadcast*\n\n${error.message}`;
    }
  }

  /**
   * Handle payment proof upload
   * @param {string} customerId
   * @returns {Object} Response with confirmation message
   */
  async handlePaymentProof(customerId) {
    const orderId = await this.sessionManager.getOrderId(customerId);
    const cart = await this.sessionManager.getCart(customerId);

    // Set to awaiting admin approval
    await this.sessionManager.setStep(customerId, "awaiting_admin_approval");

    // Log payment proof upload
    this.logger.logAdminAction(customerId, "payment_proof_uploaded", orderId, {
      timestamp: new Date().toISOString(),
    });

    return {
      message: `✅ *Bukti Pembayaran Diterima!*\n\nOrder ID: ${orderId}\n\nBukti pembayaran Anda telah diterima dan sedang diverifikasi oleh admin.\n\n⏱️ Waktu verifikasi: 5-15 menit\n\nAnda akan menerima notifikasi setelah pembayaran diverifikasi.`,
      forwardToAdmin: true,
      orderId: orderId,
      cart: cart,
    };
  }
}

module.exports = ChatbotLogic;
