# WhatsApp Shopping Chatbot - User Guide

**Last Updated:** November 6, 2025
**Audience:** End users (customers) and administrators

---

### 📱 Usage Guide

#### Customer Commands

**Core Navigation:**
- `menu` or `help` - Display main menu
- `browse` or `products` - View all available products
- `cart` - View current shopping cart contents
- `about` - Learn about the shop
- `support` or `contact` - Get support information

**Shopping Workflow:**
1. Customer sends any message → Bot shows welcome + menu
2. Customer types `browse` → Bot displays product catalog
3. Customer types product name (e.g., "netflix") → Product added to cart
4. Customer types `cart` → Review cart contents and pricing
5. Customer types `checkout` → Select payment method
6. Customer completes payment → Automated credential delivery

**Advanced Customer Features:**
- `⭐ <product>` or `simpan <product>` - Add product to wishlist
- `/wishlist` - View all saved/favorite products
- `hapus <product>` - Remove product from wishlist
- `promo <CODE>` - Apply promotional discount code
- `history` - View order history (last 5 orders)
- `/track` or `/track <order-id>` - Track order status
- `/review <product> <rating> <text>` - Leave product review (1-5 stars)

#### Admin Commands

**Dashboard & Statistics:**
```bash
/stats [days]              # Business metrics (default: 30 days)
                           # Shows: revenue, orders, top products, retention
                           
/status                    # System health check
                           # Shows: WhatsApp, Redis, memory, uptime
```

**Order Management:**
```bash
/approve <order-id>        # Manually approve pending payment
                           # Example: /approve ORD-1730819558000-A1B2
                           
/track <order-id>          # Track specific order status
```

**Inventory Control:**
```bash
/addstock <product> <qty>  # Add stock for product
                           # Example: /addstock netflix 50
                           
/stockreport               # View current inventory levels for all products

/salesreport [days]        # Sales analytics (default: 7 days)
                           # Shows: units sold, revenue, trends
```

**Promotional Campaigns:**
```bash
/createpromo CODE DISCOUNT DAYS    # Create new promo code
                                   # Example: /createpromo LAUNCH20 20 7
                                   # Creates 20% discount valid for 7 days
                                   
/listpromos                        # List all active promo codes

/deletepromo CODE                  # Delete/deactivate promo code
```

**Review Moderation:**
```bash
/reviews <product>         # View all reviews for product
                           # Example: /reviews netflix
                           
/deletereview <reviewId>   # Remove inappropriate review
```

**Communication:**
```bash
/broadcast <message>       # Send message to all active customers
                           # Example: /broadcast Flash sale 50% off! 🔥
```

**AI-Powered Tools:**
```bash
/generate-desc <product>   # AI-generated product description
                           # Example: /generate-desc netflix
```

**Authorization:** Only WhatsApp numbers configured in `ADMIN_NUMBER_1`, `ADMIN_NUMBER_2`, `ADMIN_NUMBER_3` can execute admin commands.

---


---

**Related Guides:**
- 💻 [Installation Guide](./INSTALLATION_GUIDE.md)
- 📝 [Configuration Reference](./CONFIGURATION_REFERENCE.md)
- 🛠️ [Troubleshooting](./TROUBLESHOOTING_GUIDE.md)
