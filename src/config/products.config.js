/**
 * Products Configuration
 * Product catalog and inventory
 */

// Stock values from environment
const DEFAULT_STOCK = parseInt(process.env.DEFAULT_STOCK) || 10;
const VCC_STOCK = parseInt(process.env.VCC_STOCK) || 5;

const products = {
  premiumAccounts: [
    {
      id: "netflix",
      name: "Netflix Premium Account (1 Month)",
      price: 15800,
      description: "Full HD streaming, 4 screens",
      stock: DEFAULT_STOCK,
      category: "premium",
    },
    {
      id: "spotify",
      name: "Spotify Premium Account (1 Month)",
      price: 15800,
      description: "Ad-free music, offline download",
      stock: DEFAULT_STOCK,
      category: "premium",
    },
    {
      id: "youtube",
      name: "YouTube Premium Account (1 Month)",
      price: 15800,
      description: "Ad-free videos, background play",
      stock: DEFAULT_STOCK,
      category: "premium",
    },
    {
      id: "disney",
      name: "Disney+ Premium Account (1 Month)",
      price: 15800,
      description: "HD streaming, all content",
      stock: DEFAULT_STOCK,
      category: "premium",
    },
  ],

  virtualCards: [
    {
      id: "vcc-basic",
      name: "Virtual Credit Card - Basic",
      price: 15800,
      description: "Pre-loaded $10 balance",
      stock: VCC_STOCK,
      category: "vcc",
    },
    {
      id: "vcc-standard",
      name: "Virtual Credit Card - Standard",
      price: 15800,
      description: "Pre-loaded $25 balance",
      stock: VCC_STOCK,
      category: "vcc",
    },
  ],
};

module.exports = {
  products,
  DEFAULT_STOCK,
  VCC_STOCK,
};
