/**
 * Legacy Config Wrapper
 * Re-exports from modular config files for backward compatibility
 * TODO: Update all imports to use new config files directly
 */

const appConfig = require("./src/config/app.config");
const paymentConfig = require("./src/config/payment.config");
const productsConfig = require("./src/config/products.config");
const ProductService = require("./src/services/product/ProductService");

// Initialize product service for legacy functions
const productService = new ProductService();

// Re-export system settings (flatten for backward compatibility)
const systemSettings = {
  // Currency
  usdToIdrRate: appConfig.currency.usdToIdrRate,
  currency: appConfig.currency.default,

  // Session
  sessionTimeout: appConfig.session.timeout,

  // Rate limiting
  maxMessagesPerMinute: appConfig.rateLimit.maxMessagesPerMinute,

  // Business
  shopName: appConfig.shop.name,
  supportEmail: appConfig.shop.supportEmail,
  supportWhatsapp: appConfig.shop.supportWhatsapp,

  // Features
  autoDeliveryEnabled: appConfig.features.autoDelivery,
  maintenanceMode: appConfig.maintenance.enabled,
  maintenanceMessage: appConfig.maintenance.message,
  welcomeMessageEnabled: appConfig.features.welcomeMessage,

  // Stock
  lowStockThreshold: appConfig.stock.lowThreshold,

  // Logging
  logLevel: appConfig.logging.level,

  // Payment accounts (flatten)
  paymentAccounts: {
    ...paymentConfig.ewallet,
    ...paymentConfig.banks,
  },
};

// Re-export products
const products = productsConfig.products;
const DEFAULT_STOCK = productsConfig.DEFAULT_STOCK;
const VCC_STOCK = productsConfig.VCC_STOCK;

// Re-export legacy functions (delegate to ProductService)
function getAllProducts() {
  return productService.getAllProducts();
}

function getProductById(productId) {
  return productService.getProductById(productId);
}

function formatProductList() {
  return productService.formatProductList();
}

function isInStock(productId) {
  return productService.isInStock(productId);
}

function setStock(productId, quantity) {
  const success = productService.setStock(productId, quantity);
  if (success) {
    const product = productService.getProductById(productId);
    return {
      success: true,
      product: product,
      oldStock: quantity, // Cannot track old stock in new system
      newStock: quantity,
    };
  }
  return {
    success: false,
    message: `❌ Produk tidak ditemukan: ${productId}`,
  };
}

function decrementStock(productId) {
  return productService.decrementStock(productId);
}

function addProduct(productData) {
  return productService.addProduct(productData);
}

function editProduct(productId, field, value) {
  return productService.editProduct(productId, field, value);
}

function removeProduct(productId) {
  return productService.removeProduct(productId);
}

// Update setting (modify in-memory only, doesn't persist)
function updateSetting(key, value) {
  const validSettings = [
    "usdToIdrRate",
    "sessionTimeout",
    "maxMessagesPerMinute",
    "shopName",
    "supportEmail",
    "supportWhatsapp",
    "autoDeliveryEnabled",
    "maintenanceMode",
    "maintenanceMessage",
    "welcomeMessageEnabled",
    "lowStockThreshold",
    "logLevel",
  ];

  if (!validSettings.includes(key)) {
    return {
      success: false,
      message: `❌ Setting tidak valid: ${key}`,
    };
  }

  // Type conversion
  if (
    [
      "usdToIdrRate",
      "sessionTimeout",
      "maxMessagesPerMinute",
      "lowStockThreshold",
    ].includes(key)
  ) {
    value = parseInt(value);
  } else if (
    [
      "autoDeliveryEnabled",
      "maintenanceMode",
      "welcomeMessageEnabled",
    ].includes(key)
  ) {
    value = value === "true" || value === true;
  }

  systemSettings[key] = value;

  return {
    success: true,
    setting: key,
    oldValue: systemSettings[key],
    newValue: value,
  };
}

/**
 * Get all system settings
 * @returns {Object} System settings object
 */
function getAllSettings() {
  return systemSettings;
}

module.exports = {
  // Configs
  systemSettings,
  products,
  DEFAULT_STOCK,
  VCC_STOCK,

  // Functions
  getAllProducts,
  getProductById,
  formatProductList,
  isInStock,
  setStock,
  decrementStock,
  addProduct,
  editProduct,
  removeProduct,
  updateSetting,
  getAllSettings,
};
