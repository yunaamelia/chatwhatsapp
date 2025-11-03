/**
 * Redis Stock Manager
 * Handles realtime stock management with Redis persistence
 */

const redisClientManager = require("../../../lib/redisClient");
const { products: productsCatalog } = require("../../config/products.config");

class RedisStockManager {
  constructor() {
    this.STOCK_PREFIX = "stock:";
    this.STOCK_HISTORY_PREFIX = "stock_history:";
    this.initialized = false;
    this.redisClient = null;
  }

  /**
   * Initialize stock from config (first run only)
   * Redis is the source of truth - only initialize if key doesn't exist
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Get Redis client (must be called after Redis is connected)
      this.redisClient = redisClientManager.getClient();

      if (!this.redisClient) {
        console.error("❌ RedisStockManager: Redis client not available");
        return;
      }

      // Initialize stock for all products if not exists
      const allProducts = [
        ...productsCatalog.premiumAccounts,
        ...productsCatalog.virtualCards,
      ];

      let newProductsCount = 0;
      let existingProductsCount = 0;

      for (const product of allProducts) {
        const key = `${this.STOCK_PREFIX}${product.id}`;
        const existingStock = await this.redisClient.get(key);

        if (existingStock === null) {
          // New product - initialize with 0 stock (admin must set stock manually)
          await this.redisClient.set(key, "0");
          console.log(
            `✅ New product detected: ${product.id} = 0 (use /addstock to set initial stock)`
          );
          newProductsCount++;
        } else {
          // Product exists - keep Redis value (source of truth)
          existingProductsCount++;
        }
      }

      this.initialized = true;
      console.log(
        `✅ RedisStockManager initialized (${newProductsCount} new, ${existingProductsCount} existing)`
      );
    } catch (error) {
      console.error("❌ RedisStockManager initialization failed:", error);
    }
  }

  /**
   * Get product stock
   * @param {string} productId
   * @returns {Promise<number>}
   */
  async getStock(productId) {
    try {
      if (!this.redisClient) {
        console.warn("⚠️ RedisStockManager: Redis client not initialized");
        return 0;
      }

      const key = `${this.STOCK_PREFIX}${productId}`;
      const stock = await this.redisClient.get(key);

      if (stock === null) {
        // Initialize stock if not exists
        const product = this.findProduct(productId);
        if (product) {
          await this.redisClient.set(key, product.stock.toString());
          return product.stock;
        }
        return 0;
      }

      return parseInt(stock);
    } catch (error) {
      console.error(`❌ Failed to get stock for ${productId}:`, error);
      return 0;
    }
  }

  /**
   * Set product stock
   * @param {string} productId
   * @param {number} quantity
   * @param {string} reason - Reason for stock change
   * @returns {Promise<boolean>}
   */
  async setStock(productId, quantity, reason = "manual_update") {
    try {
      const key = `${this.STOCK_PREFIX}${productId}`;
      const oldStock = await this.getStock(productId);

      await this.redisClient.set(key, Math.max(0, quantity).toString());

      // Log stock history
      await this.logStockHistory(productId, oldStock, quantity, reason);

      console.log(
        `✅ Stock updated: ${productId} ${oldStock} → ${quantity} (${reason})`
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to set stock for ${productId}:`, error);
      return false;
    }
  }

  /**
   * Decrement product stock (atomic operation)
   * @param {string} productId
   * @param {number} quantity
   * @param {string} orderId
   * @returns {Promise<{success: boolean, newStock: number}>}
   */
  async decrementStock(productId, quantity = 1, orderId = null) {
    try {
      const key = `${this.STOCK_PREFIX}${productId}`;
      const currentStock = await this.getStock(productId);

      if (currentStock < quantity) {
        return {
          success: false,
          newStock: currentStock,
          message: "Insufficient stock",
        };
      }

      // Atomic decrement
      const newStock = await this.redisClient.decrBy(key, quantity);

      // Log stock history
      const reason = orderId ? `order_${orderId}` : "sale";
      await this.logStockHistory(
        productId,
        currentStock,
        newStock,
        reason,
        orderId
      );

      console.log(
        `✅ Stock decremented: ${productId} ${currentStock} → ${newStock} (${reason})`
      );

      return {
        success: true,
        newStock: newStock,
      };
    } catch (error) {
      console.error(`❌ Failed to decrement stock for ${productId}:`, error);
      return {
        success: false,
        newStock: await this.getStock(productId),
        message: error.message,
      };
    }
  }

  /**
   * Increment product stock (atomic operation)
   * @param {string} productId
   * @param {number} quantity
   * @param {string} reason
   * @returns {Promise<{success: boolean, newStock: number}>}
   */
  async incrementStock(productId, quantity = 1, reason = "restock") {
    try {
      const key = `${this.STOCK_PREFIX}${productId}`;
      const oldStock = await this.getStock(productId);

      // Atomic increment
      const newStock = await this.redisClient.incrBy(key, quantity);

      // Log stock history
      await this.logStockHistory(productId, oldStock, newStock, reason);

      console.log(
        `✅ Stock incremented: ${productId} ${oldStock} → ${newStock} (${reason})`
      );

      return {
        success: true,
        newStock: newStock,
      };
    } catch (error) {
      console.error(`❌ Failed to increment stock for ${productId}:`, error);
      return {
        success: false,
        newStock: await this.getStock(productId),
        message: error.message,
      };
    }
  }

  /**
   * Check if product is in stock
   * @param {string} productId
   * @returns {Promise<boolean>}
   */
  async isInStock(productId) {
    const stock = await this.getStock(productId);
    return stock > 0;
  }

  /**
   * Get all products with realtime stock
   * @returns {Promise<Array>}
   */
  async getAllProductsWithStock() {
    const allProducts = [
      ...productsCatalog.premiumAccounts,
      ...productsCatalog.virtualCards,
    ];

    const productsWithStock = await Promise.all(
      allProducts.map(async (product) => {
        const stock = await this.getStock(product.id);
        return {
          ...product,
          stock: stock,
        };
      })
    );

    return productsWithStock;
  }

  /**
   * Get low stock products
   * @param {number} threshold
   * @returns {Promise<Array>}
   */
  async getLowStockProducts(threshold = 5) {
    const allProducts = await this.getAllProductsWithStock();
    return allProducts.filter(
      (product) => product.stock > 0 && product.stock <= threshold
    );
  }

  /**
   * Get out of stock products
   * @returns {Promise<Array>}
   */
  async getOutOfStockProducts() {
    const allProducts = await this.getAllProductsWithStock();
    return allProducts.filter((product) => product.stock === 0);
  }

  /**
   * Log stock history
   * @private
   */
  async logStockHistory(
    productId,
    oldStock,
    newStock,
    reason,
    orderId = null
  ) {
    try {
      const historyKey = `${this.STOCK_HISTORY_PREFIX}${productId}`;
      const timestamp = new Date().toISOString();

      const entry = JSON.stringify({
        timestamp,
        oldStock,
        newStock,
        change: newStock - oldStock,
        reason,
        orderId,
      });

      // Store last 100 entries
      await this.redisClient.lPush(historyKey, entry);
      await this.redisClient.lTrim(historyKey, 0, 99);
    } catch (error) {
      console.error("❌ Failed to log stock history:", error);
    }
  }

  /**
   * Get stock history for a product
   * @param {string} productId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getStockHistory(productId, limit = 10) {
    try {
      const historyKey = `${this.STOCK_HISTORY_PREFIX}${productId}`;
      const entries = await this.redisClient.lRange(historyKey, 0, limit - 1);

      return entries.map((entry) => JSON.parse(entry));
    } catch (error) {
      console.error("❌ Failed to get stock history:", error);
      return [];
    }
  }

  /**
   * Find product from catalog
   * @private
   */
  findProduct(productId) {
    const allProducts = [
      ...productsCatalog.premiumAccounts,
      ...productsCatalog.virtualCards,
    ];
    return allProducts.find((p) => p.id === productId);
  }

  /**
   * Get stock report for all products
   * @returns {Promise<Object>}
   */
  async getStockReport() {
    const allProducts = await this.getAllProductsWithStock();
    const lowStockProducts = await this.getLowStockProducts();
    const outOfStockProducts = await this.getOutOfStockProducts();

    const totalStock = allProducts.reduce(
      (sum, product) => sum + product.stock,
      0
    );

    return {
      totalProducts: allProducts.length,
      totalStock,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      outOfStockProducts,
      allProducts,
    };
  }

  /**
   * Force sync stock from config to Redis (admin only)
   * WARNING: This will overwrite all Redis stock values with config values
   * @param {boolean} confirm - Must be true to execute
   * @returns {Promise<Object>}
   */
  async syncFromConfig(confirm = false) {
    if (!confirm) {
      return {
        success: false,
        message:
          "⚠️ Sync cancelled. Pass confirm=true to force sync from config.",
      };
    }

    try {
      const allProducts = [
        ...productsCatalog.premiumAccounts,
        ...productsCatalog.virtualCards,
      ];

      const syncResults = [];

      for (const product of allProducts) {
        const key = `${this.STOCK_PREFIX}${product.id}`;
        const oldStock = await this.getStock(product.id);
        await this.redisClient.set(key, product.stock.toString());

        syncResults.push({
          productId: product.id,
          oldStock: oldStock,
          newStock: product.stock,
        });

        // Log sync history
        await this.logStockHistory(
          product.id,
          oldStock,
          product.stock,
          "force_sync_from_config"
        );
      }

      return {
        success: true,
        message: `✅ Synced ${syncResults.length} products from config to Redis`,
        results: syncResults,
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Sync failed: ${error.message}`,
      };
    }
  }

  /**
   * Reset all stock to config defaults (admin only)
   * @param {boolean} confirm - Must be true to execute
   * @returns {Promise<Object>}
   */
  async resetAllStock(confirm = false) {
    if (!confirm) {
      return {
        success: false,
        message:
          "⚠️ Reset cancelled. This will reset ALL stock to config defaults. Pass confirm=true to execute.",
      };
    }

    return await this.syncFromConfig(true);
  }
}

module.exports = RedisStockManager;
