# Pricing System Migration (USD → Direct IDR)

**Date:** November 3, 2025  
**Status:** ✅ Complete

## Decision Made

Migrated from USD-based pricing with runtime conversion to direct IDR pricing system.

### Before

- Products had `price: 1` (USD)
- Runtime conversion: `price * 15800 = 15,800 IDR`
- Complex calculation logic throughout codebase

### After

- Products have `price: 15800` (direct IDR)
- No conversion needed
- Simpler, more transparent for Indonesian customers

## Files Modified

1. **src/config/products.config.js** - All 6 products changed to IDR prices
2. **lib/uiMessages.js** - Removed `* usdToIdrRate` from cartView(), orderSummary()
3. **src/handlers/CustomerHandler.js** - Direct price calculation
4. **src/services/product/ProductService.js** - formatProductList() no conversion
5. **src/handlers/ProductHandler.js** - Removed usdToIdrRate parameter
6. **config.js** - Legacy formatProductList() updated

## Critical Bug Discovered & Fixed

**Bug:** Checkout code still had USD conversion logic after pricing system change.

```javascript
// BUG (causing 249 million rupiah!):
const totalUSD = cart.reduce((sum, item) => sum + item.price, 0); // 31,600 IDR
const totalIDR = XenditService.convertToIDR(totalUSD); // 31,600 * 15,800 = 499,680,000!

// FIXED:
const totalIDR = cart.reduce((sum, item) => sum + item.price, 0); // Direct IDR sum
```

**Impact:**

- Cart showed: Rp 31,600 ✅
- Checkout would show: Rp 249,640,000 ❌
- Fixed in 2 locations: CustomerHandler.js, paymentHandlers.js

## Commits

- `8724660` - Initial pricing system change
- `1a2c986` - Checkout double conversion bug fix

## Testing

- ✅ 251 unit tests passing
- ✅ Manual test: Cart shows Rp 31,600
- ✅ Manual test: Checkout shows Rp 31,600 (not 249 million)
- ✅ Bot restarted successfully (restart #20)

## Lessons Learned

**Critical:** When making fundamental system changes (like pricing), search for ALL usages:

1. Display/UI code (uiMessages.js) ✅
2. Business logic (handlers) ⚠️ MISSED initially
3. Service layer (ProductService) ✅
4. Payment processing ⚠️ MISSED initially

**Pattern:** Always grep for variable names when changing data structure:

```bash
grep -r "totalUSD" .
grep -r "usdToIdrRate" .
grep -r "convertToIDR" .
```

## USD_TO_IDR_RATE Still Used For

Payment gateway integrations only (Xendit API requires USD):

- XenditService.convertToIDR() - For API calls
- NOT used for product pricing anymore
