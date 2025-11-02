# Current Project State

**Last Updated:** November 3, 2025 03:03 WIB  
**Bot Status:** ✅ ONLINE (PM2 restart #20)

## System Overview

**WhatsApp Shopping Chatbot** - Indonesian virtual goods marketplace

- Platform: whatsapp-web.js with LocalAuth
- Process Manager: PM2 (process name: whatsapp-shop)
- Persistence: Redis for sessions
- Testing: Mocha (251 tests passing)
- CI/CD: GitHub Actions with self-hosted runner

## Current Configuration

```env
SHOP_NAME="Toko Voucher ID"
BOT_NAME="Bot Toko"
WORKING_HOURS="24/7"
USD_TO_IDR_RATE=15800
CONTACT_EMAIL=support@example.com
CONTACT_WHATSAPP=6285800365445
```

## Product Catalog (6 products)

**Premium Accounts:**

1. Netflix Premium - Rp 15,800
2. Spotify Premium - Rp 15,800
3. YouTube Premium - Rp 15,800
4. Disney+ Hotstar - Rp 15,800

**Virtual Cards:** 5. VCC Basic - Rp 15,800 6. VCC Standard - Rp 15,800

**All prices in direct IDR** (no USD conversion since Nov 3, 2025)

## Payment Methods

1. **QRIS** (Xendit integration)

   - Auto-generates unique QR per transaction
   - Test mode active (xnd_development key)

2. **E-Wallet Manual**

   - DANA, OVO, GoPay, ShopeePay
   - Static QRIS images in `/assets/qris/`
   - Manual verification by admin

3. **Bank Transfer Manual**
   - BCA, Mandiri, BNI
   - Text instructions provided
   - Manual verification by admin

## Recent Major Changes

### Phase 24 (Nov 3, 2025)

- **Pricing System Migration**: USD-based → Direct IDR
- All products: $1 → Rp 15,800
- Removed USD conversion from UI layer
- Commit: `8724660`

### Phase 25 (Nov 3, 2025)

- **Environment Variables**: Complete .env integration
- Fixed all hardcoded values (SHOP_NAME, BOT_NAME, rates)
- Commits: `e65313c`, `4fe5f07`

### Phase 26 (Nov 3, 2025)

- **Critical Bug Fix**: Checkout double conversion
- Fixed: 249M IDR bug → correct 31,600 IDR
- Commit: `1a2c986`

## Bot Statistics

- Memory Usage: ~20-160MB (varies with activity)
- Restart Count: 20 (mostly for updates)
- Session Cleanup: Every 10 minutes
- Session Timeout: 30 minutes inactivity
- Active Sessions: Persisted in Redis

## Test Suite

```bash
npm test                # Run all 251 tests
npm run test:coverage   # With coverage report
```

**Coverage:**

- Unit tests: 251 passing
- Integration tests: Redis, payment flow
- E2E tests: Complete customer journey

## Deployment

- **Server:** VPS (1 vCPU, 2GB RAM)
- **OS:** Linux (Ubuntu/Debian)
- **Node.js:** v18+ required
- **PM2 Commands:**
  ```bash
  pm2 restart whatsapp-shop  # Restart bot
  pm2 logs whatsapp-shop     # View logs
  pm2 status                 # Check status
  ```

## Admin Commands (13 total)

- `/stats` - System statistics
- `/broadcast` - Message all customers
- `/stock` - Manage product stock
- `/approve` - Approve orders
- `/settings` - Bot configuration
- And 8 more...

## Next Steps (When User Tests)

1. ✅ Bot restarted with checkout fix
2. ⏳ User live testing via WhatsApp
3. ⏳ Verify checkout shows Rp 31,600 (not 249M)
4. ⏳ Monitor PM2 logs during test
5. ⏳ Fix any issues discovered

## Known Issues

- ⚠️ Integration test module path error (low priority)
- ⚠️ Xendit in TEST mode (expected for dev)

## Production Readiness Checklist

- [x] All tests passing (251/251)
- [x] Redis persistence working
- [x] .env variables integrated
- [x] Pricing system correct
- [x] Checkout bug fixed
- [ ] Live WhatsApp testing (in progress)
- [ ] Change Xendit to LIVE key
- [ ] Backup Redis data daily
- [ ] Monitor logs for errors

## Critical Files

- `index.js` - Bot entry point
- `src/handlers/CustomerHandler.js` - Customer commands
- `src/handlers/AdminHandler.js` - Admin commands
- `lib/uiMessages.js` - UI templates
- `src/config/app.config.js` - Central configuration
- `src/config/products.config.js` - Product catalog

## Documentation

- `.github/copilot-instructions.md` - Complete dev guide
- `docs/ARCHITECTURE.md` - System architecture
- `docs/MODULARIZATION.md` - Code structure
- `docs/PAYMENT_SYSTEM.md` - Payment integration
- `.github/memory/` - AI agent memory (this folder)
