# Design Patterns & Best Practices

## Message Processing Flow

Messages follow a modular pipeline using the new architecture:

**Pipeline:** `MessageDispatcher` → `MessageRouter` → `Handler` → Response

1. **Dispatcher** (`src/core/MessageDispatcher.js`) - Receives WhatsApp message, filters groups/status
2. **Router** (`src/core/MessageRouter.js` or `lib/messageRouter.js`) - Analyzes command type and session step
3. **Handler** (`src/handlers/*`) - Processes business logic (Customer/Admin/Product handler)
4. **Response** - Handler returns formatted message string

### Flow Details

1. Normalize input (lowercase, trim) in Dispatcher
2. Check for global commands (`menu`, `cart`) in Router - always accessible
3. Check for admin commands (prefix `/`) in Router - delegate to AdminHandler
4. Route to step-specific handler method based on current session step
5. Handler updates session state via SessionService
6. Handler returns response string to Dispatcher
7. Dispatcher sends reply via WhatsApp client

### Example: Product Selection

When customer types "netflix" during browsing step:

- `MessageDispatcher` receives message, validates not from group
- `MessageRouter` sees step='browsing', routes to `CustomerHandler.handleProductSelection()`
- `CustomerHandler` uses `FuzzySearch` utility (in `src/utils/`) to find product
- Handler calls `CartService.add()` to add product to cart
- Handler returns confirmation message
- Dispatcher sends reply to customer

### Key Advantages

- Each component has single responsibility
- Easy to test each step independently
- Easy to add middleware (logging, rate limiting, validation)
- Clear error handling boundaries
- Services are reusable across handlers

## Session State Machine

Three states in `sessionManager.js`:

- `menu` - Initial state, customer selects action (browse/cart/about/support)
- `browsing` - Customer can type product names to add to cart
- `checkout` - Customer reviews cart, can checkout or clear

**Critical:** Always call `sessionManager.setStep()` when transitioning states. The step determines which handler processes the next message.

## Product Configuration

Products in `config.js` have structure: `{ id, name, price, description, stock, category }`.

- Use `getProductById(id)` for exact matches
- `getAllProducts()` merges premium accounts + virtual cards with category labels
- Stock controlled by `DEFAULT_STOCK` and `VCC_STOCK` env vars

**Customization:** To add products, extend `products.premiumAccounts` or `products.virtualCards` arrays. Product ID must be unique and URL-safe (used for matching).

## Error Handling Pattern

All errors in `index.js` message handler:

1. Log to console with emoji prefix (❌)
2. Reply to customer with friendly message + support instructions
3. Never expose technical details to customers

## VPS Optimization

Puppeteer config in `index.js` disables GPU, 2D canvas, uses single-process mode for minimal memory footprint:

```javascript
args: [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--single-process",
  "--disable-gpu",
];
```

**Do not remove these flags** - they're essential for 2GB RAM constraint.

## AI/Gemini Integration Pattern

Uses Vercel AI SDK with Gemini 2.5 Flash for intelligent features:

### AIService Pattern

- Rate limiting: 5 calls/hour per customer via Redis
- Cost tracking: ~$0.00005 per call (97% cheaper than GPT-4o)
- Fallback-first: Gracefully degrades if API unavailable
- Streaming support for long responses

### AI Fallback Handler

New feature (Nov 6, 2025): Intelligently responds to unrecognized messages

**Flow:**

1. `RelevanceFilter` - Checks if message is shop-related (spam detection)
2. `AIIntentClassifier` - Classifies intent (product_qa, comparison, pricing, etc.)
3. `AIPromptBuilder` - Builds context-aware prompt
4. `AIService` - Calls Gemini API
5. Format response with commands and emoji

**Integration Points:**

```javascript
// CustomerHandler - typo correction fallback
if (!product) {
  const aiSuggestion = await this.aiService.correctTypo(message, products);
  if (aiSuggestion) return aiSuggestion;
}

// AdminHandler - AI-generated descriptions
handleGenerateDescription(adminId, productName) {
  const description = await this.aiHandler.generateProductDescription(productName);
  return description;
}

// MessageRouter - AI fallback for unrecognized commands
if (response.includes('tidak valid')) {
  const aiResponse = await this.aiFallbackHandler.handle(customerId, message);
  if (aiResponse) return aiResponse;
}
```

### Configuration

`src/config/ai.config.js`:

- Enable/disable AI features globally
- Adjust rate limits, costs, model settings
- Feature toggles for typo correction, Q&A, recommendations, fallback

### Testing

Mock AIService in tests to avoid API costs during CI/CD

## Rate Limiting Pattern

Implemented in `sessionManager.js`:

```javascript
// Track messages per customer
this.messageCount = new Map(); // customerId -> {count, resetTime}

canSendMessage(customerId) {
  const limit = 20; // messages per minute
  const now = Date.now();
  const data = this.messageCount.get(customerId) || {count: 0, resetTime: now + 60000};

  if (now > data.resetTime) {
    data.count = 0;
    data.resetTime = now + 60000;
  }

  if (data.count >= limit) return false;
  data.count++;
  this.messageCount.set(customerId, data);
  return true;
}
```

In `index.js`, check before replying: `if (!sessionManager.canSendMessage(customerId)) return;`

## Admin Command Pattern

Admin commands in `chatbotLogic.js`:

- `/stats` - Show active sessions count, total orders today
- `/broadcast <message>` - Send to all active customers
- `/stock <productId> <quantity>` - Update product stock
- `/approve <orderId>` - Manually approve payment
- `/ban <number>` - Block customer

Implement in `processMessage()` before normal flow:

```javascript
if (message.startsWith("/") && isAdmin(customerId)) {
  return this.handleAdminCommand(customerId, message);
}
```

Admin number whitelist in `config.js`:

```javascript
const ADMIN_NUMBERS = [process.env.ADMIN_NUMBER_1, process.env.ADMIN_NUMBER_2];

function isAdmin(customerId) {
  return ADMIN_NUMBERS.includes(customerId);
}
```
