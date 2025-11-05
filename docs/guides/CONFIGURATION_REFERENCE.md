# WhatsApp Shopping Chatbot - Configuration Reference

**Last Updated:** November 6, 2025
**Purpose:** Complete environment variables and configuration guide

---

### 🔧 Configuration Guide

#### Critical Environment Variables

**Business & Contact Settings:**
```bash
SHOP_NAME="Premium Digital Shop"      # Your store display name
CONTACT_WHATSAPP="6281234567890"       # Customer support number
CONTACT_EMAIL="support@example.com"    # Support email address
WORKING_HOURS="24/7"                   # Business hours display
```

**Admin Authorization:**
```bash
ADMIN_NUMBER_1="6281234567890"         # Primary admin (required)
ADMIN_NUMBER_2="6289876543210"         # Secondary admin (optional)
ADMIN_NUMBER_3="6285551234567"         # Tertiary admin (optional)
```

**Session & Performance:**
```bash
SESSION_TTL=1800                       # Session timeout in seconds (30 min)
RATE_LIMIT_MAX=20                      # Max messages per minute per customer
RATE_LIMIT_WINDOW=60000                # Rate limit window in ms (1 minute)
CLEANUP_INTERVAL=10                    # Session cleanup interval (minutes)
```

**Manual Payment Accounts:**
```bash
# E-Wallet Configuration
DANA_NUMBER=081234567890
DANA_NAME="John Doe"
DANA_ENABLED=true

GOPAY_NUMBER=081234567890
GOPAY_NAME="John Doe"
GOPAY_ENABLED=true

OVO_NUMBER=081234567890
OVO_NAME="John Doe"
OVO_ENABLED=true

SHOPEEPAY_NUMBER=081234567890
SHOPEEPAY_NAME="John Doe"
SHOPEEPAY_ENABLED=true

# Bank Account Configuration
BCA_ACCOUNT=1234567890
BCA_NAME="John Doe"
BCA_ENABLED=true

BNI_ACCOUNT=1234567890
BNI_NAME="John Doe"
BNI_ENABLED=true

BRI_ACCOUNT=1234567890
BRI_NAME="John Doe"
BRI_ENABLED=true

MANDIRI_ACCOUNT=1234567890
MANDIRI_NAME="John Doe"
MANDIRI_ENABLED=true
```

**Automated Payment (Xendit API):**
```bash
XENDIT_SECRET_KEY=xnd_production_...           # From dashboard.xendit.co
XENDIT_WEBHOOK_TOKEN=random_secure_token_32+   # Generate random token
WEBHOOK_URL=https://yourserver.com             # Public webhook endpoint
USD_TO_IDR_RATE=15800                          # Currency conversion rate
```

**AI Configuration (Gemini):**
```bash
AI_ENABLE=true                                 # Enable/disable AI features
GOOGLE_API_KEY=AIzaSyD...                      # From aistudio.google.com
AI_MODEL=gemini-2.0-flash-exp                  # Model version
AI_TEMPERATURE=0.3                             # Creativity (0.0-1.0)
AI_MAX_TOKENS=500                              # Max response length
AI_RATE_LIMIT_HOURLY=5                         # API calls per hour per customer
AI_RATE_LIMIT_DAILY=20                         # API calls per day per customer
AI_COST_ALERT_THRESHOLD=5.0                    # Alert threshold in USD
AI_MONTHLY_BUDGET=50.0                         # Monthly budget limit in USD
```

#### Product Customization

Edit `src/config/products.config.js`:

```javascript
const products = {
  premiumAccounts: [
    {
      id: 'netflix',                           // Unique product ID (URL-safe)
      name: 'Netflix Premium Account (1 Month)',
      price: 1,                                // Price in USD
      description: 'Full HD streaming, 4 screens simultaneously',
      stock: 10,                               // Default stock quantity
      category: 'Premium Accounts'
    },
    // Add more products here...
  ],
  virtualCards: [
    {
      id: 'basic-vcc',
      name: 'Basic Virtual Credit Card ($10)',
      price: 1,
      description: 'Valid for 1 month, $10 balance',
      stock: 5,
      category: 'Virtual Credit Cards'
    }
  ]
};

module.exports = { products, DEFAULT_STOCK: 10, VCC_STOCK: 5 };
```

---


---

**Related Guides:**
- 💻 [Installation Guide](./INSTALLATION_GUIDE.md)
- 📱 [User Guide](./USER_GUIDE.md)
- 🏗️ [Architecture Guide](./ARCHITECTURE_GUIDE.md)
