# Integration Points

## WhatsApp Web Protocol

- Uses `whatsapp-web.js` with `LocalAuth` strategy (stores session in `.wwebjs_auth/`)
- Two authentication methods:
  - **QR Code** (default): Scan QR code with WhatsApp phone app
  - **Pairing Code**: Enter 8-digit code in WhatsApp Linked Devices (set `USE_PAIRING_CODE=true` and `PAIRING_PHONE_NUMBER` in .env)
- Pairing code format: phone number without + or spaces (e.g., `6281234567890` for Indonesia)
- Code expires every 3 minutes and auto-refreshes
- Group messages and status updates are ignored in message handler

## Payment Integration Patterns

Three payment tiers supported:

### 1. Automatic QRIS (Recommended for scale)

- Integrate QRIS payment gateway API (e.g., Midtrans, Xendit, Duitku)
- In `handleCheckout()`: generate unique QRIS code per order, send image via `message.reply(MessageMedia.fromUrl(qrisUrl))`
- Add new step `'awaiting_payment'` to session state
- Poll payment status via webhook or polling interval
- Auto-deliver product on payment confirmation
- Store order ID in session: `session.orderId = response.order_id`

### 2. Semi-Automatic QRIS (Static QR per e-wallet)

- Store static QRIS images in `/assets/qris/` (dana.jpg, ovo.jpg, gopay.jpg, shopeepay.jpg)
- In `handleCheckout()`: ask customer to select e-wallet (add `'select_payment'` step)
- Send corresponding static QR: `MessageMedia.fromFilePath('./assets/qris/dana.jpg')`
- Customer sends payment proof screenshot
- Add message handler for image messages: check `message.hasMedia` and `message.type === 'image'`
- Forward to admin or store in `/payment_proofs/` for manual verification
- Admin sends confirmation command to trigger delivery

### 3. Manual (Current implementation)

- Text-based payment instructions in `handleCheckout()`
- Customer contacts admin with proof
- No automation

## Payment Integration Example (Semi-Auto)

```javascript
// In chatbotLogic.js, add to handleCheckout()
if (message === "qris") {
  this.sessionManager.setStep(customerId, "upload_proof");
  return "Please send your payment proof screenshot.";
}

// In index.js message handler, check for images
if (message.hasMedia && message.type === "image") {
  const step = sessionManager.getStep(message.from);
  if (step === "upload_proof") {
    const media = await message.downloadMedia();
    // Save: fs.writeFileSync(`./proofs/${Date.now()}.jpg`, media.data, 'base64');
    await message.reply(
      "✅ Payment proof received! Admin will verify within 5-15 minutes."
    );
    // Notify admin via another WhatsApp number or webhook
  }
}
```

## Xendit Integration

Current implementation uses Xendit for QRIS:

- `services/xenditService.js` - Xendit API wrapper
- `services/qrisService.js` - QRIS generation and management
- Webhook endpoint: `/webhook/xendit` in `services/webhookServer.js`
- Auto-delivery on payment confirmation
- Payment reminders via cron job

## Redis Integration

For session persistence and rate limiting:

```javascript
// Install: npm install redis
const redis = require('redis');
const client = redis.createClient();

// In sessionManager.js, replace Map with Redis:
async getSession(customerId) {
  const data = await client.get(`session:${customerId}`);
  return data ? JSON.parse(data) : this.createSession(customerId);
}

async setSession(customerId, session) {
  await client.set(`session:${customerId}`, JSON.stringify(session), {
    EX: 1800 // 30 min TTL
  });
}
```

Redis auto-expires sessions and survives bot restarts.

## Media Messages

**Media messages require special handling:**

- `message.hasMedia` must be checked separately
- Download with `await message.downloadMedia()`
- Send with `MessageMedia.fromFilePath(path)` or `MessageMedia.fromUrl(url)`
- Supports images (QRIS), documents (invoices), audio (voice notes for support)

Example:

```javascript
if (message.hasMedia) {
  const media = await message.downloadMedia();

  if (message.type === "image") {
    // Handle payment proof
    fs.writeFileSync(`./proofs/${Date.now()}.jpg`, media.data, "base64");
  }
}
```

## Multi-Language Support

Create `messages/` directory with language files:

- `messages/id.js` - Bahasa Indonesia (default)
- `messages/en.js` - English

Structure:

```javascript
// messages/id.js
module.exports = {
  welcome: "👋 *Selamat datang di Premium Shop!*",
  menu: "*Apa yang ingin Anda lakukan?*",
  browse: "Jelajahi Produk",
  cart: "Lihat Keranjang",
  // ...
};
```

Store language preference in session: `session.language = 'id'`

Load messages: `const msg = require(`./messages/${session.language}.js`);`

Detect language from first message or add `/language` command
