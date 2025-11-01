/**
 * Product Catalog Configuration
 * Define all products available for sale
 */

const products = {
  premiumAccounts: [
    {
      id: 'netflix',
      name: 'Netflix Premium Account (1 Month)',
      price: 1,
      description: 'Full HD streaming, 4 screens',
      stock: 10
    },
    {
      id: 'spotify',
      name: 'Spotify Premium Account (1 Month)',
      price: 1,
      description: 'Ad-free music, offline download',
      stock: 10
    },
    {
      id: 'youtube',
      name: 'YouTube Premium Account (1 Month)',
      price: 1,
      description: 'Ad-free videos, background play',
      stock: 10
    },
    {
      id: 'disney',
      name: 'Disney+ Premium Account (1 Month)',
      price: 1,
      description: 'HD streaming, all content',
      stock: 10
    }
  ],
  virtualCards: [
    {
      id: 'vcc-basic',
      name: 'Virtual Credit Card - Basic',
      price: 1,
      description: 'Pre-loaded $10 balance',
      stock: 5
    },
    {
      id: 'vcc-standard',
      name: 'Virtual Credit Card - Standard',
      price: 1,
      description: 'Pre-loaded $25 balance',
      stock: 5
    }
  ]
};

/**
 * Get all available products
 * @returns {Array} List of all products
 */
function getAllProducts() {
  return [
    ...products.premiumAccounts.map(p => ({ ...p, category: 'Premium Account' })),
    ...products.virtualCards.map(p => ({ ...p, category: 'Virtual Card' }))
  ];
}

/**
 * Get product by ID
 * @param {string} productId 
 * @returns {Object|null} Product object or null if not found
 */
function getProductById(productId) {
  const allProducts = getAllProducts();
  return allProducts.find(p => p.id === productId) || null;
}

/**
 * Format product list for display
 * @returns {string} Formatted product list
 */
function formatProductList() {
  let message = '🛍️ *PRODUCT CATALOG* 🛍️\n\n';
  
  message += '📺 *Premium Accounts:*\n';
  products.premiumAccounts.forEach((product, index) => {
    message += `${index + 1}. ${product.name}\n`;
    message += `   💰 Price: $${product.price}\n`;
    message += `   📝 ${product.description}\n`;
    message += `   📦 Stock: ${product.stock} available\n\n`;
  });
  
  message += '💳 *Virtual Credit Cards:*\n';
  products.virtualCards.forEach((product, index) => {
    message += `${index + 1}. ${product.name}\n`;
    message += `   💰 Price: $${product.price}\n`;
    message += `   📝 ${product.description}\n`;
    message += `   📦 Stock: ${product.stock} available\n\n`;
  });
  
  return message;
}

module.exports = {
  products,
  getAllProducts,
  getProductById,
  formatProductList
};
