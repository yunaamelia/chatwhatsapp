# WhatsApp Shopping Chatbot - Architecture Guide

**Last Updated:** November 6, 2025
**Purpose:** Complete codebase structure and design patterns

---


## Directory and File Structure

The project follows a modular architecture with clear separation of concerns:

```
chatbkt/
├── .env.example                      # Environment configuration template
├── .git/                             # Git version control
├── .github/                          # GitHub-specific configuration
│   ├── agents/                      # Custom AI agent configurations
│   ├── memory/                      # Project documentation and patterns
│   │   ├── PROJECT_DOCUMENTATION.md
│   │   ├── code-patterns.md
│   │   ├── current-state.md
│   │   ├── github-workflows-rules.md
│   │   └── test-status.md
│   └── workflows/                   # CI/CD automation
├── .gitignore                       # Git ignore patterns
├── .vscode/                         # VS Code workspace settings
├── README.md                        # Main project documentation
├── SECURITY.md                      # Security policy and guidelines
├── index.js                         # Application entry point (243 lines)
├── chatbotLogic.js                  # Main business logic orchestrator (136 lines)
├── sessionManager.js                # Session & cart management (525 lines)
├── config.js                        # Legacy configuration wrapper (278 lines)
│
├── src/                             # Modular source code (~8,886 lines)
│   ├── config/                     # Configuration modules
│   │   ├── app.config.js          # System settings & feature flags
│   │   ├── payment.config.js      # Payment account configurations
│   │   └── products.config.js     # Product catalog definitions
│   │
│   ├── core/                       # Core framework components
│   │   ├── WhatsAppClient.js      # WhatsApp client initialization
│   │   ├── EventHandler.js        # Event listener management
│   │   ├── MessageDispatcher.js   # Message receiving & filtering
│   │   ├── MessageRouter.js       # Routing logic & command mapping
│   │   └── DependencyContainer.js # Service dependency injection
│   │
│   ├── handlers/                   # Business logic handlers (< 700 lines each)
│   │   ├── BaseHandler.js         # Abstract base handler class
│   │   ├── CustomerHandler.js     # Customer commands (browse, cart, checkout)
│   │   ├── AdminHandler.js        # Admin command delegation (< 700 lines)
│   │   ├── AdminInventoryHandler.js    # Inventory management
│   │   ├── AdminAnalyticsHandler.js    # Analytics & dashboard
│   │   ├── AdminReviewHandler.js       # Review moderation
│   │   ├── ProductHandler.js           # Product management
│   │   ├── CustomerWishlistHandler.js  # Wishlist features
│   │   └── CustomerCheckoutHandler.js  # Checkout flow
│   │
│   ├── services/                   # Domain services (business logic)
│   │   ├── session/               # Session management
│   │   │   ├── SessionService.js  # CRUD operations
│   │   │   ├── CartService.js     # Shopping cart logic
│   │   │   ├── RedisStorage.js    # Redis persistence
│   │   │   └── MemoryStorage.js   # In-memory fallback
│   │   │
│   │   ├── payment/               # Payment processing
│   │   │   ├── PaymentService.js  # Payment abstraction
│   │   │   └── PaymentReminderService.js  # Automated reminders
│   │   │
│   │   ├── product/               # Product operations
│   │   │   └── ProductService.js  # Catalog management
│   │   │
│   │   ├── inventory/             # Stock management
│   │   │   ├── RedisStockManager.js       # Stock tracking
│   │   │   ├── InventoryService.js        # Inventory operations
│   │   │   └── RedisInventoryStorage.js   # Persistence
│   │   │
│   │   ├── order/                 # Order management
│   │   │   └── OrderService.js    # Order tracking & history
│   │   │
│   │   ├── wishlist/              # Wishlist management
│   │   │   └── WishlistService.js # Favorites operations
│   │   │
│   │   ├── review/                # Reviews & ratings
│   │   │   └── ReviewService.js   # Review CRUD & moderation
│   │   │
│   │   ├── promo/                 # Promotional codes
│   │   │   └── PromoService.js    # Promo validation & tracking
│   │   │
│   │   ├── analytics/             # Business intelligence
│   │   │   └── DashboardService.js # Metrics & reporting
│   │   │
│   │   ├── ai/                    # AI integration
│   │   │   └── AIService.js       # Gemini API wrapper
│   │   │
│   │   └── admin/                 # Admin utilities
│   │       └── AdminStatsService.js # Statistics aggregation
│   │
│   └── utils/                      # Utility functions
│       ├── Constants.js            # Global constants
│       ├── ErrorMessages.js        # Error message templates
│       ├── FuzzySearch.js          # Typo-tolerant search
│       ├── InputSanitizer.js       # Input sanitization
│       └── ValidationHelpers.js    # Validation utilities
│
├── lib/                            # Legacy core modules (being phased out)
│   ├── messageRouter.js           # Legacy router (to be removed)
│   ├── paymentHandlers.js         # Payment method handlers
│   ├── paymentMessages.js         # Payment UI templates
│   ├── inputValidator.js          # Rate limiting & validation
│   ├── uiMessages.js              # UI message templates
│   ├── redisClient.js             # Redis connection manager
│   ├── transactionLogger.js       # Audit logging
│   ├── logRotationManager.js      # Log file rotation
│   └── SecureLogger.js            # Secure logging utility
│
├── services/                       # External service integrations
│   ├── xenditService.js           # Xendit payment API
│   ├── qrisService.js             # Legacy QRIS service
│   ├── webhookServer.js           # Payment webhook server
│   └── productDelivery.js         # Automated delivery
│
├── tests/                          # Test suites (885 tests)
│   ├── unit/                      # Unit tests (isolated)
│   │   ├── core/                 # Core component tests
│   │   ├── handlers/             # Handler tests
│   │   ├── services/             # Service tests
│   │   ├── utils/                # Utility tests
│   │   └── lib/                  # Library tests
│   │
│   ├── integration/               # Integration tests
│   │   ├── checkout-flow.test.js
│   │   ├── admin-commands.test.js
│   │   └── payment-flow.test.js
│   │
│   └── e2e/                       # End-to-end tests
│       └── complete-purchase.test.js
│
├── docs/                           # Documentation
│   ├── AI_INTEGRATION.md          # AI feature documentation
│   ├── MODULARIZATION.md          # Architecture guide
│   └── archive/                   # Historical documentation
│
├── data/                           # Application data
├── logs/                           # Auto-rotated log files
├── assets/                         # Static assets
│   └── qris/                      # QRIS payment images
├── payment_qris/                   # Generated QRIS codes
├── payment_proofs/                 # Customer payment screenshots
├── products_data/                  # Product credentials
│   ├── netflix.txt                # Delivered account list
│   ├── spotify.txt
│   └── sold/                      # Archive of sold products
│
├── package.json                    # NPM dependencies & scripts
├── package-lock.json               # Locked dependency versions
├── jest.config.cjs                 # Jest testing configuration
├── eslint.config.js                # ESLint code style rules
└── install-vps.sh                  # VPS auto-installation script
```

## Component Descriptions

### Root Level Files

**`index.js` (243 lines)**
- **Purpose:** Application entry point and bootstrap
- **Responsibilities:**
  - Initialize WhatsApp client with Puppeteer configuration
  - Setup authentication (QR code or pairing code)
  - Register event handlers (qr, ready, authenticated, message, disconnected)
  - Initialize services (SessionManager, ChatbotLogic, PaymentReminder)
  - Start log rotation and session cleanup intervals
  - Handle graceful shutdown (SIGINT, SIGTERM)
- **Key Features:**
  - VPS-optimized Puppeteer args (--single-process, --disable-gpu)
  - Pairing code support for headless environments
  - Health check logging every 5 minutes
  - Auto-reconnect logic

**`chatbotLogic.js` (136 lines)**
- **Purpose:** Business logic orchestrator and message processor
- **Responsibilities:**
  - Route incoming messages to appropriate handlers
  - Apply rate limiting and input validation
  - Coordinate between CustomerHandler, AdminHandler, ProductHandler
  - Handle global error recovery
  - Maintain session state consistency
- **Dependencies:** SessionManager, MessageRouter, InputValidator, TransactionLogger

**`sessionManager.js` (525 lines)**
- **Purpose:** Customer session and shopping cart management
- **Responsibilities:**
  - Session CRUD operations (create, read, update, delete)
  - Redis persistence with in-memory fallback
  - Shopping cart management (add, remove, clear)
  - Wishlist management
  - Promo code tracking
  - Session TTL and expiration handling
  - Rate limiting data storage
- **Storage:** Redis (primary), Map (fallback)

**`config.js` (278 lines)**
- **Purpose:** Legacy configuration wrapper for backward compatibility
- **Responsibilities:**
  - Re-exports from modular config files (app.config.js, products.config.js, payment.config.js)
  - Provides legacy functions: getAllProducts(), getProductById(), formatProductList()
  - Maintains backward compatibility during migration to modular architecture
- **Status:** Being phased out in favor of direct imports from `src/config/`

### src/config/ - Configuration Modules

**`app.config.js`**
- System-wide settings: currency, session timeout, rate limits
- Feature flags: AI enabled, auto-delivery, maintenance mode
- Business information: shop name, support contacts, working hours
- Logging configuration

**`products.config.js`**
- Product catalog definitions (premiumAccounts, virtualCards)
- Default stock quantities (DEFAULT_STOCK, VCC_STOCK)
- Product schema: id, name, price, description, stock, category

**`payment.config.js`**
- E-wallet accounts: DANA, GoPay, OVO, ShopeePay
- Bank accounts: BCA, BNI, BRI, Mandiri
- Each account: number/account, name, enabled status

### src/core/ - Core Framework

**`WhatsAppClient.js`**
- Initializes whatsapp-web.js Client with LocalAuth strategy
- Configures Puppeteer with VPS-optimized arguments
- Manages client lifecycle (initialize, destroy, reconnect)

**`MessageDispatcher.js`**
- Receives messages from WhatsApp events
- Filters out group messages and status updates
- Validates message format and sender
- Dispatches to MessageRouter

**`MessageRouter.js`**
- Analyzes command type and session step
- Routes to appropriate handler:
  - Global commands (menu, cart) → CustomerHandler
  - Admin commands (/) → AdminHandler
  - Product selection → CustomerHandler.handleProductSelection()
  - Payment flow → PaymentHandlers
- O(1) command lookup using Map data structure

**`DependencyContainer.js`**
- Manages service lifecycle
- Provides dependency injection
- Singleton pattern for shared services

### src/handlers/ - Business Logic Handlers

**`BaseHandler.js`**
- Abstract base class for all handlers
- Provides common functionality:
  - Session access via SessionManager
  - Logging utilities
  - Error handling patterns
  - Response formatting

**`CustomerHandler.js` (~570 lines)**
- **Commands:** browse, cart, checkout, wishlist, history, track, review
- **Responsibilities:**
  - Menu navigation
  - Product browsing with fuzzy search
  - Cart management (add, remove, view)
  - Wishlist operations
  - Order history display
  - Review submission
- **Delegation:** Uses WishlistService, ReviewService, OrderService

**`AdminHandler.js` (~686 lines)**
- **Commands:** /stats, /status, /approve, /broadcast, /createpromo, /addstock
- **Responsibilities:**
  - Command validation and authorization (isAdmin check)
  - Delegates to specialized sub-handlers:
    - InventoryHandler → /addstock, /stockreport
    - AnalyticsHandler → /stats
    - ReviewHandler → /reviews, /deletereview
  - Maintains <700 line limit through delegation pattern
- **Authorization:** Checks ADMIN_NUMBER_1, ADMIN_NUMBER_2, ADMIN_NUMBER_3

**`AdminInventoryHandler.js` (~230 lines)**
- Inventory management commands
- Stock reports and sales analytics
- Low stock alerts

**`AdminAnalyticsHandler.js` (~150 lines)**
- Business dashboard generation
- Revenue tracking by payment method
- ASCII graph rendering
- Retention rate calculation

**`AdminReviewHandler.js` (~187 lines)**
- Review moderation interface
- Delete inappropriate reviews
- View reviews by product

**`ProductHandler.js`**
- Product CRUD operations
- Fuzzy search implementation
- Stock validation before purchase

**`CustomerWishlistHandler.js` (~120 lines)**
- Add products to wishlist
- View saved products
- Remove from wishlist
- Move wishlist items to cart

**`CustomerCheckoutHandler.js` (~280 lines)**
- Checkout flow orchestration
- Promo code application
- Payment method selection
- Order confirmation

### src/services/ - Domain Services

**Session Services:**
- `SessionService.js` - Session CRUD operations
- `CartService.js` - Shopping cart business logic
- `RedisStorage.js` - Redis persistence implementation
- `MemoryStorage.js` - In-memory fallback storage

**Payment Services:**
- `PaymentService.js` - Payment method abstraction
- `PaymentReminderService.js` - Cron-based reminders (*/15 * * * *)

**Product Services:**
- `ProductService.js` - Product catalog operations, fuzzy search, stock checks

**Inventory Services:**
- `RedisStockManager.js` - Redis-backed stock tracking
- `InventoryService.js` - Inventory operations (add, remove, adjust)
- `RedisInventoryStorage.js` - Persistence layer

**Order Services:**
- `OrderService.js` - Order lifecycle management, history tracking

**Wishlist Services:**
- `WishlistService.js` - Wishlist CRUD operations

**Review Services:**
- `ReviewService.js` - Review submission, retrieval, moderation, average rating calculation

**Promo Services:**
- `PromoService.js` - Promo code validation, expiry checking, usage tracking

**Analytics Services:**
- `DashboardService.js` - Business metrics aggregation, ASCII graph generation

**AI Services:**
- `AIService.js` - Gemini API integration, rate limiting, cost tracking

### src/utils/ - Utility Functions

**`FuzzySearch.js`**
- Levenshtein distance algorithm for typo tolerance
- Handles "netflx" → "netflix", "spotfy" → "spotify"
- Configurable similarity threshold

**`InputSanitizer.js`**
- Removes null bytes, XSS attempts
- Limits message length (1000 chars)
- Escapes special characters

**`ValidationHelpers.js`**
- Phone number validation (WhatsApp format)
- Order ID validation (ORD-timestamp-suffix)
- Payment choice validation
- Bank choice validation

**`Constants.js`**
- Global constants (CURRENCY, MAX_CART_ITEMS, ORDER_ID_PREFIX)

**`ErrorMessages.js`**
- Standardized error message templates

### lib/ - Legacy Core Modules

**`inputValidator.js`**
- Rate limiting: 20 messages/minute per customer
- Order limiting: 5 orders/day per customer
- Error cooldown: 1-minute after errors
- Input sanitization and validation
- Admin authorization checks

**`messageRouter.js`**
- Legacy routing logic (being replaced by src/core/MessageRouter.js)

**`paymentHandlers.js`**
- Manual payment account selection
- QRIS generation delegation
- E-wallet instructions
- Bank transfer instructions

**`uiMessages.js`**
- UI message templates for customer responses
- Emoji-rich formatting for mobile readability

**`redisClient.js`**
- Redis connection management
- Auto-reconnect logic
- Error handling with fallback

**`transactionLogger.js`**
- Audit logging for:
  - Orders (orders-YYYY-MM-DD.log)
  - Payments (payments-YYYY-MM-DD.log)
  - Deliveries (deliveries-YYYY-MM-DD.log)
  - Admin actions (admin-YYYY-MM-DD.log)
  - Errors (errors-YYYY-MM-DD.log)
  - Security events (security-YYYY-MM-DD.log)

**`logRotationManager.js`**
- Daily log rotation at midnight
- 7-day retention (configurable via LOG_RETENTION_DAYS)
- Automatic old log deletion

### services/ - External Integrations

**`xenditService.js`**
- Xendit Payment API wrapper
- QRIS payment creation
- E-wallet payment (OVO, DANA, GoPay, ShopeePay)
- Virtual Account generation
- Webhook signature verification
- QR code image generation

**`webhookServer.js`**
- Express.js server listening on port 3000
- Endpoints:
  - POST /webhook/xendit - Payment notifications
  - GET /health - Health check
- Webhook signature validation
- Auto-delivery trigger on payment success
- Exponential backoff retry (1s → 16s, max 5 retries)

**`productDelivery.js`**
- Automated credential delivery
- Reads from products_data/<product>.txt
- Sends formatted credentials to customer
- Archives to products_data/sold/

**`qrisService.js`**
- Legacy QRIS generation (InterActive QRIS API)
- Maintained for backward compatibility

### tests/ - Test Suites

**Test Statistics:**
- 885 total tests
- 817 passing (92%)
- 85%+ code coverage

**Test Organization:**
- `unit/` - Isolated component tests (mocked dependencies)
- `integration/` - Multi-component interaction tests
- `e2e/` - Complete user journey tests

**Key Test Files:**
- `CustomerHandler.test.js` - Customer command tests
- `AdminHandler.test.js` - Admin authorization and command tests
- `ProductService.test.js` - Catalog and fuzzy search tests
- `SessionManager.test.js` - Session CRUD and TTL tests
- `checkout-flow.test.js` - Full checkout integration test

## Architecture Overview

### High-Level Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                        WhatsApp Client                          │
│                    (whatsapp-web.js)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓ Message Event
┌─────────────────────────────────────────────────────────────────┐
│                     Message Dispatcher                          │
│  - Filter groups/status                                         │
│  - Validate sender                                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Input Validator                            │
│  - Rate limiting (20/min)                                       │
│  - Sanitization                                                 │
│  - Cooldown check                                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓ Normalized Message
┌─────────────────────────────────────────────────────────────────┐
│                      Message Router                             │
│  - Command detection                                            │
│  - Step-based routing                                           │
│  - O(1) lookup via Map                                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬────────────────┐
        │             │             │                │
        ↓             ↓             ↓                ↓
┌──────────────┬──────────────┬─────────────┬───────────────┐
│   Customer   │    Admin     │   Product   │   Payment     │
│   Handler    │   Handler    │   Handler   │   Handlers    │
└──────┬───────┴──────┬───────┴─────┬───────┴───────┬───────┘
       │              │             │               │
       │ Delegates    │ Delegates   │               │
       ↓              ↓             ↓               ↓
┌──────────────┬──────────────┬─────────────┬───────────────┐
│  Wishlist    │  Inventory   │  Product    │   Xendit      │
│  Service     │  Handler     │  Service    │   Service     │
└──────┬───────┴──────┬───────┴─────┬───────┴───────┬───────┘
       │              │             │               │
       │              │             │               │
       ↓              ↓             ↓               ↓
┌─────────────────────────────────────────────────────────┐
│                   Storage Layer                         │
│                                                         │
│  ┌───────────┐    ┌──────────────┐    ┌────────────┐  │
│  │   Redis   │    │  Redis Stock │    │   File     │  │
│  │  Sessions │    │   Manager    │    │  System    │  │
│  └───────────┘    └──────────────┘    └────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Example: Customer Makes Purchase

1. **Customer sends:** "netflix"
2. **MessageDispatcher:** Validates not from group, passes to Router
3. **InputValidator:** Checks rate limit (20/min), sanitizes input
4. **MessageRouter:** 
   - Gets session step = "browsing"
   - Routes to CustomerHandler.handleProductSelection("netflix")
5. **CustomerHandler:**
   - Uses FuzzySearch utility to find product
   - Calls CartService.add(customerId, product)
6. **CartService:**
   - Validates stock via RedisStockManager
   - Updates session cart array
   - Saves to Redis via SessionManager
7. **SessionManager:**
   - Serializes session to JSON
   - SET session:{customerId} with TTL 1800s
8. **CustomerHandler:** Returns confirmation message
9. **MessageDispatcher:** Sends reply to customer

### Session State Machine

```
┌──────────┐
│  "menu"  │ ← Initial state
└────┬─────┘
     │ Customer types "browse"
     ↓
┌────────────┐
│ "browsing" │ ← Customer can type product names
└────┬───────┘
     │ Customer types "checkout"
     ↓
┌────────────┐
│ "checkout" │ ← Review cart, apply promo, select payment
└────┬───────┘
     │ Customer completes payment
     ↓
┌─────────────────┐
│ "payment_proof" │ ← Upload payment screenshot
└────┬────────────┘
     │ Admin approves or auto-delivery
     ↓
┌──────────┐
│  "menu"  │ ← Reset to menu
└──────────┘
```

### Modular Design Benefits

1. **Maintainability:**
   - Each file has single responsibility
   - Easy to locate and fix bugs
   - File size limit enforces modularity

2. **Testability:**
   - Components can be unit tested in isolation
   - Mock dependencies easily with dependency injection
   - 85%+ coverage achieved

3. **Scalability:**
   - New features added as new modules
   - Horizontal scaling possible via Redis
   - Handlers can be distributed across processes

4. **Code Reusability:**
   - Services used across multiple handlers
   - Utilities shared project-wide
   - Reduces code duplication

---

---

**Related Documentation:**
- 💻 [Installation Guide](./INSTALLATION_GUIDE.md)
- 📝 [Configuration Reference](./CONFIGURATION_REFERENCE.md)
- 🔒 [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
