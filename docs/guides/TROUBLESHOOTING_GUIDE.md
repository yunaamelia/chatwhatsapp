# WhatsApp Shopping Chatbot - Troubleshooting Guide

**Last Updated:** November 6, 2025
**Purpose:** Common issues and solutions

---

### 🛠️ Troubleshooting

#### Bot Fails to Start

**Error: "Cannot find module"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: "Protocol error" or "Target closed"**
```bash
# Solution: Clear WhatsApp authentication cache
rm -rf .wwebjs_auth .wwebjs_cache
npm start
```

**Error: "ECONNREFUSED" (Redis)**
```bash
# Solution: Start Redis or disable Redis in code
sudo systemctl start redis-server

# Or use in-memory fallback (automatic)
# Bot will log: "Using in-memory storage (no persistence)"
```

#### QR Code Issues

**QR Code Doesn't Appear:**
```bash
# Check terminal output
pm2 logs whatsapp-bot --lines 100

# Try pairing code method instead
# Edit .env:
USE_PAIRING_CODE=true
PAIRING_PHONE_NUMBER=6281234567890

# Restart
pm2 restart whatsapp-bot
```

**QR Code Expires Too Quickly:**
```bash
# Solution: Use pairing code method (more reliable)
# Set in .env:
USE_PAIRING_CODE=true
PAIRING_PHONE_NUMBER=your_number_here
```

#### Memory and Performance

**Out of Memory on VPS:**
```bash
# Add 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

**High CPU Usage:**
```bash
# Check for runaway processes
htop

# Restart bot
pm2 restart whatsapp-bot

# Check logs for errors
pm2 logs whatsapp-bot --lines 200
```

#### Payment & Webhook Issues

**Webhook Not Receiving Events:**
```bash
# Verify webhook server is running
curl http://localhost:3000/health

# Check firewall allows port 3000
sudo ufw status
sudo ufw allow 3000/tcp

# Verify Xendit webhook URL configuration
# Should match: https://your-server.com/webhook/xendit

# Check webhook logs
pm2 logs whatsapp-bot --lines 100 | grep webhook
```

**QRIS Not Generating:**
```bash
# Verify Xendit credentials in .env
echo $XENDIT_SECRET_KEY

# Test Xendit API connectivity
curl -X GET https://api.xendit.co/v2/balance \
  -u $XENDIT_SECRET_KEY:

# Check bot logs for Xendit errors
pm2 logs whatsapp-bot | grep -i xendit
```

---

### 📝 Development Workflow

#### Code Quality Tools

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Run all checks (lint + test)
npm run check

# Pre-deployment validation
npm run deploy:check
```

#### Available NPM Scripts

```bash
npm start                  # Start bot in production mode
npm run dev                # Development mode (alias for start)
npm test                   # Run all tests with coverage
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:watch         # Watch mode for TDD
npm run test:coverage      # Detailed coverage report
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix ESLint issues
npm run check              # Lint + Test (pre-commit)
npm run deploy:check       # Full pre-deployment validation
```

#### Contributing Guidelines

1. **Fork Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/chatbkt.git
   cd chatbkt
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Maintain file size limit (<700 lines)
   - Add tests for new features
   - Update documentation

4. **Validate Changes**
   ```bash
   npm run check      # Must pass
   npm test           # All tests must pass
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add amazing new feature"
   git push origin feature/amazing-new-feature
   ```

6. **Open Pull Request**
   - Describe changes clearly
   - Reference any related issues
   - Wait for CI/CD checks to pass

**Code Standards:**
- ESLint must pass with 0 errors, 0 warnings
- Minimum 80% test coverage maintained
- File size limit: 700 lines per .js file
- All new features require tests
- JSDoc comments for public methods

---

### 🔒 Security Best Practices

#### Essential Security Measures

1. **Environment Variables**
   - Never commit `.env` file to Git
   - Use strong, random webhook tokens (32+ characters)
   - Rotate API keys periodically

2. **WhatsApp Session Security**
   - Backup `.wwebjs_auth/` folder securely
   - Never share session files publicly
   - Use dedicated WhatsApp number for bot

3. **Server Hardening**
   ```bash
   # Enable firewall
   sudo ufw enable
   sudo ufw allow 22/tcp      # SSH only
   sudo ufw allow 3000/tcp    # Webhook (if needed)
   
   # Disable root SSH login
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   
   # Restart SSH
   sudo systemctl restart sshd
   ```

4. **Regular Updates**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Update Node.js dependencies
   npm update
   npm audit fix
   ```

5. **Rate Limiting** (Built-in)
   - 20 messages/minute per customer
   - 5 orders/day per customer
   - 1-minute cooldown after errors

6. **Input Validation** (Built-in)
   - All inputs sanitized
   - XSS prevention
   - SQL injection prevention
   - Null byte removal

7. **Logging Security**
   - No passwords in logs
   - No API keys in logs
   - Sensitive data redacted automatically

#### Security Checklist

- [ ] `.env` file properly configured and not in Git
- [ ] Admin numbers properly set in environment
- [ ] Firewall configured (UFW or iptables)
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] System packages updated
- [ ] Node.js dependencies audited (`npm audit`)
- [ ] Webhook token is strong and random
- [ ] Redis password set (if exposed)
- [ ] SSL/TLS for webhook endpoint
- [ ] Regular backups of `.wwebjs_auth/`

---

### 📄 License

**MIT License**

Copyright (c) 2025 WhatsApp Shopping Chatbot Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

---

### 🎉 Credits & Technologies

**Core Technologies:**
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp Web API wrapper
- [Puppeteer](https://pptr.dev/) - Headless Chrome automation
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express.js](https://expressjs.com/) - Webhook web server
- [Redis](https://redis.io/) - Session persistence
- [Jest](https://jestjs.io/) - Testing framework

**Payment & AI:**
- [Xendit](https://www.xendit.co/) - Indonesian payment gateway
- [Google Gemini](https://ai.google.dev/) - AI-powered features
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI integration toolkit

**DevOps & Tooling:**
- [PM2](https://pm2.keymetrics.io/) - Process management
- [ESLint](https://eslint.org/) - Code linting
- [GitHub Actions](https://github.com/features/actions) - CI/CD pipelines

**Developed By:** Community Contributors  
**Repository:** https://github.com/angga13142/chatbkt  
**Maintainer:** angga13142

---

### 📞 Support & Resources

**Documentation:**
- Main README: `/README.md`
- API Documentation: `/docs`
- Code Patterns: `/.github/memory/code-patterns.md`
- Testing Guide: `/.github/memory/test-status.md`

**Community:**
- GitHub Issues: Report bugs and request features
- Discussions: Q&A and community support
- Pull Requests: Contribute improvements

**Professional Support:**
- Email: Configure in `.env` (`CONTACT_EMAIL`)
- WhatsApp: Configure in `.env` (`CONTACT_WHATSAPP`)

---

**Happy Selling! 🚀💰**

_Last Updated: November 5, 2025_

---


---

**Need More Help?**
- 📝 [Configuration Reference](./CONFIGURATION_REFERENCE.md)
- 💻 [Installation Guide](./INSTALLATION_GUIDE.md)
- 🔒 [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
