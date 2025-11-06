# Architecture Overview

## System Architecture

This is a WhatsApp chatbot built on `whatsapp-web.js` with a stateful session manager pattern. The architecture follows **modular design principles** with clear separation of concerns - optimized for maintainability, testability, and scalability while still being VPS-friendly (1 vCPU, 2GB RAM).

## Project Structure

```
chatbot/
├── src/                  # NEW: Modular source code
│   ├── core/            # Framework & infrastructure
│   │   ├── WhatsAppClient.js      # WhatsApp initialization
│   │   ├── EventHandler.js        # Event management
│   │   ├── MessageDispatcher.js   # Message dispatch
│   │   ├── MessageRouter.js       # Routing logic
│   │   └── DependencyContainer.js # DI container
│   ├── handlers/        # Business logic per domain
│   │   ├── BaseHandler.js         # Abstract base class
│   │   ├── CustomerHandler.js     # Customer commands (~300 lines)
│   │   ├── AdminHandler.js        # Admin commands (~400 lines)
│   │   ├── ProductHandler.js      # Product management (~250 lines)
│   │   └── AIFallbackHandler.js   # AI fallback for unknown commands
│   ├── services/        # Domain services
│   │   ├── session/     # Session & cart services
│   │   ├── payment/     # Payment service abstractions
│   │   ├── product/     # Product service operations
│   │   └── ai/          # AI services (Gemini integration)
│   ├── models/          # Data models (Session, Product, Order)
│   ├── middleware/      # Cross-cutting concerns (rate limiting, validation)
│   ├── utils/           # Utilities (formatters, fuzzy search, constants)
│   └── config/          # Configuration split (app, products, payment)
├── index.js             # Bootstrap only (~80 lines)
├── lib/                 # Legacy: Core modules (being phased out)
├── services/            # Legacy: External integrations (being phased out)
├── tests/               # Test suites (unit + integration)
├── docs/                # Documentation
└── archive/             # Old/backup files
```

**TOTAL: Changed from 4 large files (2,668 lines) to 16+ modular files (~150 lines each)**

## Core Architectural Principles

1. **Single Responsibility** - Each module has ONE clear purpose
2. **Dependency Injection** - Services injected, not hardcoded
3. **Separation of Concerns** - Business logic separated from infrastructure
4. **Testability** - Each module can be unit tested independently
5. **SOLID Principles** - Applied throughout the codebase

## Core Layer (`src/core/`)

- `WhatsAppClient.js` - WhatsApp client lifecycle management
- `EventHandler.js` - Event listener registration and handling
- `MessageDispatcher.js` - Message receiving, filtering, and dispatch
- `MessageRouter.js` - Routes messages to appropriate handlers based on command/step
- `DependencyContainer.js` - Manages service dependencies and lifecycle

## Handler Layer (`src/handlers/`)

- `CustomerHandler.js` - Menu, browsing, cart, checkout, order history (~570 lines)
- `AdminHandler.js` - Admin commands (approve, broadcast, stats, stock, settings) (~686 lines)
- `AdminInventoryHandler.js` - Inventory management (addstock, stockreport, salesreport) (~230 lines)
- `AdminReviewHandler.js` - Review moderation and management (~187 lines)
- `AdminAnalyticsHandler.js` - Enhanced dashboard and analytics (~150 lines)
- `ProductHandler.js` - Product management (add, edit, remove, fuzzy search)
- `CustomerWishlistHandler.js` - Wishlist features (save, view, remove) (~120 lines)
- `CustomerCheckoutHandler.js` - Checkout flow with promo codes (~280 lines)
- `AIFallbackHandler.js` - AI-powered fallback for unrecognized messages (~174 lines)
- `BaseHandler.js` - Abstract base class with common handler functionality

**CRITICAL:** All files in `src/` must be < 700 lines (GitHub Actions requirement)

## Service Layer (`src/services/`)

- `session/SessionService.js` - Session CRUD operations
- `session/CartService.js` - Shopping cart business logic
- `session/RedisStorage.js` - Redis persistence implementation
- `session/MemoryStorage.js` - In-memory fallback storage
- `payment/PaymentService.js` - Payment abstraction
- `payment/PaymentReminderService.js` - Automated payment reminders (cron-based)
- `product/ProductService.js` - Product operations
- `inventory/RedisStockManager.js` - Redis-backed stock tracking and validation
- `order/OrderService.js` - Order tracking and history
- `wishlist/WishlistService.js` - Wishlist/favorites management
- `review/ReviewService.js` - Product reviews and ratings
- `promo/PromoService.js` - Promo code management and validation
- `analytics/DashboardService.js` - Admin dashboard analytics and reporting
- `ai/AIService.js` - Gemini 2.5 Flash integration
- `ai/AIIntentClassifier.js` - Classifies user intent (8 types)
- `ai/AIPromptBuilder.js` - Context-aware prompt building
- `ai/RelevanceFilter.js` - Spam detection and message relevance

## Configuration (`src/config/`)

- `app.config.js` - System settings (currency, session, rate limits, features)
- `products.config.js` - Product catalog (premium accounts, virtual cards)
- `payment.config.js` - Payment accounts (e-wallet, bank transfer)
- `ai.config.js` - AI settings (model, prompts, rate limits)

## Key Architectural Insight

Each customer's journey is tracked via a "step" (menu/browsing/checkout) that determines how their next message is interpreted. The modular architecture allows handlers to be independently tested and modified without affecting other parts of the system. The `DependencyContainer` manages service lifecycle and provides clean dependency injection.

## Handler Delegation Pattern (CRITICAL)

AdminHandler uses **delegation to sub-handlers** to maintain <700 line limit:

```javascript
// AdminHandler.js delegates to specialized handlers
class AdminHandler extends BaseHandler {
  constructor(sessionManager, xenditService, logger) {
    super(sessionManager, logger);
    // Delegate to sub-handlers for domain separation
    this.inventoryHandler = new AdminInventoryHandler(sessionManager, logger);
    this.reviewHandler = new AdminReviewHandler(reviewService, logger);
    this.analyticsHandler = new AdminAnalyticsHandler(dashboardService, logger);
    this.orderHandler = new AdminOrderHandler(
      sessionManager,
      xenditService,
      logger
    );
    this.promoHandler = new AdminPromoHandler(
      sessionManager,
      promoService,
      logger
    );

    // Command routing map for O(1) lookup
    this.commandRoutes = this._initializeCommandRoutes();
  }

  handle(adminId, message) {
    const route = this.commandRoutes.get(command);
    if (route) {
      // Delegate to appropriate sub-handler
      return route.handler[route.method](adminId, message);
    }
  }
}
```

**When adding admin features:**

1. Check AdminHandler.js size FIRST
2. If >650 lines, create new `Admin*Handler.js`
3. Delegate in `_initializeCommandRoutes()`
4. Follow pattern: `this.reviewHandler.handleViewReviews()`
