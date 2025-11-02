# Code Change Patterns & Best Practices

**Date:** November 3, 2025

## Pattern 1: Environment Variable Integration

**When:** Adding any configurable value

**Steps:**

1. Add to `.env.example` with comment
2. Add to `src/config/app.config.js` with fallback
3. Search for hardcoded value: `grep -r "old_value" .`
4. Replace with config reference
5. Test with different values
6. Update docs

**Example:**

```javascript
// .env.example
SHOP_NAME = "My Shop";

// app.config.js
shop: {
  name: process.env.SHOP_NAME || "Default Shop";
}

// Usage in code
const config = require("./config/app.config");
console.log(config.shop.name);
```

---

## Pattern 2: Pricing System Changes

**When:** Modifying how prices are calculated/displayed

**Critical:** Search ALL locations, not just display code!

**Files to check:**

1. Product config (where prices defined)
2. UI messages (where prices displayed)
3. Cart logic (where prices summed)
4. **Checkout logic** ⚠️ Often missed!
5. Payment handlers ⚠️ Often missed!
6. Order history/logs

**Search commands:**

```bash
grep -r "price" . --include="*.js" | grep -v node_modules
grep -r "total" . --include="*.js" | grep -v node_modules
grep -r "convert" . --include="*.js" | grep -v node_modules
```

**Test checklist:**

- [ ] Product list displays correct price
- [ ] Cart shows correct per-item price
- [ ] Cart shows correct total
- [ ] Checkout shows correct total
- [ ] Payment amount is correct
- [ ] Order confirmation matches

---

## Pattern 3: Multi-File Edits

**When:** Change affects multiple files

**Use:** `multi_replace_string_in_file` for efficiency

**Example structure:**

```javascript
{
  explanation: "Remove USD conversion throughout checkout flow",
  replacements: [
    {
      explanation: "Fix CustomerHandler checkout",
      filePath: "/absolute/path/to/CustomerHandler.js",
      oldString: "const totalUSD = ...\nconst totalIDR = convert(...)",
      newString: "const totalIDR = cart.reduce(...)"
    },
    {
      explanation: "Fix paymentHandlers",
      filePath: "/absolute/path/to/paymentHandlers.js",
      oldString: "same pattern",
      newString: "same fix"
    }
  ]
}
```

**Benefits:**

- Single tool invocation
- Atomic operation
- Less token usage
- Faster execution

---

## Pattern 4: Testing After Changes

**Order:**

1. Unit tests first: `npm test`
2. Manual logic test: Node.js script
3. Bot restart: `pm2 restart whatsapp-shop`
4. Live WhatsApp test: Real user flow
5. Monitor logs: `pm2 logs whatsapp-shop`

**Don't skip steps!** Unit tests passing ≠ production ready.

---

## Pattern 5: Git Commit Messages

**Format:**

```
<type>: <short description>

- Detailed point 1
- Detailed point 2
- Impact/reason for change
```

**Types:**

- `fix:` - Bug fixes
- `feat:` - New features
- `refactor:` - Code restructuring
- `docs:` - Documentation
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

**Example:**

```
fix: remove double USD-IDR conversion in checkout

- Fixed CustomerHandler.processCheckout() - was treating IDR prices as USD
- Fixed paymentHandlers.handlePaymentSelection() - same issue
- Bug: (15800 + 15800) * 15800 = 249,640,000 IDR (incorrect)
- Fix: 15800 + 15800 = 31,600 IDR (correct)
- Prices are already in IDR after Phase 24 pricing system change
```

---

## Pattern 6: Configuration Centralization

**Always:**

- Store config in `src/config/` directory
- Import config, never hardcode
- Use environment variables for secrets
- Provide sensible defaults

**Structure:**

```
src/config/
├── app.config.js      # System settings
├── products.config.js # Product catalog
├── payment.config.js  # Payment accounts
└── ai.config.js       # AI features (if any)
```

**Import pattern:**

```javascript
const config = require("./config/app.config");
// NOT: const shopName = "Hardcoded Shop";
```

---

## Pattern 7: Error Handling

**In handlers:**

```javascript
async handleSomething(customerId, message) {
  try {
    // Business logic
    const result = await someOperation();
    return UIMessages.success(result);
  } catch (error) {
    console.error(`❌ Error in handleSomething:`, error);
    return UIMessages.error('Terjadi kesalahan. Silakan coba lagi.');
  }
}
```

**Never expose technical details to customers!**

---

## Pattern 8: Debugging Checklist

**When something doesn't work:**

1. **Check logs:** `pm2 logs whatsapp-shop`
2. **Check Redis:** Is session persisting?
3. **Check config:** Are env vars loaded?
4. **Check tests:** `npm test` still passing?
5. **Check git diff:** What actually changed?
6. **Restart bot:** `pm2 restart whatsapp-shop`
7. **Test manually:** Live WhatsApp interaction

**Use grep extensively:**

```bash
grep -r "function_name" .
grep -r "error_message" .
grep -r "variable_name" .
```

---

## Pattern 9: Bot Restart Protocol

**When to restart:**

- After code changes
- After .env changes
- After npm install
- After Redis restart
- When debugging issues

**How:**

```bash
pm2 restart whatsapp-shop
pm2 logs whatsapp-shop --lines 20  # Check startup
pm2 status                          # Verify online
```

**What to verify:**

- Status: online ✅
- Memory: <200MB ✅
- Restarts: Increment by 1 ✅
- Logs: "WhatsApp Shopping Chatbot is ready!" ✅
- Redis: "Redis connected successfully" ✅

---

## Pattern 10: Code Search Commands

**Find all usages:**

```bash
grep -r "functionName" . --include="*.js" | grep -v node_modules
```

**Find in specific files:**

```bash
grep -r "pattern" src/handlers/
```

**Find with context:**

```bash
grep -r -B 3 -A 3 "pattern" .
```

**Find and count:**

```bash
grep -r "pattern" . --include="*.js" | wc -l
```

**Essential for refactoring!**
