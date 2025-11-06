/**
 * UI Messages & Templates - IMPROVED VERSION
 * Modern, clean, mobile-optimized design
 */

const config = require("../src/config/app.config");

class UIMessagesImproved {
  /**
   * Main menu - IMPROVED: Cleaner, more visual
   */
  static mainMenu() {
    return `╔═══════════════════════╗
║  🛍️ *PREMIUM SHOP*  ║
╚═══════════════════════╝

Halo! Mau belanja apa hari ini?

┌─────────────────────┐
│ 🎯 *MENU UTAMA*    │
└─────────────────────┘

1️⃣ 🛍️ *Belanja* - Lihat produk
2️⃣ 🛒 *Keranjang* - Cek order
3️⃣ ⭐ *Favorit* - Wishlist
4️⃣ 📞 *Bantuan* - Hubungi kami

━━━━━━━━━━━━━━━━━━━━━

💬 *Quick Commands:*
cart • wishlist • track

💡 Stock realtime • 6 payment
📦 Auto delivery • Promo ready`;
  }

  /**
   * Main menu - ALTERNATIVE: Minimalist style
   */
  static mainMenuMinimalist() {
    return `🛍️ *PREMIUM SHOP*

Halo! Pilih menu:

🛍️ *belanja* → Lihat produk
🛒 *cart* → Keranjang saya
⭐ *wishlist* → Favorit
📦 *track* → Lacak pesanan
💬 *help* → Butuh bantuan

━━━━━━━━━━━━━━━━━━━━━
💡 Ketik keyword atau angka`;
  }

  /**
   * Help command - IMPROVED: Categorized, scannable
   */
  static helpCommand() {
    return `📚 *PANDUAN LENGKAP*

━━━ 🏠 *NAVIGASI* ━━━
menu    →  Menu utama
browse  →  Lihat produk
help    →  Panduan ini

━━━ 🛒 *BELANJA* ━━━
cart       →  Lihat keranjang
checkout   →  Bayar sekarang
clear      →  Kosongkan cart
promo CODE →  Pakai kode

━━━ ⭐ *FAVORIT* ━━━
wishlist       →  Lihat favorit
simpan [nama]  →  Tambah favorit
hapus [nama]   →  Hapus favorit

━━━ 📦 *TRACKING* ━━━
track     →  Semua order
history   →  Riwayat lengkap

━━━━━━━━━━━━━━━━━━━━━
💡 Tips:
• Semua command case-free
• Ketik nama produk langsung
• Prefix / opsional

🏠 Ketik *menu* untuk kembali`;
  }

  /**
   * Product added - IMPROVED: More excitement, clearer CTA
   */
  static productAdded(productName, priceIDR) {
    return `✅ *DITAMBAHKAN!*

📦 ${productName}
💰 ${priceIDR.toLocaleString("id-ID")}

━━━━━━━━━━━━━━━━━━━━━

*Lanjut?*
🛍️ Tambah produk → Ketik nama
🛒 Checkout → *cart*
⭐ Favorit → *simpan ${productName}*

Stock di-hold sampai checkout ✨`;
  }

  /**
   * Browsing instructions - IMPROVED: Cleaner, action-focused
   */
  static browsingInstructions(productList) {
    let message = productList;
    message += "\n━━━━━━━━━━━━━━━━━━━━━\n\n";
    message += "*🎯 CARA ORDER:*\n";
    message += "Ketik nama produk langsung\n\n";
    message += "*Contoh:*\n";
    message += "• netflix\n";
    message += "• spotify premium\n\n";
    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += "🛒 cart • ⭐ wishlist • 🏠 menu";
    return message;
  }

  /**
   * Cart view - IMPROVED: Cleaner layout, visual total
   */
  static cartView(cart, total) {
    const totalIDR = total;
    let message = `╔═══════════════════╗
║  🛒 *KERANJANG*  ║
╚═══════════════════╝

`;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   💰 ${item.price.toLocaleString("id-ID")}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += `💵 *TOTAL*\n`;
    message += `   *Rp ${totalIDR.toLocaleString("id-ID")}*\n`;
    message += "━━━━━━━━━━━━━━━━━━━━━\n\n";
    message += "*Siap bayar?*\n";
    message += "💳 checkout → Lanjut\n";
    message += "🎟️ promo → Pakai kode\n";
    message += "🗑️ clear → Kosongkan\n\n";
    message += "💡 Punya promo? Pakai dulu!";

    return message;
  }

  /**
   * Order summary - IMPROVED: Receipt style
   */
  static orderSummary(
    orderId,
    cart,
    totalIDR,
    promoCode = null,
    discountAmount = 0
  ) {
    let message = `╔═══════════════════════╗
║  ✅ *ORDER SUKSES*   ║
╚═══════════════════════╝

📋 ID: ${orderId}

┌─── 📦 ITEMS ───┐
`;

    cart.forEach((item, index) => {
      const priceIDR = item.price;
      message += `${index + 1}. ${item.name}\n`;
      message += `   ${priceIDR.toLocaleString("id-ID")}\n`;
    });

    message += `└────────────────┘\n\n`;

    if (promoCode && discountAmount > 0) {
      const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
      message += `Subtotal    ${subtotal.toLocaleString("id-ID")}\n`;
      message += `Promo ${promoCode}  -${discountAmount.toLocaleString(
        "id-ID"
      )}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    }

    message += `💰 *TOTAL: ${totalIDR.toLocaleString("id-ID")}*\n`;

    return message;
  }

  /**
   * About - IMPROVED: Feature highlights, scannable
   */
  static about() {
    const shopName = config.shop.name;
    return `╔═══════════════════════╗
║  ℹ️ *TENTANG KAMI*   ║
╚═══════════════════════╝

Halo dari ${shopName}! 🎉

━━━ 🎯 *PRODUK* ━━━
📺 Streaming premium
💳 Virtual credit card
🎮 Gaming accounts

━━━ ⚡ *KEUNGGULAN* ━━━
✅ Stock realtime
✅ Auto delivery 5-15 min
✅ 6 payment methods
✅ Promo & discount
✅ 100% original

━━━ 💳 *PEMBAYARAN* ━━━
• QRIS (all e-wallet)
• DANA, OVO, GoPay
• Transfer bank

━━━━━━━━━━━━━━━━━━━━━
💡 Mulai dari Rp 15.800!

🏠 Ketik *menu* untuk belanja`;
  }

  /**
   * Contact - IMPROVED: Concise, action-focused
   */
  static contact() {
    const supportWhatsapp = config.shop.supportWhatsapp;
    const workingHours = config.shop.workingHours;
    return `╔═══════════════════════╗
║  📞 *HUBUNGI KAMI*   ║
╚═══════════════════════╝

Butuh bantuan? Kami siap! 💬

⏰ ${workingHours}
📱 ${supportWhatsapp}

━━━━━━━━━━━━━━━━━━━━━
💡 Respons < 5 menit!

🏠 Ketik *menu* untuk kembali`;
  }

  /**
   * Error messages - IMPROVED: Helpful, not intimidating
   */
  static invalidOption() {
    return `🤔 *Hmm, tidak paham...*

Coba command ini:

🏠 *menu* → Menu utama
🛍️ *browse* → Lihat produk
🛒 *cart* → Keranjang
⭐ *wishlist* → Favorit
📦 *track* → Lacak order
💬 *help* → Panduan lengkap

━━━━━━━━━━━━━━━━━━━━━
💡 Atau ketik nama produk
langsung saat browsing!`;
  }

  static productNotFound(input = "") {
    const searchText = input ? `"${input}"` : "";
    return `🔍 *Produk ${searchText} tidak ada*

━━━━━━━━━━━━━━━━━━━━━

*Coba ini:*
1️⃣ Cek typo (kami sudah coba
   auto-correct dengan fuzzy)
2️⃣ Ketik *browse* untuk
   lihat semua produk
3️⃣ Contoh: netflix, spotify

━━━━━━━━━━━━━━━━━━━━━
🏠 *menu* • 💬 *help*`;
  }

  static emptyCart() {
    return `🛒 *Keranjang kosong*

Yuk mulai belanja! 🛍️

🎯 *browse* → Lihat produk
⭐ *wishlist* → Cek favorit
🏠 *menu* → Menu utama

━━━━━━━━━━━━━━━━━━━━━
💡 Auto-delivery & original!`;
  }

  /**
   * Wishlist view - IMPROVED: Compact, actionable
   */
  static wishlistView(wishlist) {
    if (!wishlist || wishlist.length === 0) {
      return `╔═══════════════════════╗
║  ⭐ *WISHLIST*      ║
╚═══════════════════════╝

Belum ada favorit

━━━━━━━━━━━━━━━━━━━━━

*Cara tambah:*
⭐ simpan [nama]

*Contoh:*
• simpan netflix
• simpan spotify

━━━━━━━━━━━━━━━━━━━━━
🛍️ *browse* untuk lihat produk`;
    }

    let message = `╔═══════════════════════╗
║  ⭐ *WISHLIST*      ║
╚═══════════════════════╝

`;

    wishlist.forEach((item, index) => {
      const priceIDR = item.price * config.exchangeRate;
      message += `${index + 1}. ${item.name}\n`;
      message += `   💰 ${priceIDR.toLocaleString("id-ID")}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += `📊 ${wishlist.length} produk favorit\n\n`;
    message += "*Actions:*\n";
    message += "• Ketik nama → Add to cart\n";
    message += "• hapus [nama] → Remove\n\n";
    message += "🛒 cart • 🏠 menu";

    return message;
  }

  /**
   * Order list - IMPROVED: Compact timeline style
   */
  static orderList(orders) {
    if (!orders || orders.length === 0) {
      return `╔═══════════════════════╗
║  📦 *RIWAYAT*       ║
╚═══════════════════════╝

Belum ada pesanan

━━━━━━━━━━━━━━━━━━━━━
🛍️ *menu* untuk belanja`;
    }

    let message = `╔═══════════════════════╗
║  📦 *RIWAYAT*       ║
╚═══════════════════════╝

`;

    orders.forEach((order) => {
      const statusEmoji = order.status.includes("pending") ? "⏳" : "✅";
      message += `${statusEmoji} ${order.status}\n`;
      message += `   ${order.orderId}\n`;
      message += `   ${order.date}\n`;
      message += `   💰 ${order.totalIDR.toLocaleString("id-ID")}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += `📊 ${orders.length} total orders\n\n`;
    message += "*Filter:*\n";
    message += "track pending • track completed\n\n";
    message += "🏠 menu";

    return message;
  }
}

module.exports = UIMessagesImproved;
