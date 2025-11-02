/**
 * Product Catalog Configuration
 * Define all products available for sale
 */

// Stock values can be configured via environment variables
const DEFAULT_STOCK = process.env.DEFAULT_STOCK || 10;
const VCC_STOCK = process.env.VCC_STOCK || 5;

const products = {
  premiumAccounts: [
    {
      id: "netflix",
      name: "Netflix Premium Account (1 Month)",
      price: 1,
      description: "Full HD streaming, 4 screens",
      stock: DEFAULT_STOCK,
    },
    {
      id: "spotify",
      name: "Spotify Premium Account (1 Month)",
      price: 1,
      description: "Ad-free music, offline download",
      stock: DEFAULT_STOCK,
    },
    {
      id: "youtube",
      name: "YouTube Premium Account (1 Month)",
      price: 1,
      description: "Ad-free videos, background play",
      stock: DEFAULT_STOCK,
    },
    {
      id: "disney",
      name: "Disney+ Premium Account (1 Month)",
      price: 1,
      description: "HD streaming, all content",
      stock: DEFAULT_STOCK,
    },
  ],
  virtualCards: [
    {
      id: "vcc-basic",
      name: "Virtual Credit Card - Basic",
      price: 1,
      description: "Pre-loaded $10 balance",
      stock: VCC_STOCK,
    },
    {
      id: "vcc-standard",
      name: "Virtual Credit Card - Standard",
      price: 1,
      description: "Pre-loaded $25 balance",
      stock: VCC_STOCK,
    },
  ],
};

/**
 * Get all available products
 * @returns {Array} List of all products
 */
function getAllProducts() {
  return [
    ...products.premiumAccounts.map((p) => ({
      ...p,
      category: "Premium Account",
    })),
    ...products.virtualCards.map((p) => ({ ...p, category: "Virtual Card" })),
  ];
}

/**
 * Get product by ID
 * @param {string} productId
 * @returns {Object|null} Product object or null if not found
 */
function getProductById(productId) {
  // Search directly in the original arrays to enable stock modification
  const premiumProduct = products.premiumAccounts.find(
    (p) => p.id === productId
  );
  if (premiumProduct) return premiumProduct;

  const vccProduct = products.virtualCards.find((p) => p.id === productId);
  if (vccProduct) return vccProduct;

  return null;
}

/**
 * Format product list for display
 * @returns {string} Formatted product list
 */
function formatProductList() {
  const USD_TO_IDR = process.env.USD_TO_IDR_RATE || 15800;

  let message = "🛍️ *KATALOG PRODUK* 🛍️\n\n";

  message += "📺 *Akun Premium:*\n";
  products.premiumAccounts.forEach((product, index) => {
    const priceIDR = (product.price * USD_TO_IDR).toLocaleString("id-ID");
    message += `${index + 1}. ${product.name}\n`;
    message += `   💰 Harga: Rp ${priceIDR}\n`;
    message += `   📝 ${product.description}\n`;
    message += `   📦 Stok: ${product.stock} tersedia\n\n`;
  });

  message += "💳 *Kartu Kredit Virtual:*\n";
  products.virtualCards.forEach((product, index) => {
    const priceIDR = (product.price * USD_TO_IDR).toLocaleString("id-ID");
    message += `${index + 1}. ${product.name}\n`;
    message += `   💰 Harga: Rp ${priceIDR}\n`;
    message += `   📝 ${product.description}\n`;
    message += `   📦 Stok: ${product.stock} tersedia\n\n`;
  });

  return message;
}

/**
 * Decrement stock for a product
 */
function decrementStock(productId) {
  const product = getProductById(productId);
  if (product && product.stock > 0) {
    product.stock--;
    return true;
  }
  return false;
}

/**
 * Check if product is in stock
 */
function isInStock(productId) {
  const product = getProductById(productId);
  return product && product.stock > 0;
}

/**
 * Set stock for a product (Admin only)
 * @param {string} productId - Product ID
 * @param {number} quantity - New stock quantity
 * @returns {Object} Result with success status and message
 */
function setStock(productId, quantity) {
  const product = getProductById(productId);

  if (!product) {
    return {
      success: false,
      message: `❌ Produk tidak ditemukan: ${productId}`,
    };
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty < 0) {
    return {
      success: false,
      message: `❌ Jumlah tidak valid: ${quantity}`,
    };
  }

  const oldStock = product.stock;
  product.stock = qty;

  return {
    success: true,
    product: product,
    oldStock: oldStock,
    newStock: qty,
    message: `✅ Stok ${product.name} diupdate: ${oldStock} → ${qty}`,
  };
}

/**
 * Get all product IDs (for validation)
 * @returns {Array} List of all product IDs
 */
function getAllProductIds() {
  return [
    ...products.premiumAccounts.map((p) => p.id),
    ...products.virtualCards.map((p) => p.id),
  ];
}

module.exports = {
  products,
  getAllProducts,
  getProductById,
  formatProductList,
  decrementStock,
  isInStock,
  setStock,
  getAllProductIds,
};
