/**
 * WhatsApp Shopping Chatbot Assistant
 * Main application file
 * 
 * This chatbot helps customers browse and purchase premium accounts
 * and virtual credit cards with fast response times.
 * 
 * Optimized for VPS with 1 vCPU and 2GB RAM
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const SessionManager = require('./sessionManager');
const ChatbotLogic = require('./chatbotLogic');

// Initialize session manager
const sessionManager = new SessionManager();

// Initialize chatbot logic
const chatbotLogic = new ChatbotLogic(sessionManager);

// Create WhatsApp client with optimized settings for low-resource VPS
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Generate QR Code for authentication
client.on('qr', (qr) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 SCAN QR CODE WITH WHATSAPP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    qrcode.generate(qr, { small: true });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Waiting for authentication...');
});

// Client is ready
client.on('ready', () => {
    console.log('\n✅ WhatsApp Shopping Chatbot is ready!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 Bot Status: ACTIVE');
    console.log('💬 Ready to serve customers');
    console.log('⚡ Fast response mode enabled');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Clean up inactive sessions every 10 minutes
    setInterval(() => {
        sessionManager.cleanupSessions();
        console.log('🧹 Cleaned up inactive sessions');
    }, 10 * 60 * 1000);
});

// Handle incoming messages
client.on('message', async (message) => {
    try {
        // Get customer ID (phone number)
        const customerId = message.from;
        
        // Ignore group messages and status updates
        if (message.from.includes('@g.us') || message.from === 'status@broadcast') {
            return;
        }

        // Get message content
        const messageBody = message.body;
        
        // Log incoming message
        console.log(`📩 Message from ${customerId}: ${messageBody}`);
        
        // Process message and get response
        const response = chatbotLogic.processMessage(customerId, messageBody);
        
        // Send response
        await message.reply(response);
        
        // Log outgoing response
        console.log(`📤 Sent response to ${customerId}`);
        
    } catch (error) {
        console.error('❌ Error handling message:', error);
        
        // Send user-friendly error message with support contact
        try {
            await message.reply('⚠️ Sorry, something went wrong processing your request.\n\nPlease try again or type *support* for help.\n\nIf the problem persists, please contact our support team.');
        } catch (replyError) {
            console.error('❌ Error sending error message:', replyError);
        }
    }
});

// Handle authentication
client.on('authenticated', () => {
    console.log('✅ Authentication successful!');
});

// Handle authentication failure
client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
});

// Handle disconnection
client.on('disconnected', (reason) => {
    console.log('⚠️ Client disconnected:', reason);
    console.log('Attempting to reconnect...');
});

// Handle errors
client.on('error', (error) => {
    console.error('❌ Client error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n⚠️ Shutting down gracefully...');
    await client.destroy();
    console.log('✅ Client destroyed. Goodbye!');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n⚠️ Shutting down gracefully...');
    await client.destroy();
    console.log('✅ Client destroyed. Goodbye!');
    process.exit(0);
});

// Start the client
console.log('🚀 Starting WhatsApp Shopping Chatbot...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚙️ Optimized for: 1 vCPU, 2GB RAM');
console.log('📦 Products: Premium Accounts & Virtual Cards');
console.log('💰 Price: $1 per item');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

client.initialize();
