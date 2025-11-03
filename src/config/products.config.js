/**
 * Products Configuration
 * Product catalog and inventory
 * NOTE: Stock values are managed by RedisStockManager, not from this config
 * Initial stock will be set to 0 for new products (admin must set stock manually)
 */

const products = {
  premiumAccounts: [
    {
      id: "netflix",
      name: "Netflix Premium Account (1 Month)",
      price: 15800,
      description: "Full HD streaming, 4 screens",
      stock: 0, // Initial stock (will be overridden by Redis)
      category: "premium",
    },
    {
      id: "spotify",
      name: "Spotify Premium Account (1 Month)",
      price: 15800,
      description: "Ad-free music, offline download",
      stock: 0, // Initial stock (will be overridden by Redis)
      category: "premium",
    },
    {
      id: "youtube",
      name: "YouTube Premium Account (1 Month)",
      price: 15800,
      description: "Ad-free videos, background play",
      stock: 0, // Initial stock (will be overridden by Redis)
      category: "premium",
    },
    {
      id: "disney",
      name: "Disney+ Premium Account (1 Month)",
      price: 15800,
      description: "HD streaming, all content",
      stock: 0, // Initial stock (will be overridden by Redis)
      category: "premium",
    },
  ],

  virtualCards: [
    {
      id: "vcc-basic",
      name: "Virtual Credit Card - Basic",
      price: 15800,
      description: "Pre-loaded $10 balance",
      stock: 0, // Initial stock (will be overridden by Redis)
      category: "vcc",
    },
    {
      id: "vcc-standard",
      name: "Virtual Credit Card - Standard",
      price: 15800,
      description: "Pre-loaded $25 balance",
      stock: 0, // Initial stock (will be overridden by Redis)
      category: "vcc",
    },
  ],
};

module.exports = {
  products,
  DEFAULT_STOCK: 0, // Deprecated - use Redis stock manager
  VCC_STOCK: 0, // Deprecated - use Redis stock manager
};
