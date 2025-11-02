/**
 * Customer Checkout Handler
 * Handles checkout process, promo codes, and payment flow for customers
 * Extracted from CustomerHandler for better code organization
 */

const BaseHandler = require("./BaseHandler");
const UIMessages = require("../../lib/uiMessages");
const { SessionSteps } = require("../utils/Constants");
const PromoService = require("../services/promo/PromoService");

class CustomerCheckoutHandler extends BaseHandler {
  constructor(sessionManager, promoService, logger) {
    super(sessionManager, logger);
    this.promoService = promoService || new PromoService();
  }

  /**
   * Handle checkout process
   * Commands: checkout, buy, order, clear, promo CODE
   */
  async handleCheckout(customerId, message) {
    if (message === "checkout" || message === "buy" || message === "order") {
      return await this.processCheckout(customerId);
    }

    if (message === "clear") {
      await this.sessionManager.clearCart(customerId);
      await this.sessionManager.set(customerId, "promoCode", null);
      await this.sessionManager.set(customerId, "discountPercent", 0);
      await this.setStep(customerId, SessionSteps.MENU);

      this.log(customerId, "cart_cleared");

      return {
        message: UIMessages.cartCleared(),
        qrisData: null,
      };
    }

    // Handle promo code: "promo CODE"
    if (message && message.toLowerCase().startsWith("promo ")) {
      const promoCode = message.substring(6).trim();
      return await this.handleApplyPromo(customerId, promoCode);
    }

    return {
      message: UIMessages.checkoutPrompt(),
      qrisData: null,
    };
  }

  /**
   * Apply promo code
   */
  async handleApplyPromo(customerId, promoCode) {
    const validation = this.promoService.validatePromo(promoCode, customerId);

    if (!validation.valid) {
      return {
        message: validation.message,
        qrisData: null,
      };
    }

    // Store promo code in session (don't apply yet, apply at final payment)
    await this.sessionManager.set(
      customerId,
      "promoCode",
      promoCode.toUpperCase()
    );
    await this.sessionManager.set(
      customerId,
      "discountPercent",
      validation.discountPercent
    );

    const cart = await this.sessionManager.getCart(customerId);
    const totalIDR = cart.reduce((sum, item) => sum + item.price, 0);
    const discount = this.promoService.calculateDiscount(
      totalIDR,
      validation.discountPercent
    );

    let response = `✅ *Kode Promo Diterapkan!*\n\n`;
    response += `🎟️ Kode: ${promoCode.toUpperCase()}\n`;
    response += `💰 Diskon: ${validation.discountPercent}%\n\n`;
    response += `━━━━━━━━━━━━━━━━━━\n`;
    response += `💵 Subtotal: Rp ${discount.originalAmount.toLocaleString(
      "id-ID"
    )}\n`;
    response += `🎁 Diskon: -Rp ${discount.discountAmount.toLocaleString(
      "id-ID"
    )}\n`;
    response += `💳 *Total: Rp ${discount.finalAmount.toLocaleString(
      "id-ID"
    )}*\n\n`;
    response += `Ketik *checkout* untuk melanjutkan pembayaran.`;

    this.log(customerId, "promo_applied", {
      promoCode: promoCode.toUpperCase(),
      discountPercent: validation.discountPercent,
      originalAmount: discount.originalAmount,
      finalAmount: discount.finalAmount,
    });

    return {
      message: response,
      qrisData: null,
    };
  }

  /**
   * Process checkout and show payment options
   */
  async processCheckout(customerId) {
    const cart = await this.sessionManager.getCart(customerId);

    if (cart.length === 0) {
      return {
        message: UIMessages.emptyCart(),
        qrisData: null,
      };
    }

    // Check stock availability
    const { isInStock } = require("../../config");
    const outOfStockItems = cart.filter((item) => !isInStock(item.id));

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map((item) => item.name).join(", ");

      this.log(customerId, "checkout_failed_out_of_stock", {
        items: outOfStockItems.map((i) => i.id),
      });

      return {
        message: `❌ *Stok Habis*\n\nMaaf, produk berikut tidak tersedia:\n${itemNames}\n\nSilakan hapus dari keranjang dengan ketik *clear* dan pilih produk lain.`,
        qrisData: null,
      };
    }

    const totalIDR = cart.reduce((sum, item) => sum + item.price, 0); // Price already in IDR
    const orderId = `ORD-${Date.now()}-${customerId.slice(-4)}`;

    // Apply promo code if exists
    const session = await this.sessionManager.getSession(customerId);
    let promoCode = session.promoCode;
    let discountPercent = session.discountPercent || 0;
    let discountAmount = 0;
    let finalAmount = totalIDR;

    if (promoCode && discountPercent > 0) {
      // Apply promo code (mark as used)
      const applyResult = this.promoService.applyPromo(promoCode, customerId);

      if (applyResult.success) {
        const discount = this.promoService.calculateDiscount(
          totalIDR,
          discountPercent
        );
        discountAmount = discount.discountAmount;
        finalAmount = discount.finalAmount;

        this.log(customerId, "promo_code_applied", {
          promoCode,
          discountPercent,
          originalAmount: totalIDR,
          discountAmount,
          finalAmount,
        });
      } else {
        // Promo validation failed at checkout, clear it
        promoCode = null;
        discountPercent = 0;
        await this.sessionManager.set(customerId, "promoCode", null);
        await this.sessionManager.set(customerId, "discountPercent", 0);
      }
    }

    await this.sessionManager.setOrderId(customerId, orderId);
    await this.setStep(customerId, SessionSteps.SELECT_PAYMENT);

    this.log(customerId, "checkout_initiated", {
      orderId,
      itemCount: cart.length,
      totalIDR: finalAmount,
      promoCode,
      discountAmount,
    });

    const PaymentMessages = require("../../lib/paymentMessages");

    const orderSummary = UIMessages.orderSummary(
      orderId,
      cart,
      finalAmount,
      promoCode,
      discountAmount
    );
    const paymentMenu = PaymentMessages.paymentMethodSelection(orderId);

    return {
      message: orderSummary + paymentMenu,
      qrisData: null,
    };
  }
}

module.exports = CustomerCheckoutHandler;
