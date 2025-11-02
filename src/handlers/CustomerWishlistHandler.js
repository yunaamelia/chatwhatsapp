/**
 * Customer Wishlist Handler
 * Handles wishlist/favorites functionality for customers
 * Extracted from CustomerHandler for better code organization
 */

const BaseHandler = require("./BaseHandler");
const UIMessages = require("../../lib/uiMessages");

class CustomerWishlistHandler extends BaseHandler {
  constructor(wishlistService, productService, logger) {
    super();
    this.wishlistService = wishlistService;
    this.productService = productService;
    this.logger = logger;
  }

  /**
   * Handle view wishlist
   * Command: /wishlist
   */
  async handleViewWishlist(customerId) {
    console.log(`[CustomerWishlistHandler] handleViewWishlist()`);

    try {
      const wishlist = await this.wishlistService.getWishlist(customerId);

      if (wishlist.length === 0) {
        return (
          "⭐ *Wishlist Anda*\n\n" +
          "Wishlist Anda masih kosong.\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "*Cara Menambahkan:*\n" +
          "• Ketik: *simpan <nama produk>*\n" +
          "• Atau: *⭐ <nama produk>*\n\n" +
          "Contoh:\n" +
          "• simpan netflix\n" +
          "• ⭐ spotify\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "💬 Ketik *browse* untuk melihat produk"
        );
      }

      return UIMessages.wishlistView(wishlist);
    } catch (error) {
      this.logError(customerId, error, { action: "view_wishlist" });
      return "❌ Gagal menampilkan wishlist. Silakan coba lagi atau hubungi admin.";
    }
  }

  /**
   * Handle save product to wishlist
   * Command: simpan <product-name> or ⭐ <product-name>
   */
  async handleSaveToWishlist(customerId, productName) {
    console.log(
      `[CustomerWishlistHandler] handleSaveToWishlist() - Product: ${productName}`
    );

    try {
      // Find product using fuzzy search
      const allProducts = this.productService.getAllProducts();
      const matches = this.productService.fuzzySearchProducts(
        allProducts,
        productName,
        0.3
      );

      if (matches.length === 0) {
        return (
          "❌ *Produk tidak ditemukan*\n\n" +
          `Tidak ada produk yang cocok dengan "${productName}"\n\n` +
          "Ketik *browse* untuk melihat katalog"
        );
      }

      // Use best match
      const product = matches[0];
      const result = await this.wishlistService.addProduct(
        customerId,
        product.id
      );

      return result.message;
    } catch (error) {
      this.logError(customerId, error, {
        action: "save_to_wishlist",
        productName,
      });
      return "❌ Gagal menyimpan ke wishlist. Silakan coba lagi atau hubungi admin.";
    }
  }

  /**
   * Handle remove from wishlist
   * Command: hapus <product-name>
   */
  async handleRemoveFromWishlist(customerId, productId) {
    console.log(
      `[CustomerWishlistHandler] handleRemoveFromWishlist() - Product ID: ${productId}`
    );

    try {
      const result = await this.wishlistService.removeProduct(
        customerId,
        productId
      );
      return result.message;
    } catch (error) {
      this.logError(customerId, error, {
        action: "remove_from_wishlist",
        productId,
      });
      return "❌ Gagal menghapus dari wishlist. Silakan coba lagi atau hubungi admin.";
    }
  }

  /**
   * Handle move wishlist item to cart
   * Used from wishlist view menu
   */
  async handleMoveToCart(customerId, productId) {
    console.log(
      `[CustomerWishlistHandler] handleMoveToCart() - Product ID: ${productId}`
    );

    try {
      const result = await this.wishlistService.moveToCart(
        customerId,
        productId
      );
      return result.message;
    } catch (error) {
      this.logError(customerId, error, { action: "move_to_cart", productId });
      return "❌ Gagal memindahkan ke keranjang. Silakan coba lagi atau hubungi admin.";
    }
  }

  /**
   * Log action
   */
  log(customerId, action, data = {}) {
    if (this.logger) {
      this.logger.log("customer_wishlist_action", {
        customerId: this._maskCustomerId(customerId),
        action,
        timestamp: new Date().toISOString(),
        ...data,
      });
    }
  }

  /**
   * Log error
   */
  logError(customerId, error, context = {}) {
    if (this.logger) {
      this.logger.error("customer_wishlist_error", {
        customerId: this._maskCustomerId(customerId),
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

module.exports = CustomerWishlistHandler;
