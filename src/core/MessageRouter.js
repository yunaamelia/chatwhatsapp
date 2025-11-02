/**
 * Message Router
 * Routes messages to appropriate handlers based on command and session state
 */

const {
  SessionSteps,
  AdminCommands,
  GlobalCommands,
} = require("../utils/Constants");

class MessageRouter {
  constructor(handlers) {
    this.handlers = {
      customer: handlers.customerHandler,
      admin: handlers.adminHandler,
      payment: handlers.paymentHandlers,
    };
  }

  /**
   * Route message to appropriate handler
   * @param {string} customerId - Customer WhatsApp ID
   * @param {string} message - Message text (normalized)
   * @param {string} step - Current session step
   * @returns {Promise<string|Object>} Response message
   */
  async route(customerId, message, step) {
    // Admin commands (start with /)
    if (message.startsWith("/")) {
      return await this.handlers.admin.handle(customerId, message);
    }

    // Global customer commands (accessible from any step)
    if (this.isGlobalCommand(message)) {
      return await this.handlers.customer.handle(customerId, message, step);
    }

    // Payment-related steps
    if (step === SessionSteps.SELECT_PAYMENT) {
      return await this.handlers.payment.handlePaymentSelection(
        customerId,
        message
      );
    }

    if (step === SessionSteps.SELECT_BANK) {
      return await this.handlers.payment.handleBankChoice(customerId, message);
    }

    // Customer flow based on step
    return await this.handlers.customer.handle(customerId, message, step);
  }

  /**
   * Check if message is a global command
   * @param {string} message
   * @returns {boolean}
   */
  isGlobalCommand(message) {
    const globalCommands = [
      GlobalCommands.MENU,
      GlobalCommands.HELP,
      GlobalCommands.CART,
      GlobalCommands.HISTORY,
      "history",
      "/history",
    ];

    return globalCommands.includes(message);
  }

  /**
   * Check if message is an admin command
   * @param {string} message
   * @returns {boolean}
   */
  isAdminCommand(message) {
    return message.startsWith("/");
  }

  /**
   * Get handler for specific step
   * @param {string} step
   * @returns {Object} Handler instance
   */
  getHandlerForStep(step) {
    switch (step) {
      case SessionSteps.SELECT_PAYMENT:
      case SessionSteps.SELECT_BANK:
        return this.handlers.payment;
      default:
        return this.handlers.customer;
    }
  }
}

module.exports = MessageRouter;
