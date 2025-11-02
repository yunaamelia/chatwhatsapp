# Environment Variables Integration (.env)

**Date:** November 3, 2025  
**Status:** ✅ Complete

## Problem Discovered

User reported: "BOT_NAME dan SHOP_NAME tidak berpengaruh di .env"

**Root Cause:** Multiple hardcoded values throughout codebase:

1. "Premium Shop" hardcoded in uiMessages.js
2. "15800" hardcoded in 5+ files for USD_TO_IDR_RATE
3. "24/7" hardcoded for working hours

## Solution Implemented

### Centralized Configuration

Created `src/config/app.config.js` that imports all .env variables:

```javascript
module.exports = {
  shop: {
    name: process.env.SHOP_NAME,
    botName: process.env.BOT_NAME,
    supportEmail: process.env.CONTACT_EMAIL,
    supportWhatsapp: process.env.CONTACT_WHATSAPP,
    workingHours: process.env.WORKING_HOURS || "24/7",
  },
  currency: {
    usdToIdrRate: parseInt(process.env.USD_TO_IDR_RATE || "15800"),
  },
  // ... other sections
};
```

### Files Modified

1. **lib/uiMessages.js** - Import app.config, use config.shop.name
2. **src/handlers/CustomerHandler.js** - Use config values
3. **src/config/app.config.js** - Added botName, workingHours

## Verified Working

Tested with different values:

- SHOP_NAME="Toko Voucher ID" → Displays correctly ✅
- USD_TO_IDR_RATE=16000 → Calculations correct ✅
- WORKING_HOURS="09:00-17:00 WIB" → Shows in contact ✅

## Commits

- `e65313c` - Initial .env integration (SHOP_NAME, BOT_NAME)
- `4fe5f07` - Complete audit (USD_TO_IDR_RATE, WORKING_HOURS)

## Pattern to Follow

**Always use config.js for dynamic values, never hardcode:**

```javascript
// ❌ BAD:
const shopName = "Premium Shop";
const rate = 15800;

// ✅ GOOD:
const config = require("./config/app.config");
const shopName = config.shop.name;
const rate = config.currency.usdToIdrRate;
```

## Audit Checklist for Future

When adding new .env variables:

1. Add to .env.example
2. Import in app.config.js
3. Search codebase for hardcoded values: `grep -r "hardcoded_value" .`
4. Replace all occurrences with config references
5. Test with different values to verify
6. Run full test suite (251 tests)
