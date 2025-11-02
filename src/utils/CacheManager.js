/**
 * Cache Manager
 * Simple in-memory cache with TTL support
 */

class CacheManager {
  constructor() {
    this.cache = new Map(); // key -> {value, expires}
    this.enabled = process.env.ENABLE_CACHE !== "false"; // Enabled by default
    this.cleanupInterval = null;
    
    // Default TTL configurations (in seconds)
    this.defaultTTL = {
      products: 300, // 5 minutes
      settings: 600, // 10 minutes
      stats: 60, // 1 minute
      sessions: 1800, // 30 minutes
    };

    // Cleanup expired entries every 5 minutes
    if (this.enabled) {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Get value from cache
   * @param {string} key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    if (!this.enabled) {
      return undefined;
    }

    const cached = this.cache.get(key);
    if (!cached) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.value;
  }

  /**
   * Set value in cache
   * @param {string} key
   * @param {*} value
   * @param {number} ttl - Time to live in seconds
   */
  set(key, value, ttl = 300) {
    if (!this.enabled) {
      return;
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
      createdAt: Date.now(),
    });
  }

  /**
   * Delete value from cache
   * @param {string} key
   * @returns {boolean} True if deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Check if key exists in cache
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    if (!this.enabled) {
      return false;
    }

    const cached = this.cache.get(key);
    if (!cached) {
      return false;
    }

    // Check if expired
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get or set pattern - fetch from cache or execute function
   * @param {string} key
   * @param {Function} fetchFn - Function to call if cache miss
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<*>}
   */
  async getOrSet(key, fetchFn, ttl = 300) {
    if (!this.enabled) {
      return await fetchFn();
    }

    // Try to get from cache
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Cache miss - fetch and cache
    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear cache by pattern
   * @param {string|RegExp} pattern
   */
  clearPattern(pattern) {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expires) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[Cache] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;
    const ages = [];

    for (const cached of this.cache.values()) {
      if (now > cached.expires) {
        expired++;
      } else {
        valid++;
        ages.push(now - cached.createdAt);
      }
    }

    const avgAge = ages.length > 0 
      ? ages.reduce((a, b) => a + b, 0) / ages.length 
      : 0;

    return {
      total: this.cache.size,
      valid,
      expired,
      avgAgeSeconds: Math.round(avgAge / 1000),
      enabled: this.enabled,
    };
  }

  /**
   * Generate cache report
   * @returns {string}
   */
  generateReport() {
    if (!this.enabled) {
      return "Cache is disabled. Set ENABLE_CACHE=true to enable.";
    }

    const stats = this.getStats();
    
    let report = "💾 *CACHE REPORT*\n\n";
    report += `• Total Entries: ${stats.total}\n`;
    report += `• Valid: ${stats.valid}\n`;
    report += `• Expired: ${stats.expired}\n`;
    report += `• Avg Age: ${stats.avgAgeSeconds}s\n`;
    report += `• Status: ${this.enabled ? "Enabled" : "Disabled"}\n`;

    return report;
  }

  /**
   * Stop cleanup interval
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

}

/**
 * Cache key builders for common patterns
 */
CacheManager.keys = {
  product: (productId) => `product:${productId}`,
  products: () => "products:all",
  setting: (key) => `setting:${key}`,
  settings: () => "settings:all",
  session: (customerId) => `session:${customerId}`,
  stats: (type) => `stats:${type}`,
  order: (orderId) => `order:${orderId}`,
  review: (reviewId) => `review:${reviewId}`,
  promo: (code) => `promo:${code}`,
};

// Singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;
