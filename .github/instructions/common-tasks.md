# Common Tasks & Modifications

## Adding a New Command

### NEW APPROACH (Modular)

1. **For global commands** - Add to `MessageRouter.route()` routing logic
2. **For customer commands** - Add method to `CustomerHandler` class
3. **For admin commands** - Add method to `AdminHandler` class
4. **For product commands** - Add method to `ProductHandler` class
5. **Register in DI container** if new service is needed

### Example - Add New Customer Command

```javascript
// In src/handlers/CustomerHandler.js
async handleTrackOrder(customerId, orderId) {
  const order = await this.orderService.findById(orderId);
  return UIMessages.orderTracking(order);
}

// In lib/messageRouter.js (or src/core/MessageRouter.js)
if (message === 'track' || message === '/track') {
  return this.handlers.customer.handleTrackOrder(customerId, message);
}
```

### OLD APPROACH (Legacy - being phased out)

1. Add global command check in `processMessage()` (like `menu` and `cart`)
2. Or add to step-specific handler if only available in certain states

## Changing Product Prices

Edit `config.js` price field. All prices currently $1 for simplicity.

```javascript
// config.js
products: {
  premiumAccounts: [
    {
      id: "netflix",
      name: "Netflix Premium",
      price: 2.0, // Change here
      description: "...",
    },
  ];
}
```

## Modifying Messages

All customer-facing text is in:

- `lib/uiMessages.js` - UI templates
- `lib/paymentMessages.js` - Payment-related messages
- Handler methods - Specific responses

Use emoji heavily (matches existing style) and keep messages concise for mobile readability.

## Modifying Session Timeout

Modify `cleanupSessions()` interval (default: 10 min) or inactivity threshold (default: 30 min):

```javascript
// index.js
setInterval(() => {
  sessionManager.cleanupSessions();
}, 10 * 60 * 1000); // 10 minutes

// sessionManager.js
cleanupSessions() {
  const inactivityThreshold = 30 * 60 * 1000; // 30 minutes
  // ...
}
```

## Adding Stock Management

To add stock enforcement:

1. In `handleCheckout()`, check `product.stock > 0` before allowing purchase
2. Decrement in `config.js`: `product.stock--` after successful payment
3. Use Redis for stock persistence: `await redis.decr(`stock:${productId}`)`
4. Add stock notifications: alert admin when `stock < 3`

## Automating Product Delivery

On payment confirmation, call `deliverProduct(customerId, productId)`:

```javascript
async function deliverProduct(customerId, productId) {
  // For accounts: read credentials from products_data/${productId}.txt
  const credentials = fs
    .readFileSync(`products_data/${productId}.txt`, "utf-8")
    .split("\n")
    .filter((line) => line.trim())[0]; // Get first available

  // Send to customer
  await client.sendMessage(
    customerId,
    `🎁 *Produk Anda Siap!*\n\n${credentials}\n\nTerima kasih!`
  );

  // Mark as used/sold
  // ...
}
```

For VCC: integrate with card issuer API or send pre-generated card details.

Log delivery: append to `deliveries.log` for accounting.

## Adding Admin Commands

Add to `AdminHandler.js`:

```javascript
// In src/handlers/AdminHandler.js
async handleCustomCommand(adminId, args) {
  // Your logic here
  return `✅ Command executed successfully`;
}

// Register in commandRoutes
this.commandRoutes.set('/custom', {
  handler: this,
  method: 'handleCustomCommand',
  description: 'Custom admin command'
});
```

Common admin commands:

- `/stats` - Show active sessions count, total orders today
- `/broadcast <message>` - Send to all active customers
- `/stock <productId> <quantity>` - Update product stock
- `/approve <orderId>` - Manually approve payment
- `/ban <number>` - Block customer

## Adding Promo Codes

Use existing `PromoService`:

```javascript
// Create promo
await promoService.createPromo({
  code: "WELCOME10",
  discount: 10, // percentage
  expiresAt: new Date("2025-12-31"),
  maxUses: 100,
});

// Apply in checkout
const discount = await promoService.applyPromo(customerId, "WELCOME10", total);
```

## Adding Product Reviews

Use existing `ReviewService`:

```javascript
// Customer adds review
await reviewService.addReview({
  customerId,
  productId: "netflix",
  rating: 5,
  text: "Mantap! Akun work 100%",
});

// Get average rating
const { average, count } = await reviewService.getAverageRating("netflix");
```

## Adding Wishlist Features

Use existing `WishlistService`:

```javascript
// Add to wishlist
await wishlistService.add(customerId, productId);

// View wishlist
const items = await wishlistService.getAll(customerId);

// Remove from wishlist
await wishlistService.remove(customerId, productId);
```

## Adding Analytics

Use existing `DashboardService`:

```javascript
// Get dashboard stats
const stats = await dashboardService.getDashboard(days);

// Returns: revenue, orders, top products, retention, etc.
```

## Customizing AI Behavior

Edit `src/config/ai.config.js`:

```javascript
// Enable/disable features
features: {
  enabled: true,
  typoCorrection: true,
  productQA: true,
  fallbackHandler: true,  // AI for unrecognized messages
}

// Adjust rate limits
rateLimit: {
  maxCallsPerHour: 5,  // Per customer
}

// Modify prompts
prompts: {
  customer: {
    system: `Your custom system prompt here...`
  }
}
```

## Adding New Products

Add to `config.js`:

```javascript
products: {
  premiumAccounts: [
    // ... existing products
    {
      id: "canva-pro", // Must be unique & URL-safe
      name: "Canva Pro",
      price: 1.0,
      description: "Design tool premium",
      stock: 999,
      category: "premium",
    },
  ];
}
```

Product ID must be unique and URL-safe (used for matching).
