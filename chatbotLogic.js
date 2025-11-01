/**
 * Chatbot Logic
 * Handles message processing and response generation
 */

const { formatProductList, getProductById, getAllProducts } = require('./config');

class ChatbotLogic {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  /**
   * Process incoming message and generate response
   * @param {string} customerId 
   * @param {string} message 
   * @returns {string} Response message
   */
  processMessage(customerId, message) {
    const step = this.sessionManager.getStep(customerId);
    const normalizedMessage = message.toLowerCase().trim();

    // Handle main menu commands from any step
    if (normalizedMessage === 'menu' || normalizedMessage === 'help') {
      this.sessionManager.setStep(customerId, 'menu');
      return this.getMainMenu();
    }

    if (normalizedMessage === 'cart') {
      return this.showCart(customerId);
    }

    // Process based on current step
    switch (step) {
      case 'menu':
        return this.handleMenuSelection(customerId, normalizedMessage);
      
      case 'browsing':
        return this.handleProductSelection(customerId, normalizedMessage);
      
      case 'checkout':
        return this.handleCheckout(customerId, normalizedMessage);
      
      default:
        return this.getMainMenu();
    }
  }

  /**
   * Get main menu message
   * @returns {string}
   */
  getMainMenu() {
    return `👋 *Welcome to Premium Shop!*

I'm your shopping assistant, ready to help you! 🛒

*What would you like to do?*

1️⃣ Browse Products
2️⃣ View Cart
3️⃣ About Us
4️⃣ Contact Support

Type the number or keyword to continue.

💡 *Quick Commands:*
• Type *menu* - Return to main menu
• Type *cart* - View your cart
• Type *help* - Show this menu`;
  }

  /**
   * Handle main menu selection
   * @param {string} customerId 
   * @param {string} message 
   * @returns {string}
   */
  handleMenuSelection(customerId, message) {
    if (message === '1' || message === 'browse' || message === 'products') {
      this.sessionManager.setStep(customerId, 'browsing');
      return this.showProducts(customerId);
    }

    if (message === '2' || message === 'cart') {
      return this.showCart(customerId);
    }

    if (message === '3' || message === 'about') {
      return this.getAboutInfo();
    }

    if (message === '4' || message === 'support' || message === 'contact') {
      return this.getContactInfo();
    }

    return `❌ Invalid option. Please type a number (1-4) or keyword.\n\n${this.getMainMenu()}`;
  }

  /**
   * Show available products
   * @param {string} customerId 
   * @returns {string}
   */
  showProducts(customerId) {
    const productList = formatProductList();
    const allProducts = getAllProducts();
    
    let message = productList;
    message += '\n━━━━━━━━━━━━━━━━━━\n\n';
    message += '*How to order:*\n';
    message += 'Type product name or ID to add to cart\n';
    message += 'Example: "netflix" or "spotify"\n\n';
    message += '📦 Type *cart* to view your cart\n';
    message += '🏠 Type *menu* to return to main menu';
    
    return message;
  }

  /**
   * Handle product selection
   * @param {string} customerId 
   * @param {string} message 
   * @returns {string}
   */
  handleProductSelection(customerId, message) {
    const allProducts = getAllProducts();
    
    // Try to find product by ID
    let product = getProductById(message);
    
    // If not found by ID, try to find by name (partial match)
    if (!product) {
      product = allProducts.find(p => 
        p.name.toLowerCase().includes(message) || 
        p.id.toLowerCase().includes(message)
      );
    }

    if (product) {
      this.sessionManager.addToCart(customerId, product);
      return `✅ *Added to cart!*

📦 ${product.name}
💰 $${product.price}

*What's next?*
• Add more products (type product name)
• Type *cart* to view cart and checkout
• Type *menu* for main menu`;
    }

    return `❌ Product not found. Please check the product list and try again.\n\nType *menu* to see all products.`;
  }

  /**
   * Show cart contents
   * @param {string} customerId 
   * @returns {string}
   */
  showCart(customerId) {
    const cart = this.sessionManager.getCart(customerId);
    
    if (cart.length === 0) {
      return `🛒 *Your cart is empty*

Browse our products and add items to your cart!

Type *menu* to see main menu`;
    }

    let message = '🛒 *YOUR CART*\n\n';
    let total = 0;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   💰 $${item.price}\n\n`;
      total += item.price;
    });
    
    message += '━━━━━━━━━━━━━━━━━━\n';
    message += `💵 *Total: $${total}*\n\n`;
    message += '*Ready to checkout?*\n';
    message += '• Type *checkout* to complete order\n';
    message += '• Type *clear* to empty cart\n';
    message += '• Type *menu* for main menu';
    
    this.sessionManager.setStep(customerId, 'checkout');
    
    return message;
  }

  /**
   * Handle checkout process
   * @param {string} customerId 
   * @param {string} message 
   * @returns {string}
   */
  handleCheckout(customerId, message) {
    if (message === 'checkout' || message === 'buy' || message === 'order') {
      const cart = this.sessionManager.getCart(customerId);
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      
      let orderMessage = '✅ *ORDER CONFIRMED!*\n\n';
      orderMessage += '📋 *Order Summary:*\n';
      
      cart.forEach((item, index) => {
        orderMessage += `${index + 1}. ${item.name} - $${item.price}\n`;
      });
      
      orderMessage += `\n💵 *Total: $${total}*\n\n`;
      orderMessage += '━━━━━━━━━━━━━━━━━━\n\n';
      orderMessage += '💳 *Payment Instructions:*\n\n';
      orderMessage += '1️⃣ Send payment to our account\n';
      orderMessage += '2️⃣ Send payment proof screenshot\n';
      orderMessage += '3️⃣ Wait for admin confirmation\n';
      orderMessage += '4️⃣ Receive your products!\n\n';
      orderMessage += '⏱️ Processing time: 5-15 minutes\n\n';
      orderMessage += '📞 Need help? Type *support*\n\n';
      orderMessage += 'Thank you for shopping with us! 🎉';
      
      // Clear cart after order
      this.sessionManager.clearCart(customerId);
      this.sessionManager.setStep(customerId, 'menu');
      
      return orderMessage;
    }

    if (message === 'clear') {
      this.sessionManager.clearCart(customerId);
      this.sessionManager.setStep(customerId, 'menu');
      return '🗑️ Cart cleared!\n\nType *menu* to continue shopping.';
    }

    return `Please type *checkout* to complete your order or *clear* to empty cart.\n\nType *menu* for main menu.`;
  }

  /**
   * Get about information
   * @returns {string}
   */
  getAboutInfo() {
    return `ℹ️ *ABOUT US*

Welcome to Premium Shop! 🎉

We specialize in:
📺 Premium streaming accounts
💳 Virtual credit cards
⚡ Fast delivery (5-15 minutes)
💯 Quality guaranteed
💰 Affordable prices ($1 per item)

We're committed to providing the best service to our customers!

Type *menu* to return to main menu`;
  }

  /**
   * Get contact information
   * @returns {string}
   */
  getContactInfo() {
    return `📞 *CONTACT SUPPORT*

Need help? We're here for you! 💬

⏰ Working Hours: 24/7
📱 WhatsApp: This number
📧 Email: support@premiumshop.com

Our team responds within minutes!

Type *menu* to return to main menu`;
  }
}

module.exports = ChatbotLogic;
