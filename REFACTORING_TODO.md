# Handler Refactoring - File Size Compliance

**Priority:** HIGH (BLOCKING for production deployment)  
**Estimated Effort:** 2-4 hours  
**Issue:** AdminHandler and CustomerHandler exceed 700-line GitHub Actions limit

---

## Current State

### File Size Violations

**AdminHandler.js:**
- Current: 965 lines (+265 over 700 limit)
- Accumulated from Phase 2 Features #3 and #4
- Review methods: ~150 lines
- Dashboard/stats: ~100 lines
- Settings/config: ~100 lines
- Core admin commands: ~615 lines

**CustomerHandler.js:**
- Current: 853 lines (+153 over 700 limit)
- Accumulated from Phase 2 Features #1 and #3
- Wishlist methods: ~120 lines
- Order tracking: ~130 lines
- Review submission: ~50 lines
- Core customer flow: ~553 lines

---

## Refactoring Plan

### AdminHandler Split (3 new files)

**1. AdminReviewHandler.js (~150 lines)**
- Extract review management methods
- Methods:
  - `handleReviews(adminId, productId)`
  - `handleDeleteReview(adminId, reviewId)`
  - `handleApproveReviews(adminId)` (future)
- Purpose: Review moderation and management

**2. AdminAnalyticsHandler.js (~100 lines)**
- Extract dashboard and statistics
- Methods:
  - `handleStats(adminId, days)`
  - `handleDashboard(adminId)` (alias)
  - Helper: `_formatIDR(amount)`
- Purpose: Business intelligence and reporting

**3. AdminConfigHandler.js (~100 lines)**
- Extract settings and system configuration
- Methods:
  - `handleSettings(adminId, action, key, value)`
  - `handleStatus(adminId)`
  - `handleSystemInfo(adminId)`
- Purpose: Bot configuration management

**Result:** AdminHandler → ~615 lines ✅ (under 700 limit)

---

### CustomerHandler Split (2 new files)

**1. CustomerWishlistHandler.js (~120 lines)**
- Extract wishlist/favorites functionality
- Methods:
  - `handleSaveProduct(customerId, productName)`
  - `handleViewWishlist(customerId)`
  - `handleRemoveFromWishlist(customerId, productName)`
  - `handleMoveToCart(customerId, productName)`
- Purpose: Wishlist management

**2. CustomerOrderHandler.js (~130 lines)**
- Extract order tracking functionality
- Methods:
  - `handleTrackOrder(customerId, orderId)`
  - `handleOrderHistory(customerId)`
  - `handleOrderStatus(customerId, orderId)`
- Purpose: Order management and tracking

**Result:** CustomerHandler → ~603 lines ✅ (under 700 limit)

---

## Implementation Steps

### Phase 1: Create New Handler Classes

1. **Create AdminReviewHandler.js**
   ```javascript
   class AdminReviewHandler extends BaseHandler {
     constructor(reviewService, uiMessages, logger) {
       super();
       this.reviewService = reviewService;
       this.uiMessages = uiMessages;
       this.logger = logger;
     }
     
     async handleReviews(adminId, productId) { /* ... */ }
     async handleDeleteReview(adminId, reviewId) { /* ... */ }
   }
   ```

2. **Create AdminAnalyticsHandler.js**
   ```javascript
   class AdminAnalyticsHandler extends BaseHandler {
     constructor(dashboardService, adminStatsService, logger) {
       super();
       this.dashboardService = dashboardService;
       this.adminStatsService = adminStatsService;
       this.logger = logger;
     }
     
     async handleStats(adminId, days = 30) { /* ... */ }
     _formatIDR(amount) { /* ... */ }
   }
   ```

3. **Create AdminConfigHandler.js**
   ```javascript
   class AdminConfigHandler extends BaseHandler {
     constructor(config, logger) {
       super();
       this.config = config;
       this.logger = logger;
     }
     
     async handleSettings(adminId, action, key, value) { /* ... */ }
     async handleStatus(adminId) { /* ... */ }
   }
   ```

4. **Create CustomerWishlistHandler.js**
   ```javascript
   class CustomerWishlistHandler extends BaseHandler {
     constructor(wishlistService, productService, uiMessages) {
       super();
       this.wishlistService = wishlistService;
       this.productService = productService;
       this.uiMessages = uiMessages;
     }
     
     async handleSaveProduct(customerId, productName) { /* ... */ }
     async handleViewWishlist(customerId) { /* ... */ }
   }
   ```

5. **Create CustomerOrderHandler.js**
   ```javascript
   class CustomerOrderHandler extends BaseHandler {
     constructor(orderService, uiMessages) {
       super();
       this.orderService = orderService;
       this.uiMessages = uiMessages;
     }
     
     async handleTrackOrder(customerId, orderId) { /* ... */ }
     async handleOrderHistory(customerId) { /* ... */ }
   }
   ```

---

### Phase 2: Update DependencyContainer

```javascript
// In src/core/DependencyContainer.js
this.adminReviewHandler = new AdminReviewHandler(
  this.reviewService,
  this.uiMessages,
  this.logger
);

this.adminAnalyticsHandler = new AdminAnalyticsHandler(
  this.dashboardService,
  this.adminStatsService,
  this.logger
);

this.adminConfigHandler = new AdminConfigHandler(
  this.config,
  this.logger
);

this.customerWishlistHandler = new CustomerWishlistHandler(
  this.wishlistService,
  this.productService,
  this.uiMessages
);

this.customerOrderHandler = new CustomerOrderHandler(
  this.orderService,
  this.uiMessages
);
```

---

### Phase 3: Update Main Handlers (Delegation)

**AdminHandler.js:**
```javascript
// Route to specialized handlers
if (message.startsWith('/reviews')) {
  return await this.reviewHandler.handleReviews(adminId, productId);
}

if (message.startsWith('/deletereview')) {
  return await this.reviewHandler.handleDeleteReview(adminId, reviewId);
}

if (message.startsWith('/stats')) {
  return await this.analyticsHandler.handleStats(adminId, days);
}

if (message.startsWith('/settings')) {
  return await this.configHandler.handleSettings(adminId, action, key, value);
}
```

**CustomerHandler.js:**
```javascript
// Route to specialized handlers
if (message === 'simpan' || message.startsWith('⭐')) {
  return await this.wishlistHandler.handleSaveProduct(customerId, productName);
}

if (message === '/wishlist') {
  return await this.wishlistHandler.handleViewWishlist(customerId);
}

if (message === '/track' || message.startsWith('track')) {
  return await this.orderHandler.handleTrackOrder(customerId, orderId);
}
```

---

### Phase 4: Testing

1. **Run all existing tests:**
   ```bash
   npm test
   ```
   Expected: 251 tests passing

2. **Create new tests for extracted handlers:**
   - `tests/unit/handlers/AdminReviewHandler.test.js`
   - `tests/unit/handlers/AdminAnalyticsHandler.test.js`
   - `tests/unit/handlers/CustomerWishlistHandler.test.js`
   - `tests/unit/handlers/CustomerOrderHandler.test.js`

3. **Verify file sizes:**
   ```bash
   wc -l src/handlers/*.js
   ```
   Expected: All files < 700 lines

4. **Run ESLint:**
   ```bash
   npm run lint
   ```
   Expected: 0 errors, 0 warnings

---

### Phase 5: Validation

1. **GitHub Actions Check:**
   - Push to feature branch
   - Verify CI/CD passes
   - Check file size validation

2. **Manual Testing:**
   - Test review commands
   - Test dashboard commands
   - Test wishlist commands
   - Test order tracking
   - Verify all features work

3. **Merge to main:**
   - Create PR with refactoring changes
   - Link to this document
   - Merge when CI/CD passes

---

## Benefits

**Code Organization:**
- Single Responsibility Principle enforced
- Easier to maintain and test
- Clear separation of concerns

**CI/CD Compliance:**
- Passes GitHub Actions file size checks
- No production deployment blockers
- Clean pipeline status

**Developer Experience:**
- Smaller files are easier to navigate
- Faster file operations
- Better IDE performance

**Testing:**
- Isolated unit tests per handler
- Better test coverage
- Easier to mock dependencies

---

## Success Criteria

- [ ] All handlers < 700 lines
- [ ] All 251+ tests passing
- [ ] ESLint clean (0 errors)
- [ ] GitHub Actions passing
- [ ] No functionality broken
- [ ] Documentation updated

---

## Timeline

**Estimated Effort:** 2-4 hours

**Breakdown:**
- Create new handler files: 1 hour
- Update DependencyContainer: 30 minutes
- Update routing in main handlers: 1 hour
- Testing and validation: 1 hour
- Documentation: 30 minutes

**Recommended Approach:**
- Work in feature branch: `refactor/handler-file-sizes`
- Commit incrementally (one handler at a time)
- Test after each extraction
- Merge when all checks pass

---

**Status:** ⏸️ Ready to start  
**Blocker Removed:** Phase 2 features committed ✅  
**Next Action:** Create feature branch and start extraction
