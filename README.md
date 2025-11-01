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

*You can easily customize products in `config.js`*

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
      id: 'netflix',
      name: 'Netflix Premium Account (1 Month)',
      price: 1,
      description: 'Full HD streaming, 4 screens',
      stock: 10
    },
    // Add more products...
  ]
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

## 🔒 Security Notes

- Never share your VPS credentials
- Keep WhatsApp session files secure (.wwebjs_auth folder)
- Regularly update Node.js and dependencies
- Use environment variables for sensitive data
- Enable firewall on your VPS

## 📝 File Structure

```
chatbot/
├── index.js              # Main application file
├── config.js             # Product catalog configuration
├── chatbotLogic.js       # Message processing logic
├── sessionManager.js     # Customer session management
├── package.json          # Dependencies
├── .gitignore           # Git ignore file
└── README.md            # Documentation
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