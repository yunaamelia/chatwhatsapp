# WhatsApp Shopping Chatbot Assistant 🛍️

A professional WhatsApp chatbot designed to help you serve customers with the fastest possible response times. Perfect for selling premium accounts and virtual credit cards at affordable prices.

## 🌟 Features

- ⚡ **Fast Response**: Instant automated replies to customer inquiries
- 🛒 **Shopping Cart**: Full shopping cart functionality
- 📦 **Product Catalog**: Manages premium accounts and virtual credit cards
- 💬 **Interactive Menu**: Easy-to-use menu system
- 👥 **Multi-Customer Support**: Handles multiple customers simultaneously
- 🔄 **Session Management**: Keeps track of each customer's shopping session
- 💾 **Lightweight**: Optimized for VPS with 1 vCPU and 2GB RAM
- 🔐 **Secure**: Uses WhatsApp's end-to-end encryption

## 📦 Products Included

### Premium Accounts ($1 each)

- Netflix Premium (1 Month)
- Spotify Premium (1 Month)
- YouTube Premium (1 Month)
- Disney+ Premium (1 Month)

### Virtual Credit Cards ($1 each)

- Basic VCC ($10 balance)
- Standard VCC ($25 balance)

_You can easily customize products in `config.js`_

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- A WhatsApp account
- VPS or local machine

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/benihutapea/chatbot.git
   cd chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the bot**

   ```bash
   npm start
   ```

4. **Scan QR Code**

   - A QR code will appear in your terminal
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices > Link a Device
   - Scan the QR code

5. **Done!** Your chatbot is now active and ready to serve customers! 🎉

## 💻 VPS Deployment (1 vCPU, 2GB RAM)

### Step-by-Step VPS Setup

1. **Connect to your VPS**

   ```bash
   ssh root@your-vps-ip
   ```

2. **Update system packages**

   ```bash
   apt update && apt upgrade -y
   ```

3. **Install Node.js**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   ```

4. **Install required dependencies**

   ```bash
   apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
   libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
   libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
   libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
   libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
   libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
   fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

5. **Clone and setup the bot**

   ```bash
   git clone https://github.com/benihutapea/chatbot.git
   cd chatbot
   npm install
   ```

6. **Run with PM2 (Process Manager)**

   ```bash
   npm install -g pm2
   pm2 start index.js --name whatsapp-bot
   pm2 save
   pm2 startup
   ```

7. **First-time setup**

   ```bash
   pm2 logs whatsapp-bot
   # Scan the QR code shown in logs
   ```

8. **Verify bot is running**
   ```bash
   pm2 status
   ```

### Useful PM2 Commands

```bash
# View logs
pm2 logs whatsapp-bot

# Restart bot
pm2 restart whatsapp-bot

# Stop bot
pm2 stop whatsapp-bot

# Remove bot from PM2
pm2 delete whatsapp-bot

# Monitor resource usage
pm2 monit
```

## 🎯 Usage

### Customer Commands

Once the bot is running, customers can interact using these commands:

- **menu** or **help** - Show main menu
- **browse** or **products** - View all products
- **cart** - View shopping cart
- **checkout** - Complete purchase
- **about** - Learn about your shop
- **support** - Contact support

### How Customers Shop

1. Customer sends any message to start
2. Bot shows main menu
3. Customer browses products
4. Customer types product name (e.g., "netflix")
5. Product is added to cart
6. Customer types "cart" to review
7. Customer types "checkout" to complete order
8. Customer receives payment instructions

## ⚙️ Configuration

### Customizing Products

Edit `config.js` to customize your product catalog:

```javascript
const products = {
  premiumAccounts: [
    {
      id: "netflix",
      name: "Netflix Premium Account (1 Month)",
      price: 1,
      description: "Full HD streaming, 4 screens",
      stock: 10,
    },
    // Add more products...
  ],
};
```

### Customizing Messages

Edit `chatbotLogic.js` to customize bot responses and messages.

## 📊 Performance Optimization

The bot is optimized for low-resource VPS:

- Single process mode for Chrome
- Minimal memory usage
- Session cleanup every 10 minutes
- Lightweight dependencies
- No unnecessary background processes

**Memory Usage**: ~300-500MB  
**CPU Usage**: ~5-15% (idle), ~30-50% (active)

## 🔧 Troubleshooting

### Bot won't start

```bash
# Check if Node.js is installed
node --version

# Reinstall dependencies
rm -rf node_modules
npm install
```

### QR code doesn't appear

```bash
# Check logs
pm2 logs whatsapp-bot

# Restart the bot
pm2 restart whatsapp-bot
```

### Out of memory on VPS

```bash
# Add swap space (if needed)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Bot disconnects frequently

- Ensure stable internet connection
- Check VPS resource usage: `htop`
- Restart bot: `pm2 restart whatsapp-bot`

## �‍💼 Admin Commands

Administrators can monitor and manage the bot using these commands:

### `/stats` - View Statistics

Shows comprehensive business metrics:

- Active sessions count
- Orders (today/week/month)
- Revenue in IDR
- Error rate
- Total log entries

Example output:

```
📊 Admin Statistics

👥 Active Sessions: 5
📦 Orders
• Today: 12
• This Week: 47
• This Month: 203

💰 Revenue (IDR)
• Today: Rp 1.890.000
• This Week: Rp 7.410.000
• This Month: Rp 32.070.000

⚠️ Error Rate: 2.15%
📝 Total Logs: 1,254
```

### `/status` - Check System Health

Shows system status:

- WhatsApp connection status
- Redis status (connected/fallback)
- Webhook server status
- Memory usage
- Uptime
- Log file statistics

Example output:

```
🔍 System Status

📱 WhatsApp: ✅ Connected
💾 Redis: ✅ Available
🌐 Webhook: ✅ Active

🧠 Memory Usage
• Used: 87.42 MB / 128.00 MB
• Utilization: 68.3%

⏱️ Uptime: 12h 34m
📋 Log Files
• Total: 15
• Size: 3.87 MB
• Retention: 7 days
```

### `/approve <order-id>` - Approve Payment

Manually approve pending orders:

```
/approve ORD-20250310-ABC123
```

### `/broadcast <message>` - Send Broadcast Message

Send message to all active customers:

```
/broadcast Flash sale! Diskon 50% untuk Netflix Premium hari ini! 🔥
```

**Authorization:** Only numbers in `ADMIN_NUMBER_1`, `ADMIN_NUMBER_2`, `ADMIN_NUMBER_3` can use admin commands.

## 📜 Customer Commands

### `history` - View Order History

Shows last 5 orders with details (order ID, date, products, price, status).

### Smart Product Search

Typo-tolerant fuzzy search using Levenshtein distance:

- "netfix" → "Netflix" ✅
- "spotfy" → "Spotify" ✅
- Partial matches work too!

## 🔍 Health Monitoring

The bot provides a health check endpoint for external monitoring:

### Endpoint

```
GET http://your-server:3000/health
```

### Response

```json
{
  "status": "ok",
  "timestamp": "2025-03-10T14:23:45.123Z",
  "uptime": {
    "seconds": 45278,
    "formatted": "12h 34m"
  },
  "memory": {
    "used": "87.42 MB",
    "total": "128.00 MB",
    "utilization": "68.3%"
  },
  "services": {
    "redis": "connected",
    "whatsapp": "connected"
  },
  "environment": "production"
}
```

### Monitoring Integration

**UptimeRobot:**

- Monitor Type: HTTP(s)
- URL: `http://your-server:3000/health`
- Keyword: `"status":"ok"`
- Interval: 5 minutes

**Pingdom:**

- Check Type: HTTP
- URL: `http://your-server:3000/health`
- Response Check: Contains `status`

**cURL:**

```bash
curl -H "Accept: application/json" http://localhost:3000/health
```

## 📋 Log Management

The bot automatically manages log files with rotation:

- **Retention:** 7 days (configurable via `LOG_RETENTION_DAYS`)
- **Rotation:** Daily at midnight
- **Location:** `logs/` directory

### Log Types

1. **orders-YYYY-MM-DD.log** - Order events
2. **payments-YYYY-MM-DD.log** - Payment transactions
3. **deliveries-YYYY-MM-DD.log** - Product deliveries
4. **admin-YYYY-MM-DD.log** - Admin actions
5. **errors-YYYY-MM-DD.log** - Error events
6. **security-YYYY-MM-DD.log** - Security events

### Manual Rotation

```bash
# Check log statistics
node -e "console.log(require('./lib/logRotationManager').getStats())"

# Force rotation (delete old logs)
node -e "require('./lib/logRotationManager').forceRotation()"
```

## �🔒 Security Notes

- Never share your VPS credentials
- Keep WhatsApp session files secure (.wwebjs_auth folder)
- Regularly update Node.js and dependencies
- Use environment variables for sensitive data
- Enable firewall on your VPS

## 📝 File Structure

```
chatbot/
├── index.js                    # Main application file
├── chatbotLogic.js             # Message processing logic
├── sessionManager.js           # Customer session management (Redis + fallback)
├── webhookServer.js            # Xendit webhook handler
├── productDelivery.js          # Automated product delivery
├── xenditService.js            # Xendit payment integration
├── qrisService.js              # QRIS payment generation (legacy)
├── config.js                   # Product catalog configuration
├── package.json                # Dependencies
├── .env                        # Environment variables
├── .gitignore                  # Git ignore file
├── README.md                   # Documentation
├── lib/
│   ├── inputValidator.js       # Rate limiting & input validation
│   ├── messageRouter.js        # Message routing logic
│   ├── paymentHandlers.js      # Payment method handlers
│   ├── paymentMessages.js      # Payment UI messages
│   ├── transactionLogger.js    # Audit logging
│   ├── uiMessages.js           # UI message templates
│   ├── redisClient.js          # Redis connection manager
│   └── logRotationManager.js   # Automatic log rotation
├── logs/                       # Transaction logs (auto-rotated)
├── payment_proofs/             # Customer payment proofs
├── payment_qris/               # Generated QRIS images
├── products_data/              # Product credentials
├── test-*.js                   # Test suites
└── .github/
    └── workflows/              # CI/CD pipelines
        ├── code-review.yml
        └── lint-and-test.yml
```

## 🤝 Support

For issues or questions:

- Check the troubleshooting section
- Review the code comments
- Open an issue on GitHub

## 📄 License

MIT License - Feel free to use and modify for your business!

## 🎉 Credits

Built with:

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp API
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) - QR code generation
- Node.js - Runtime environment

---

**Happy Selling! 🚀💰**
