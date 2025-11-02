/**
 * Application Configuration
 * System settings and business configuration
 */

module.exports = {
  // Currency settings
  currency: {
    usdToIdrRate: parseInt(process.env.USD_TO_IDR_RATE) || 15800,
    default: "IDR",
  },

  // Session settings
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 30, // minutes
    ttl: 1800, // seconds
    cleanupInterval: 600000, // 10 minutes in ms
  },

  // Rate limiting
  rateLimit: {
    maxMessagesPerMinute: parseInt(process.env.MAX_MESSAGES_PER_MINUTE) || 20,
    cooldownDuration: 60000, // 1 minute in ms
    errorCooldown: 300000, // 5 minutes in ms
  },

  // Business settings
  shop: {
    name: process.env.SHOP_NAME || "Premium Shop",
    supportEmail: process.env.SUPPORT_EMAIL || "support@premiumshop.com",
    supportWhatsapp: process.env.SUPPORT_WHATSAPP || "Nomor ini",
  },

  // Feature flags
  features: {
    autoDelivery: process.env.AUTO_DELIVERY === "true",
    maintenance: process.env.MAINTENANCE_MODE === "true",
    welcomeMessage: process.env.WELCOME_MESSAGE_ENABLED !== "false",
  },

  // Maintenance
  maintenance: {
    enabled: process.env.MAINTENANCE_MODE === "true",
    message:
      process.env.MAINTENANCE_MESSAGE ||
      "🔧 Sistem sedang maintenance. Mohon coba lagi nanti.",
  },

  // Stock warnings
  stock: {
    lowThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD) || 5,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    retentionDays: 30,
  },
};
