# File-Specific Reference

## Core Files

### index.js

Entry point. Handles WhatsApp lifecycle (qr, ready, authenticated, disconnected, error events). Sets up SIGINT/SIGTERM handlers for graceful shutdown. PM2-friendly. Initializes PaymentReminderService and cleanup intervals.

### chatbotLogic.js

Bootstrap layer that wires together handlers and services. Delegates actual business logic to modular handlers in `src/handlers/`. Routes messages through MessageRouter to appropriate handler.

### sessionManager.js

Key-value store wrapping a Map. Every method takes customerId (phone number like "1234567890@c.us"). Auto-updates lastActivity timestamp. Includes rate limiting (20 msg/min). Session schema includes `cart: []`, `wishlist: []`, `step`, `orderId`, payment fields.

### config.js

Main configuration file. Contains product catalog, payment methods, admin settings, and system configuration. Use `getAllProducts()` to get merged product list.

## Handler Files

### src/handlers/BaseHandler.js

Abstract base class providing common functionality for all handlers. Inherit from this when creating new handlers. Provides session access, logging, and error handling patterns.

### src/handlers/CustomerHandler.js

Main customer interaction handler. Handles menu, browsing, product selection, cart management, checkout flow, order tracking. ~570 lines. Delegates to CustomerWishlistHandler and CustomerCheckoutHandler.

### src/handlers/AdminHandler.js

Admin command handler. Manages admin operations like stats, broadcast, order approval, stock management. ~686 lines. Delegates to AdminInventoryHandler, AdminReviewHandler, AdminAnalyticsHandler.

### src/handlers/AIFallbackHandler.js

AI-powered fallback for unrecognized messages. Uses RelevanceFilter, IntentClassifier, and PromptBuilder. ~174 lines. Integrates with Gemini API for intelligent responses.

## Service Files

### src/services/ai/AIService.js

Gemini 2.5 Flash integration. Handles AI API calls, rate limiting, cost tracking. Used for typo correction, product Q&A, and intelligent fallback.

### src/services/ai/AIIntentClassifier.js

Classifies user intent into 8 categories: product_qa, features, comparison, pricing, availability, order_help, troubleshoot, general_info.

### src/services/ai/AIPromptBuilder.js

Builds context-aware prompts for AI. Injects shop context (products, prices, policies) and intent-specific instructions.

### src/services/session/SessionService.js

Session CRUD operations. Abstracts session storage (Map or Redis).

### src/services/payment/PaymentService.js

Payment abstraction layer. Handles Xendit integration, QRIS generation, payment verification.

### src/services/product/ProductService.js

Product operations. Search, filter, get details, manage catalog.

### src/services/wishlist/WishlistService.js

Wishlist management. Add, remove, view, move to cart.

### src/services/review/ReviewService.js

Product reviews and ratings. Add, view, delete, calculate averages.

### src/services/promo/PromoService.js

Promo code management. Create, validate, apply discounts, track usage.

## Router & Message Files

### lib/messageRouter.js

Central message routing. Handles rate limiting, payment proof detection, wishlist commands, AI fallback integration. Routes to appropriate handler based on message content and session state.

### lib/inputValidator.js

Input validation and sanitization. Use this before processing any user input to prevent injection attacks and handle edge cases.

### lib/uiMessages.js

All customer-facing message templates. Centralized for consistency and easy i18n. Heavy emoji usage for mobile-friendly readability.

### lib/paymentMessages.js

Payment-related message templates. QRIS instructions, payment confirmations, error messages.

## Middleware Files

### src/middleware/RelevanceFilter.js

Spam detection and message relevance scoring for AI. Filters out greetings, single characters, test messages. Detects shop-related questions.

### src/utils/InputSanitizer.js

Advanced input sanitization. XSS protection, SQL injection prevention, command injection blocking, PII masking.

## Configuration Files

### src/config/app.config.js

System settings: currency, session timeout, rate limits, feature flags.

### src/config/products.config.js

Product catalog: premium accounts (Netflix, Spotify, etc.), virtual cards.

### src/config/payment.config.js

Payment accounts: e-wallet (DANA, OVO, GoPay), bank transfer (BCA, Mandiri, BRI, BNI).

### src/config/ai.config.js

AI settings: model configuration, prompts, rate limits, feature toggles, cost tracking.

## Utility Files

### src/utils/FuzzySearch.js

Fuzzy string matching for product search. Handles typos, partial matches, configurable threshold.

### src/utils/ValidationHelpers.js

Common validation functions. Phone numbers, emails, order IDs, dates.

### src/utils/Constants.js

System constants. Order statuses, payment methods, error codes.

## Test Files

### tests/unit/

Unit tests for individual components. Each file tests one module in isolation.

### tests/integration/

Integration tests for service interactions. Tests complete flows like checkout, wishlist.

### tests/e2e/

End-to-end tests (future). Will test complete user journeys.

## Quick Lookup

**Need to modify:**

- Customer messages → `lib/uiMessages.js`
- Payment flow → `src/handlers/CustomerCheckoutHandler.js`
- Admin commands → `src/handlers/AdminHandler.js`
- Product catalog → `config.js` or `src/config/products.config.js`
- AI behavior → `src/config/ai.config.js`
- Session logic → `sessionManager.js`
- Routing logic → `lib/messageRouter.js`
