/**
 * Error Messages Utility
 * Centralized error messages to reduce duplication and improve consistency
 * Imported from PR #1 - GitHub Copilot Agent optimization
 */

class ErrorMessages {
  /**
   * Generic error messages
   */
  static get GENERIC_ERROR() {
    return "❌ Terjadi kesalahan. Silakan coba lagi atau ketik *menu* untuk kembali ke menu utama.";
  }

  static get TRY_AGAIN_LATER() {
    return "Silakan coba lagi nanti.";
  }

  static get CONTACT_ADMIN() {
    return "atau hubungi admin.";
  }

  /**
   * Order and payment errors
   */
  static orderHistoryError() {
    return `❌ Gagal mengambil riwayat pesanan. ${this.TRY_AGAIN_LATER}`;
  }

  static trackOrderError() {
    return `❌ Gagal mengambil riwayat pesanan. ${this.TRY_AGAIN_LATER}`;
  }

  static paymentProofError() {
    return `❌ Gagal memproses bukti pembayaran. ${this.TRY_AGAIN_LATER} ${this.CONTACT_ADMIN}`;
  }

  /**
   * Wishlist errors
   */
  static wishlistSaveError() {
    return `❌ Gagal menyimpan ke wishlist. ${this.TRY_AGAIN_LATER}`;
  }

  static wishlistRemoveError() {
    return `❌ Gagal menghapus dari wishlist. ${this.TRY_AGAIN_LATER}`;
  }

  static wishlistViewError() {
    return `❌ Gagal menampilkan wishlist. ${this.TRY_AGAIN_LATER}`;
  }

  /**
   * Review errors
   */
  static addReviewError() {
    return `❌ Gagal menambahkan review. ${this.TRY_AGAIN_LATER} ${this.CONTACT_ADMIN}`;
  }

  static viewReviewsError() {
    return `❌ Gagal menampilkan reviews. ${this.TRY_AGAIN_LATER}`;
  }

  static reviewStatsError() {
    return `❌ Gagal menampilkan review statistics. ${this.TRY_AGAIN_LATER}`;
  }

  static deleteReviewError() {
    return `❌ Gagal menghapus review. ${this.TRY_AGAIN_LATER}`;
  }

  /**
   * Admin errors
   */
  static adminCommandError(error) {
    return `❌ Terjadi kesalahan saat menjalankan command admin.\n\n${error.message}`;
  }

  static unauthorized() {
    return "❌ *AKSES DITOLAK*\n\nAnda tidak memiliki akses ke fitur admin.";
  }

  /**
   * Product errors
   */
  static productNotFound() {
    return "❌ Produk tidak ditemukan. Ketik *menu* untuk melihat daftar produk.";
  }

  static outOfStock() {
    return "❌ Maaf, produk ini sedang habis stok.";
  }

  /**
   * Validation errors
   */
  static invalidInput() {
    return "❌ Input tidak valid. Silakan coba lagi.";
  }

  static invalidMessage() {
    return "❌ Pesan tidak valid. Silakan coba lagi.";
  }

  /**
   * Rate limiting errors
   */
  static rateLimitExceeded(limit, waitTime) {
    return `⚠️ *Terlalu banyak pesan*\n\nAnda telah mencapai batas ${limit} pesan/menit.\n\nSilakan tunggu ${waitTime} detik.`;
  }

  static orderLimitExceeded(limit) {
    return `⚠️ *Batas Order Harian*\n\nAnda telah mencapai batas ${limit} order per hari.\n\nSilakan coba lagi besok.`;
  }

  /**
   * Success messages
   */
  static success(message) {
    return `✅ ${message}`;
  }

  static itemAdded(productName) {
    return `✅ *${productName}* berhasil ditambahkan ke keranjang!`;
  }

  static itemRemoved(productName) {
    return `✅ *${productName}* berhasil dihapus dari keranjang!`;
  }
}

module.exports = ErrorMessages;
