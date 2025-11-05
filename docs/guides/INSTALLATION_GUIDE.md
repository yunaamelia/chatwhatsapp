# WhatsApp Shopping Chatbot - Installation Guide

**Last Updated:** November 6, 2025
**Source:** Extracted from COMPREHENSIVE_DOCUMENTATION.md

---

### 🚀 Prerequisites

**Required Software:**
- **Node.js**: Version 14+ (v18 LTS recommended for best performance)
- **WhatsApp Account**: Personal or business account for bot linking
- **VPS or Local Machine**: 
  - Minimum: 1 vCPU, 2GB RAM, 10GB storage
  - Recommended: 2 vCPU, 4GB RAM, 20GB SSD storage

**Supported Operating Systems:**
- Linux: Ubuntu 20.04+, Debian 11+, CentOS 8+
- macOS: 10.15 Catalina or newer
- Windows: 10/11 with WSL2 (recommended) or native Node.js

**Optional But Recommended:**
- **Redis Server**: For session persistence (auto-fallback to in-memory if unavailable)
- **PM2**: Process manager for production deployments and auto-restart
- **Google AI API Key**: For AI-powered features (Gemini 2.5 Flash Lite)
- **Xendit Account**: For automated QRIS and e-wallet payment processing

---


---

### 💻 Installation

#### Quick Start (Development - 5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/angga13142/chatbkt.git
cd chatbkt

# 2. Install all dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
nano .env  # Edit with your settings

# 4. Start the bot
npm start
```

#### Detailed Installation Steps

**Step 1: Clone Repository**
```bash
git clone https://github.com/angga13142/chatbkt.git
cd chatbkt
```

**Step 2: Install Node.js Dependencies**
```bash
# Development mode (includes testing tools)
npm install

# Production mode (optimized, no devDependencies)
npm install --production
```

**Step 3: Environment Configuration**

Create `.env` from template:
```bash
cp .env.example .env
```

Essential configuration in `.env`:
```bash
# Shop Information
SHOP_NAME="Your Premium Shop"
CONTACT_WHATSAPP="6281234567890"
CONTACT_EMAIL="support@yourshop.com"

# Admin Access (at least one required)
ADMIN_NUMBER_1="6281234567890"
ADMIN_NUMBER_2=""
ADMIN_NUMBER_3=""

# Redis Session Persistence (Optional)
REDIS_URL=redis://localhost:6379
SESSION_TTL=1800

# Payment Processing (Optional - Xendit)
XENDIT_SECRET_KEY=xnd_production_...
XENDIT_WEBHOOK_TOKEN=your_secure_random_token

# AI Features (Optional - Gemini)
AI_ENABLE=true
GOOGLE_API_KEY=AIzaSyD...
```

**Step 4: Start the Bot**

**Method A: Direct Start (Development)**
```bash
npm start
# or
npm run dev
```

**Method B: PM2 (Production - Recommended)**
```bash
# Install PM2 globally
npm install -g pm2

# Start bot with PM2
pm2 start index.js --name whatsapp-bot

# Save configuration
pm2 save

# Enable auto-start on system boot
pm2 startup
```

**Step 5: Link WhatsApp Account**

**Option A: QR Code Scanning (Default)**
1. QR code appears in terminal/console
2. Open WhatsApp on your phone
3. Navigate to: Settings → Linked Devices → Link a Device
4. Scan the displayed QR code with your phone

**Option B: Pairing Code Method**
1. Configure in `.env`:
   ```bash
   USE_PAIRING_CODE=true
   PAIRING_PHONE_NUMBER=6281234567890  # Your WhatsApp number
   ```
2. Restart bot to receive 8-digit pairing code
3. In WhatsApp: Settings → Linked Devices → Link with phone number
4. Enter the displayed pairing code

---


---

### 🖥️ VPS Deployment

#### Automated Setup Script (Recommended)

```bash
# Download and execute installation script
wget https://raw.githubusercontent.com/angga13142/chatbkt/main/install-vps.sh
chmod +x install-vps.sh
sudo ./install-vps.sh
```

**Script automatically performs:**
- System package updates (apt update && apt upgrade)
- Node.js 18 LTS installation
- Chromium browser and dependencies installation
- UFW firewall configuration
- PM2 process manager installation
- Repository cloning and dependency installation

#### Manual VPS Installation

**Step 1: Connect to Server**
```bash
ssh root@your-vps-ip-address
```

**Step 2: System Update**
```bash
apt update && apt upgrade -y
```

**Step 3: Install Node.js 18 LTS**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

**Step 4: Install Chromium Dependencies**
```bash
apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

**Step 5: Install Redis (Optional - Session Persistence)**
```bash
apt install -y redis-server

# Enable and start Redis
systemctl enable redis-server
systemctl start redis-server

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

**Step 6: Clone and Setup Bot**
```bash
# Clone repository
git clone https://github.com/angga13142/chatbkt.git
cd chatbkt

# Install dependencies (skip Chromium download)
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

**Step 7: Configure Environment**
```bash
cp .env.example .env
nano .env  # Edit configuration with your settings
```

**Step 8: Install PM2 and Start Bot**
```bash
# Install PM2 globally
npm install -g pm2

# Start bot with PM2
pm2 start index.js --name whatsapp-bot

# Save PM2 process list
pm2 save

# Enable PM2 startup on system boot
pm2 startup
# Copy and run the command provided by PM2
```

**Step 9: Firewall Configuration (Optional)**
```bash
# Enable UFW if not already enabled
ufw allow 22/tcp       # SSH access
ufw allow 3000/tcp     # Webhook server (if using Xendit)
ufw enable
ufw status
```

#### PM2 Process Management

```bash
# View real-time logs
pm2 logs whatsapp-bot

# Monitor resource usage
pm2 monit

# Restart bot
pm2 restart whatsapp-bot

# Stop bot
pm2 stop whatsapp-bot

# View detailed status
pm2 status

# View process information
pm2 show whatsapp-bot

# Delete from PM2 (doesn't delete files)
pm2 delete whatsapp-bot

# Update PM2
npm install -g pm2@latest
pm2 update
```

---

### 🧪 Testing & Quality Assurance

The project includes comprehensive test coverage with Jest testing framework:

```bash
# Run all tests with coverage report
npm test

# Run tests with detailed coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode for development
npm run test:watch

# Pre-commit validation (lint + test)
npm run check
```

**Test Statistics:**
- **Total Test Suites:** 885 tests across 50+ test files
- **Passing Tests:** 817 (92% pass rate)
- **Code Coverage:** 85%+ across all modules
- **Test Categories:** Unit, Integration, End-to-End (E2E)

**Test Structure:**
```
tests/
├── unit/                    # Isolated component tests
│   ├── core/               # Core system tests
│   ├── handlers/           # Handler logic tests
│   ├── services/           # Service layer tests
│   └── utils/              # Utility function tests
├── integration/            # Multi-component interaction tests
│   ├── checkout-flow.test.js
│   ├── admin-commands.test.js
│   └── payment-flow.test.js
└── e2e/                    # Complete user journey tests
    └── complete-purchase.test.js
```

---

### 🔍 Health Monitoring

#### Health Check Endpoint

The bot exposes a REST API endpoint for health monitoring at `/health`:

```bash
# Check bot health status
curl http://localhost:3000/health
```

**Response Format:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T15:42:38.123Z",
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
    "whatsapp": "connected",
    "webhook": "active"
  },
  "environment": "production"
}
```

#### Integration with Monitoring Services

**UptimeRobot Configuration:**
- Monitor Type: HTTP(s)
- URL to Monitor: `http://your-server:3000/health`
- Keyword to Look For: `"status":"ok"`
- Check Interval: 5 minutes
- Alerting: Email/SMS/Webhook

**Pingdom Setup:**
- Check Type: HTTP
- URL: `http://your-server:3000/health`
- Response Check: Body contains `status`
- Check Interval: 1 minute

**Healthchecks.io Integration:**
```bash
# Add to crontab for periodic pinging
*/5 * * * * curl -fsS --retry 3 http://localhost:3000/health > /dev/null || curl -fsS https://hc-ping.com/your-uuid-here/fail
```

---

### 📊 Performance Metrics

#### Resource Usage (VPS: 1 vCPU, 2GB RAM)

**Memory Consumption:**
- Idle: 300-400 MB
- Light Load (1-10 customers): 400-600 MB
- Heavy Load (50+ customers): 600-900 MB

**CPU Utilization:**
- Idle: 5-10%
- Active Conversations: 20-40%
- Peak (message bursts): 50-70%

**Disk Space:**
- Application Code: ~50 MB
- Node Modules: ~450 MB
- Logs (7-day retention): ~100-500 MB
- Total Recommended: 10 GB minimum, 20 GB recommended

**Network Bandwidth:**
- Per Customer (active): ~10-50 KB/s
- 100 Concurrent Customers: ~1-5 MB/s

#### Scaling Capacity

**Single Instance (1 vCPU, 2GB RAM):**
- Concurrent Active Sessions: 100-200 customers
- Messages Per Second: 20-30 messages
- Database Connections: 5-10 Redis connections

**Recommended Upgrades:**
- 2 vCPU, 4GB RAM: 500+ concurrent customers
- 4 vCPU, 8GB RAM: 1000+ concurrent customers
- Add Redis cluster for horizontal scaling

---


---

**Next Steps:**
- 📝 [Configuration Reference](./CONFIGURATION_REFERENCE.md)
- 📱 [User Guide](./USER_GUIDE.md)
- 🛠️ [Troubleshooting](./TROUBLESHOOTING_GUIDE.md)
