# Phase 2 Features - Testing Guide

**Date:** November 3, 2025  
**Version:** Phase 2 Complete  
**Features:** Product Reviews + Enhanced Admin Dashboard

---

## Quick Testing Checklist

### Feature #3: Product Reviews System

**Customer Testing:**

1. **Submit a Review**
   ```
   Customer: /review netflix 5 Sangat bagus, worth it!
   Expected: ✅ Review berhasil disimpan confirmation
   ```

2. **View Ratings in Product List**
   ```
   Customer: menu → 1 (Browse)
   Expected: Products show ⭐ 5.0/5.0 (1 review) if reviews exist
   ```

3. **Invalid Rating Test**
   ```
   Customer: /review spotify 10 Test
   Expected: ❌ Error - rating must be 1-5
   ```

4. **Duplicate Review Prevention**
   ```
   Customer: /review netflix 5 Second review
   Expected: ❌ Error - already reviewed this product
   ```

**Admin Testing:**

1. **View All Reviews**
   ```
   Admin: /reviews
   Expected: List of all reviews with ratings
   ```

2. **View Product-Specific Reviews**
   ```
   Admin: /reviews netflix
   Expected: Only Netflix reviews shown
   ```

3. **Delete Review**
   ```
   Admin: /deletereview <reviewId>
   Expected: ✅ Review deleted confirmation
   ```

---

### Feature #4: Enhanced Admin Dashboard

**Admin Testing:**

1. **View Default Dashboard (30 days)**
   ```
   Admin: /stats
   Expected: 
   - �� ADMIN DASHBOARD header
   - Sales Overview section
   - Revenue by Payment Method (ASCII chart)
   - Top 5 Best-Selling Products
   - Customer Retention metrics
   - Quick Stats
   ```

2. **View 7-Day Dashboard**
   ```
   Admin: /stats 7
   Expected: Dashboard with "Last 7 days" label
   ```

3. **View 90-Day Dashboard**
   ```
   Admin: /stats 90
   Expected: Dashboard with "Last 90 days" label
   ```

4. **Verify ASCII Charts Display**
   ```
   Check that:
   - Revenue bars show correctly (████████)
   - Percentages are displayed
   - IDR amounts formatted (Rp X.XXX.XXX)
   ```

5. **Test with No Transaction Data**
   ```
   On fresh install:
   Expected: Dashboard shows zeros gracefully
   ```

---

## Expected Outputs

### Sample Review Display (Product List)

```
*🛍️ Katalog Produk Premium*

*📺 Premium Accounts*
1. Netflix Premium
   💰 Rp 15.800
   📦 ✅ (10)
   ⭐ 4.5/5.0 (12 reviews)
   ℹ️ Netflix Premium 1 bulan
```

### Sample Dashboard Output

```
📊 *ADMIN DASHBOARD*

💰 *Sales Overview* (Last 30 Days)
━━━━━━━━━━━━━━━━━━
📦 Total Orders: 45
✅ Completed: 38
⏳ Pending: 7
💵 Total Revenue: Rp 712.400
📈 Avg Order: Rp 18.747
✔️ Completion Rate: 84.4%

💳 *Revenue by Payment Method*
━━━━━━━━━━━━━━━━━━
QRIS           ████████████████ 42%
               Rp 299.208
Bank Transfer  ████████████ 35%
               Rp 249.340
DANA           ██████ 18%
               Rp 128.232
...

🏆 *Top 5 Best-Selling Products*
━━━━━━━━━━━━━━━━━━
1. Netflix Premium
   • Sold: 15 units
   • Revenue: Rp 237.000
...
```

---

## Testing Scenarios

### Scenario 1: Complete Customer Journey with Reviews

1. Customer browses products
2. Customer adds Netflix to cart
3. Customer checks out
4. Payment completed
5. Customer submits review: `/review netflix 5 Excellent!`
6. Customer browses again → sees rating on Netflix
7. Admin checks `/reviews` → sees new review
8. Admin views `/stats` → sees order in analytics

### Scenario 2: Admin Moderates Reviews

1. Customer submits inappropriate review
2. Admin runs `/reviews` → finds review ID
3. Admin deletes: `/deletereview <id>`
4. Review no longer appears in product list
5. Average rating recalculated automatically

### Scenario 3: Dashboard Analytics Over Time

1. Admin checks `/stats` daily
2. Monitor revenue trends
3. Identify top-selling products
4. Track customer retention rate
5. Compare `/stats 7` vs `/stats 30` vs `/stats 90`

---

## Common Issues & Solutions

### Issue: "reviewService.getAverageRating is not a function"
**Solution:** Restart bot (PM2: `pm2 restart whatsapp-shop`)

### Issue: Dashboard shows all zeros
**Solution:** 
- Check if transaction logs exist in `logs/transactions-*.log`
- Verify orders have been completed (not just initiated)
- Check date range (older transactions may be outside window)

### Issue: ASCII charts not displaying correctly
**Solution:**
- WhatsApp Web may not support all Unicode characters
- Check on mobile WhatsApp (usually better support)
- Bars should still be readable even if not perfect

### Issue: Review not saving
**Solution:**
- Check rating is 1-5
- Verify product ID exists
- Check `data/reviews.json` file permissions
- Review logs for errors

---

## Performance Expectations

**Product Reviews:**
- Submit review: <100ms
- Load product list with ratings: <200ms
- Admin view reviews: <150ms

**Dashboard Analytics:**
- 30-day dashboard: <500ms
- 90-day dashboard: <1000ms
- With 1000+ transactions: <2000ms

---

## Data Verification

### Check Review Storage
```bash
cat data/reviews.json | jq '.'
```

Expected format:
```json
{
  "reviews": [
    {
      "id": "rev_1699012345678_abc123",
      "productId": "netflix",
      "customerId": "***1234",
      "rating": 5,
      "comment": "Excellent service!",
      "timestamp": "2025-11-03T10:30:00.000Z"
    }
  ]
}
```

### Check Transaction Logs
```bash
ls -lh logs/transactions-*.log
tail -20 logs/transactions-2025-11-03.log
```

Expected entries:
```json
{"timestamp":"2025-11-03T10:30:00.000Z","type":"transactions","event":"order_created",...}
{"timestamp":"2025-11-03T10:35:00.000Z","type":"transactions","event":"payment_success",...}
```

---

## Rollback Plan (If Issues Found)

### Revert to Previous Version
```bash
git revert 93a4bfd
git push origin main
git push chatwhatsapp main
pm2 restart whatsapp-shop
```

### Disable Reviews Feature
Edit `src/core/MessageRouter.js` - comment out review routing

### Disable Dashboard Feature
Edit `src/handlers/AdminHandler.js` - revert to simple stats

---

## Success Criteria

- [ ] All review commands work correctly
- [ ] Ratings display in product lists
- [ ] Dashboard shows accurate analytics
- [ ] ASCII charts render properly
- [ ] No performance degradation
- [ ] All 251 tests still passing
- [ ] No errors in PM2 logs

---

## Monitoring Commands

```bash
# Watch PM2 logs in real-time
pm2 logs whatsapp-shop --lines 50

# Check bot status
pm2 status

# Check memory usage
pm2 info whatsapp-shop

# Restart if needed
pm2 restart whatsapp-shop

# View error logs
cat logs/error-*.log | tail -50
```

---

## User Feedback Collection

**Questions to Ask Users:**

1. Are product ratings helpful for decision-making?
2. Is the review submission process clear?
3. Is the dashboard information useful?
4. Are there any missing analytics you'd like to see?
5. Any bugs or unexpected behavior?

---

**Testing Status:** ⏸️ Ready to begin  
**Deployment Status:** ✅ Deployed to both repos  
**Bot Status:** Check with `pm2 status`  
**Next Step:** Monitor GitHub Actions + Start user testing
