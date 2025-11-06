# Critical Gotchas & Troubleshooting

## 1. Session Data Not Persisted

**Problem:** Restarting the bot clears all carts.

**Solution:** Use Redis for persistence:

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

## 2. Product Stock Not Enforced

**Problem:** Stock is decorative - no actual enforcement.

**Solution:**

- In `handleCheckout()`, check `product.stock > 0` before allowing purchase
- Decrement in `config.js`: `product.stock--` after successful payment
- Use Redis or DB for stock persistence: `await redis.decr(`stock:${productId}`)`
- Add stock notifications: alert admin when `stock < 3`

## 3. Payment is Manual

**Problem:** Product delivery requires manual intervention.

**Solution:** To automate delivery:

- On payment confirmation, call `deliverProduct(customerId, productId)`
- For accounts: read credentials from `products_data/${productId}.txt` (one per line)
- Send to customer: `client.sendMessage(customerId, 'Your credentials:\nEmail: ...\nPassword: ...')`
- For VCC: integrate with card issuer API or send pre-generated card details
- Log delivery: append to `deliveries.log` for accounting

## 4. WhatsApp Rate Limits

**Problem:** Sending too many messages can trigger WhatsApp ban.

**Solution:** Implemented! Rate limiting: 20 messages/minute per customer with auto-reset. Protects from bans.

Current implementation in `sessionManager.js`:

```javascript
canSendMessage(customerId) {
  const limit = 20; // messages per minute
  // ... rate limiting logic
}
```

## 5. Group Messages Ignored

**Behavior:** Bot only responds to direct messages (1:1 chats).

**Reason:** Group messages are filtered in `MessageRouter`:

```javascript
shouldIgnore(message) {
  return message.from.includes("@g.us") || message.from === "status@broadcast";
}
```

**To enable group support:** Remove the `@g.us` check (not recommended for shopping bots).

## 6. Media Messages Require Special Handling

**Issue:** Images, documents, audio need different processing.

**Solution:**

- `message.hasMedia` must be checked separately
- Download with `await message.downloadMedia()`
- Send with `MessageMedia.fromFilePath(path)` or `MessageMedia.fromUrl(url)`
- Supports images (QRIS), documents (invoices), audio (voice notes)

## 7. WhatsApp Web Session Can Expire

**Issue:** Session expires, bot stops responding.

**Solution:** Monitor `disconnected` event:

```javascript
client.on("disconnected", async (reason) => {
  console.log("❌ Client disconnected:", reason);

  // Implement auto-reconnect with exponential backoff
  setTimeout(() => {
    client.initialize();
  }, 5000);
});
```

**Backup `.wwebjs_auth/` directory daily** - contains session data.

## 8. Message Order Not Guaranteed

**Issue:** WhatsApp can deliver messages out of order under poor network.

**Solution:** Use message IDs for idempotency:

```javascript
const msgId = message.id._serialized;

// Check if already processed
if (processedMessages.has(msgId)) {
  return; // Skip duplicate
}

processedMessages.add(msgId);
// Process message...
```

## 9. File Size Limit (700 lines)

**Issue:** GitHub Actions blocks files > 700 lines in `src/`.

**Solution:** Use handler delegation pattern:

1. Check file size FIRST before adding code
2. If >650 lines, create new `*Handler.js` file
3. Delegate from main handler

## 10. AI Rate Limit Exceeded

**Issue:** Customer sees "AI Rate Limit" message too often.

**Solution:** Adjust in `src/config/ai.config.js`:

```javascript
rateLimit: {
  maxCallsPerHour: 10,  // Increase from 5
}
```

Or check if message is truly shop-related (improve RelevanceFilter).

## Troubleshooting Common Issues

### Bot Not Responding

**Check:**

1. Is bot running? `pm2 status whatsapp-bot`
2. Check logs: `pm2 logs whatsapp-bot`
3. Is WhatsApp Web session valid?
4. Check rate limiting status

### Tests Failing

**Check:**

1. Run `npm run lint` first
2. Check for mock setup issues
3. Verify test file structure
4. Check for hardcoded values

### Payment Not Working

**Check:**

1. Xendit API key valid?
2. Webhook endpoint accessible?
3. Check webhook logs
4. Verify order ID format

### AI Not Working

**Check:**

1. Is `AI_ENABLE=true` in .env?
2. Is `GOOGLE_API_KEY` set?
3. Check AI service logs
4. Verify message relevance (RelevanceFilter)

### Session Lost

**Check:**

1. Is Redis running?
2. Check session expiry (default 30 min)
3. Verify session storage implementation
