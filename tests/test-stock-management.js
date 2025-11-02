/**
 * Test Stock Management Feature
 */

const ChatbotLogic = require("../chatbotLogic");
const SessionManager = require("../sessionManager");
const { getProductById } = require("../config");

// Set admin number for testing
process.env.ADMIN_NUMBER_1 = "6281234567890";

async function testStockManagement() {
  console.log("🧪 Testing Stock Management Feature\n");

  const sessionManager = new SessionManager();
  await sessionManager.initialize();

  const chatbot = new ChatbotLogic(sessionManager);
  const adminId = "6281234567890@c.us";
  const nonAdminId = "6289999999999@c.us";

  let passCount = 0;
  let failCount = 0;

  // Test 1: View all stock
  console.log("--- Test 1: View All Stock ---");
  try {
    const response = await chatbot.processMessage(adminId, "/stock");
    if (response.includes("STOCK INVENTORY") && response.includes("netflix")) {
      console.log("✅ PASS: Stock inventory displayed");
      passCount++;
    } else {
      console.log("❌ FAIL: Stock inventory not displayed correctly");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 2: Update stock for netflix
  console.log("\n--- Test 2: Update Stock (netflix to 50) ---");
  try {
    const response = await chatbot.processMessage(adminId, "/stock netflix 50");
    const product = getProductById("netflix");

    if (response.includes("Stok Berhasil Diupdate") && product.stock === 50) {
      console.log("✅ PASS: Stock updated successfully");
      console.log(`   Netflix stock: ${product.stock}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Stock not updated");
      console.log("Response:", response);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 3: Invalid format (missing quantity)
  console.log("\n--- Test 3: Invalid Format (missing quantity) ---");
  try {
    const response = await chatbot.processMessage(adminId, "/stock netflix");
    if (response.includes("Format Salah")) {
      console.log("✅ PASS: Format error caught");
      passCount++;
    } else {
      console.log("❌ FAIL: Should show format error");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 4: Invalid product ID
  console.log("\n--- Test 4: Invalid Product ID ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/stock invalid-id 100"
    );
    if (response.includes("Produk tidak ditemukan")) {
      console.log("✅ PASS: Invalid product ID caught");
      passCount++;
    } else {
      console.log("❌ FAIL: Should show product not found error");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 5: Invalid quantity (negative)
  console.log("\n--- Test 5: Invalid Quantity (negative) ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/stock spotify -10"
    );
    if (response.includes("Jumlah tidak valid")) {
      console.log("✅ PASS: Negative quantity rejected");
      passCount++;
    } else {
      console.log("❌ FAIL: Should reject negative quantity");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 6: Non-admin access
  console.log("\n--- Test 6: Non-Admin Access ---");
  try {
    const response = await chatbot.processMessage(
      nonAdminId,
      "/stock netflix 100"
    );
    console.log("   Response:", response);
    if (
      response.includes("Tidak diizinkan") ||
      response.includes("tidak memiliki akses") ||
      response.includes("Unauthorized")
    ) {
      console.log("✅ PASS: Non-admin blocked");
      passCount++;
    } else {
      console.log("❌ FAIL: Non-admin should be blocked");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 7: Update multiple products
  console.log("\n--- Test 7: Update Multiple Products ---");
  try {
    await chatbot.processMessage(adminId, "/stock spotify 30");
    await chatbot.processMessage(adminId, "/stock youtube 40");
    await chatbot.processMessage(adminId, "/stock disney 35");

    const spotify = getProductById("spotify");
    const youtube = getProductById("youtube");
    const disney = getProductById("disney");

    if (spotify.stock === 30 && youtube.stock === 40 && disney.stock === 35) {
      console.log("✅ PASS: Multiple products updated");
      console.log(`   Spotify: ${spotify.stock}`);
      console.log(`   YouTube: ${youtube.stock}`);
      console.log(`   Disney: ${disney.stock}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Multiple products not updated correctly");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 8: Set stock to zero
  console.log("\n--- Test 8: Set Stock to Zero ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/stock vcc-basic 0"
    );
    const product = getProductById("vcc-basic");

    if (response.includes("Stok Berhasil Diupdate") && product.stock === 0) {
      console.log("✅ PASS: Stock set to zero");
      console.log(`   VCC Basic stock: ${product.stock}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Stock to zero failed");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 TEST SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Passed: ${passCount}/8`);
  console.log(`❌ Failed: ${failCount}/8`);
  console.log(`📈 Success Rate: ${((passCount / 8) * 100).toFixed(1)}%`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (failCount === 0) {
    console.log("🎉 ALL TESTS PASSED! Stock management feature working!");
  } else {
    console.log("⚠️  Some tests failed. Please review the code.");
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
testStockManagement().catch((error) => {
  console.error("❌ Test suite error:", error);
  process.exit(1);
});
