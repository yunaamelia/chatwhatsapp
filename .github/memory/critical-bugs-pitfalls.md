# Critical Bugs & Pitfalls

**Last Updated:** November 3, 2025

## 1. Double Conversion Bug (Checkout)

**Date:** November 3, 2025  
**Severity:** 🔴 CRITICAL - Money calculation error  
**Status:** ✅ Fixed

### The Bug

After migrating to direct IDR pricing, checkout code still had USD conversion logic:

```javascript
// BUG in CustomerHandler.processCheckout():
const totalUSD = cart.reduce((sum, item) => sum + item.price, 0);
const totalIDR = XenditService.convertToIDR(totalUSD);
// Result: 31,600 * 15,800 = 499,680,000 IDR (249 million!)

// CORRECT:
const totalIDR = cart.reduce((sum, item) => sum + item.price, 0);
// Result: 15,800 + 15,800 = 31,600 IDR ✅
```

### Impact

- Cart display: Rp 31,600 ✅ (correct)
- Checkout display: Rp 249,640,000 ❌ (wrong by 7,900x!)
- Would cause customer confusion and lost sales

### Locations Fixed

1. `src/handlers/CustomerHandler.js` - processCheckout() method
2. `lib/paymentHandlers.js` - handlePaymentSelection() method

### Commits

- `1a2c986` - Fixed double conversion bug

### Lesson Learned

**When changing data structure, search for ALL usages of related logic:**

```bash
# Search for conversion functions
grep -r "convertToIDR" .
grep -r "totalUSD" .
grep -r "usdToIdrRate" .

# Check payment flow specifically
grep -r "processCheckout\|handlePayment" .
```

**Test both display AND processing code separately.**

---

## 2. Session Persistence Not Redis (Past Issue)

**Note:** This was fixed in earlier phases, documenting for reference.

### The Issue

Sessions stored in memory (Map) - lost on restart.

### Solution

- Implemented Redis persistence
- Sessions survive bot restarts
- Auto-cleanup with TTL (30 minutes)

### Code Pattern

```javascript
// ❌ BAD:
this.sessions = new Map();

// ✅ GOOD:
const redis = require('./lib/redisClient');
async getSession(customerId) {
  const data = await redis.get(`session:${customerId}`);
  return data ? JSON.parse(data) : this.createSession(customerId);
}
```

---

## 3. Hardcoded Values Throughout Codebase

**Date:** November 3, 2025  
**Status:** ✅ Fixed

### The Problem

Multiple hardcoded values not using .env:

- "Premium Shop" → Should use SHOP_NAME
- "15800" → Should use USD_TO_IDR_RATE
- "24/7" → Should use WORKING_HOURS

### Solution

Centralized config in `src/config/app.config.js`

### Pattern

```javascript
// ❌ BAD:
const shopName = "Premium Shop";
const rate = 15800;

// ✅ GOOD:
const config = require("./config/app.config");
const shopName = config.shop.name;
const rate = config.currency.usdToIdrRate;
```

### How to Prevent

1. Never hardcode strings/numbers that might change
2. Always use config.js for values
3. Grep for suspicious constants: `grep -r '".*"' . | grep -v node_modules`

---

## 4. Test Module Path Errors

**Date:** November 3, 2025  
**Status:** ⚠️ Known issue, low priority

### The Issue

Integration test fails with:

```
Error: Cannot find module './src/services/session/SessionManager'
```

### Root Cause

Relative path resolution in test files vs. actual code structure.

### Workaround

Use absolute paths or resolve from project root:

```javascript
// ❌ MAY FAIL:
const SessionManager = require("./src/services/session/SessionManager");

// ✅ BETTER:
const path = require("path");
const SessionManager = require(path.join(
  __dirname,
  "../src/services/session/SessionManager"
));
```

### Priority

Low - Live WhatsApp testing is more important than integration tests.

---

## 5. Payment Gateway Test Mode Warning

**Ongoing:** "You are using Xendit's TEST secret key"

### Context

This is expected during development. Change to LIVE key before production:

```env
# Development
XENDIT_SECRET_KEY=xnd_development_xxx

# Production
XENDIT_SECRET_KEY=xnd_production_xxx
```

### Safety

✅ Good reminder in logs - prevents accidental test mode in production.

---

## Quick Checklist for Future Changes

**Before deploying any pricing/payment changes:**

- [ ] Test cart display
- [ ] Test checkout display
- [ ] Verify amounts match between steps
- [ ] Check payment gateway receives correct amount
- [ ] Test with 1 item and 2+ items
- [ ] Restart bot and test again
- [ ] Run full test suite (251 tests)
- [ ] Check logs for errors
- [ ] Live WhatsApp test before announcing to customers

**Before changing environment variables:**

- [ ] Update .env.example
- [ ] Add to app.config.js
- [ ] Search for hardcoded old value
- [ ] Replace all occurrences
- [ ] Test with different values
- [ ] Document in memory folder
