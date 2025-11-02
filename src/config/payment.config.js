/**
 * Payment Configuration
 * E-wallet and bank transfer account settings
 */

module.exports = {
  // E-wallet accounts
  ewallet: {
    dana: {
      enabled: process.env.DANA_ENABLED !== "false",
      number: process.env.DANA_NUMBER || "081234567890",
      name: process.env.DANA_NAME || "John Doe",
    },
    gopay: {
      enabled: process.env.GOPAY_ENABLED !== "false",
      number: process.env.GOPAY_NUMBER || "081234567890",
      name: process.env.GOPAY_NAME || "John Doe",
    },
    ovo: {
      enabled: process.env.OVO_ENABLED !== "false",
      number: process.env.OVO_NUMBER || "081234567890",
      name: process.env.OVO_NAME || "John Doe",
    },
    shopeepay: {
      enabled: process.env.SHOPEEPAY_ENABLED !== "false",
      number: process.env.SHOPEEPAY_NUMBER || "081234567890",
      name: process.env.SHOPEEPAY_NAME || "John Doe",
    },
  },

  // Bank accounts
  banks: {
    bca: {
      enabled: process.env.BCA_ENABLED !== "false",
      accountNumber: process.env.BCA_ACCOUNT || "1234567890",
      accountName: process.env.BCA_NAME || "John Doe",
      code: "BCA",
    },
    bni: {
      enabled: process.env.BNI_ENABLED !== "false",
      accountNumber: process.env.BNI_ACCOUNT || "1234567890",
      accountName: process.env.BNI_NAME || "John Doe",
      code: "BNI",
    },
    bri: {
      enabled: process.env.BRI_ENABLED !== "false",
      accountNumber: process.env.BRI_ACCOUNT || "1234567890",
      accountName: process.env.BRI_NAME || "John Doe",
      code: "BRI",
    },
    mandiri: {
      enabled: process.env.MANDIRI_ENABLED !== "false",
      accountNumber: process.env.MANDIRI_ACCOUNT || "1234567890",
      accountName: process.env.MANDIRI_NAME || "John Doe",
      code: "MANDIRI",
    },
  },

  // Payment gateway settings
  xendit: {
    apiKey: process.env.XENDIT_API_KEY || "",
    webhookUrl: process.env.WEBHOOK_URL || "",
    callbackToken: process.env.XENDIT_CALLBACK_TOKEN || "",
  },
};
