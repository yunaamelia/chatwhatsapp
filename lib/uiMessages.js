/**
 * UI Messages & Templates
 * Centralized user interface messages
 */

const config = require("../src/config/app.config");

class UIMessages {
  /**
   * Main menu
   */
  static mainMenu() {
    const shopName = config.shop.name;
    return `👋 *Selamat datang di ${shopName}!*

Saya asisten belanja Anda, siap membantu! 🛒

*Apa yang ingin Anda lakukan?*

1️⃣ Jelajahi Produk
2️⃣ Lihat Keranjang
3️⃣ Tentang Kami
4️⃣ Hubungi Dukungan

Ketik nomor atau kata kunci untuk melanjutkan.

💡 *Perintah Cepat:*
• Ketik *menu* - Kembali ke menu utama
• Ketik *cart* - Lihat keranjang Anda
• Ketik *history* - Lihat riwayat pesanan
• Ketik *help* - Tampilkan menu ini`;
  }

  /**
   * Product added to cart
   */
  static productAdded(productName, priceIDR) {
    return `✅ *Ditambahkan ke keranjang!*

📦 ${productName}
💰 Rp ${priceIDR.toLocaleString("id-ID")}

*Selanjutnya apa?*
• Tambah produk lain (ketik nama produk)
• Ketik *cart* untuk lihat keranjang dan checkout
• Ketik *menu* untuk menu utama`;
  }

  /**
   * Product browsing instructions
   */
  static browsingInstructions(productList) {
    let message = productList;
    message += "\n━━━━━━━━━━━━━━━━━━\n\n";
    message += "*Cara memesan:*\n";
    message += "Ketik nama produk atau ID untuk menambahkan ke keranjang\n";
    message += 'Contoh: "netflix" atau "spotify"\n\n';
    message += "📦 Ketik *cart* untuk melihat keranjang\n";
    message += "🏠 Ketik *menu* untuk kembali ke menu utama";
    return message;
  }

  /**
   * Cart view
   */
  static cartView(cart, total) {
    let message = "🛒 *YOUR CART*\n\n";
    const usdToIdrRate = config.currency.usdToIdrRate;

    cart.forEach((item, index) => {
      const priceIDR = item.price * usdToIdrRate;
      message += `${index + 1}. ${item.name}\n`;
      message += `   💰 Rp ${priceIDR.toLocaleString("id-ID")}\n\n`;
    });

    const totalIDR = total * usdToIdrRate;
    message += "━━━━━━━━━━━━━━━━━━\n";
    message += `💵 *Total: Rp ${totalIDR.toLocaleString("id-ID")}*\n\n`;
    message += "*Siap checkout?*\n";
    message += "• Ketik *checkout* untuk selesaikan pesanan\n";
    message += "• Ketik *clear* untuk kosongkan keranjang\n";
    message += "• Ketik *menu* untuk menu utama";

    return message;
  }

  /**
   * Order summary
   */
  static orderSummary(orderId, cart, totalIDR) {
    let message = "✅ *PESANAN DIKONFIRMASI!*\n\n";
    message += `📋 Order ID: ${orderId}\n\n`;
    message += "*Ringkasan Pesanan:*\n";
    const usdToIdrRate = config.currency.usdToIdrRate;

    cart.forEach((item, index) => {
      const priceIDR = item.price * usdToIdrRate;
      message += `${index + 1}. ${item.name} - Rp ${priceIDR.toLocaleString(
        "id-ID"
      )}\n`;
    });

    message += `\n💵 *Total: Rp ${totalIDR.toLocaleString("id-ID")}*\n\n`;

    return message;
  }

  /**
   * About page
   */
  static about() {
    const shopName = config.shop.name;
    return `ℹ️ *TENTANG KAMI*

Selamat datang di ${shopName}! 🎉

Kami spesialis dalam:
📺 Akun streaming premium
💳 Kartu kredit virtual
⚡ Pengiriman cepat (5-15 menit)
💯 Kualitas terjamin
💰 Harga terjangkau (mulai $1/item)

Kami berkomitmen memberikan layanan terbaik untuk pelanggan!

Ketik *menu* untuk kembali ke menu utama`;
  }

  /**
   * Contact page
   */
  static contact() {
    const supportEmail = config.shop.supportEmail;
    const supportWhatsapp = config.shop.supportWhatsapp;
    const workingHours = config.shop.workingHours;
    return `📞 *HUBUNGI DUKUNGAN*

Butuh bantuan? Kami siap membantu! 💬

⏰ Jam Kerja: ${workingHours}
📱 WhatsApp: ${supportWhatsapp}
📧 Email: ${supportEmail}

Tim kami merespons dalam hitungan menit!

Ketik *menu* untuk kembali ke menu utama`;
  }

  /**
   * Error messages
   */
  static invalidOption() {
    return "❌ Pilihan tidak valid. Silakan ketik nomor (1-4) atau kata kunci.";
  }

  static productNotFound() {
    return "❌ Produk tidak ditemukan. Silakan cek daftar produk dan coba lagi.\n\nKetik *menu* untuk lihat semua produk.";
  }

  static emptyCart() {
    return "🛒 *Keranjang Anda kosong*\n\nJelajahi produk kami dan tambahkan item ke keranjang!\n\nKetik *menu* untuk lihat menu utama";
  }

  static cartCleared() {
    return "🗑️ Keranjang dikosongkan!\n\nKetik *menu* untuk lanjut belanja.";
  }

  static checkoutPrompt() {
    return "Silakan ketik *checkout* untuk selesaikan pesanan atau *clear* untuk kosongkan keranjang.\n\nKetik *menu* untuk menu utama.";
  }

  /**
   * Admin messages
   */
  static unauthorized() {
    return "❌ Tidak diizinkan. Perintah khusus admin.";
  }

  static adminApprovalFormat() {
    return "❌ Format: /approve <order_id>\n\nContoh: /approve ORD-1730000000000-1234";
  }

  static orderNotFound(orderId) {
    return `❌ Order ID ${orderId} tidak ditemukan.\n\nPastikan order ID benar.`;
  }

  static orderNotPending(orderId) {
    return `❌ Order ${orderId} tidak dalam status menunggu approval.`;
  }

  static deliveryFailed(orderId) {
    return `❌ Gagal mengirim produk untuk order ${orderId}.\n\nTidak ada produk yang tersedia di database.`;
  }

  static approvalSuccess(orderId) {
    return `✅ *APPROVED!*\n\nOrder ${orderId} telah disetujui.\nProduk akan dikirim ke customer.`;
  }

  /**
   * Waiting messages
   */
  static awaitingAdminApproval() {
    return "⏱️ Menunggu verifikasi admin...\n\nPembayaran Anda sedang diverifikasi.\nMohon tunggu 5-15 menit.";
  }
}

module.exports = UIMessages;
