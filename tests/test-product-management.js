/**
 * Test Product Management Features
 * Tests: /addproduct, /removeproduct, /editproduct
 */

const ChatbotLogic = require("../chatbotLogic");
const SessionManager = require("../sessionManager");
const { getProductById } = require("../config");

// Set admin number for testing
process.env.ADMIN_NUMBER_1 = "6281234567890";

async function testProductManagement() {
  console.log("🧪 Testing Product Management Features\n");

  const sessionManager = new SessionManager();
  await sessionManager.initialize();

  const chatbot = new ChatbotLogic(sessionManager);
  const adminId = "6281234567890@c.us";
  const nonAdminId = "6289999999999@c.us";

  let passCount = 0;
  let failCount = 0;

  // Test 1: Add new product
  console.log("--- Test 1: Add New Product (HBO Max) ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/addproduct hbo | HBO Max Premium (1 Month) | 1.2 | Full HD streaming, all content | 15 | premium"
    );

    const product = getProductById("hbo");

    if (
      response.includes("Produk Berhasil Ditambahkan") &&
      product &&
      product.name.includes("HBO Max")
    ) {
      console.log("✅ PASS: Product added successfully");
      console.log(`   Product: ${product.name}, Stock: ${product.stock}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Product not added");
      console.log("Response:", response);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 2: Try to add duplicate product
  console.log("\n--- Test 2: Add Duplicate Product (should fail) ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/addproduct netflix | Netflix Copy | 1 | Duplicate test | 10 | premium"
    );

    if (response.includes("sudah ada")) {
      console.log("✅ PASS: Duplicate rejected");
      passCount++;
    } else {
      console.log("❌ FAIL: Should reject duplicate");
      console.log("Response:", response);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 3: Edit product name
  console.log("\n--- Test 3: Edit Product Name (Netflix) ---");
  try {
    const originalProduct = getProductById("netflix");
    const originalName = originalProduct.name;

    const response = await chatbot.processMessage(
      adminId,
      "/editproduct netflix | name | Netflix Premium HD (1 Month)"
    );

    const updatedProduct = getProductById("netflix");

    if (
      response.includes("Produk Berhasil Diupdate") &&
      updatedProduct.name !== originalName
    ) {
      console.log("✅ PASS: Product name updated");
      console.log(`   Old: ${originalName}`);
      console.log(`   New: ${updatedProduct.name}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Product name not updated");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 4: Edit product price
  console.log("\n--- Test 4: Edit Product Price (Spotify) ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/editproduct spotify | price | 1.5"
    );

    const product = getProductById("spotify");

    if (
      response.includes("Produk Berhasil Diupdate") &&
      product.price === 1.5
    ) {
      console.log("✅ PASS: Product price updated");
      console.log(`   New price: $${product.price}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Product price not updated");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 5: Edit product description
  console.log("\n--- Test 5: Edit Product Description (YouTube) ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/editproduct youtube | description | Ad-free, 4K quality, background play"
    );

    const product = getProductById("youtube");

    if (
      response.includes("Produk Berhasil Diupdate") &&
      product.description.includes("4K quality")
    ) {
      console.log("✅ PASS: Product description updated");
      console.log(`   New description: ${product.description}`);
      passCount++;
    } else {
      console.log("❌ FAIL: Product description not updated");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 6: Remove product
  console.log("\n--- Test 6: Remove Product (HBO) ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/removeproduct hbo"
    );
    const product = getProductById("hbo");

    if (response.includes("Produk Berhasil Dihapus") && !product) {
      console.log("✅ PASS: Product removed successfully");
      passCount++;
    } else {
      console.log("❌ FAIL: Product not removed");
      console.log("Response:", response);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 7: Try to remove non-existent product
  console.log("\n--- Test 7: Remove Non-existent Product (should fail) ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/removeproduct nonexistent"
    );

    if (response.includes("tidak ditemukan")) {
      console.log("✅ PASS: Non-existent product rejection");
      passCount++;
    } else {
      console.log("❌ FAIL: Should reject non-existent product");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 8: Non-admin trying to add product
  console.log("\n--- Test 8: Non-Admin Add Product (should fail) ---");
  try {
    const response = await chatbot.processMessage(
      nonAdminId,
      "/addproduct test | Test Product | 1 | Test desc | 10 | premium"
    );

    if (
      response.includes("Tidak diizinkan") ||
      response.includes("khusus admin")
    ) {
      console.log("✅ PASS: Non-admin blocked from adding");
      passCount++;
    } else {
      console.log("❌ FAIL: Non-admin should be blocked");
      console.log("Response:", response);
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 9: Non-admin trying to edit product
  console.log("\n--- Test 9: Non-Admin Edit Product (should fail) ---");
  try {
    const response = await chatbot.processMessage(
      nonAdminId,
      "/editproduct netflix | price | 999"
    );

    if (
      response.includes("Tidak diizinkan") ||
      response.includes("khusus admin")
    ) {
      console.log("✅ PASS: Non-admin blocked from editing");
      passCount++;
    } else {
      console.log("❌ FAIL: Non-admin should be blocked");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 10: Non-admin trying to remove product
  console.log("\n--- Test 10: Non-Admin Remove Product (should fail) ---");
  try {
    const response = await chatbot.processMessage(
      nonAdminId,
      "/removeproduct netflix"
    );

    if (
      response.includes("Tidak diizinkan") ||
      response.includes("khusus admin")
    ) {
      console.log("✅ PASS: Non-admin blocked from removing");
      passCount++;
    } else {
      console.log("❌ FAIL: Non-admin should be blocked");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 11: Invalid add product format
  console.log("\n--- Test 11: Invalid Add Product Format ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/addproduct invalid-format"
    );

    if (response.includes("Format Salah")) {
      console.log("✅ PASS: Invalid format caught");
      passCount++;
    } else {
      console.log("❌ FAIL: Should show format error");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 12: Invalid edit field
  console.log("\n--- Test 12: Invalid Edit Field ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/editproduct netflix | invalidfield | test"
    );

    if (response.includes("Field Tidak Valid")) {
      console.log("✅ PASS: Invalid field rejected");
      passCount++;
    } else {
      console.log("❌ FAIL: Should reject invalid field");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 13: Add VCC product
  console.log("\n--- Test 13: Add VCC Product ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/addproduct vcc-premium | Virtual Credit Card - Premium | 2 | Pre-loaded $50 balance | 5 | vcc"
    );

    const product = getProductById("vcc-premium");

    if (response.includes("Produk Berhasil Ditambahkan") && product) {
      console.log("✅ PASS: VCC product added");
      console.log(`   Product: ${product.name}`);
      passCount++;
    } else {
      console.log("❌ FAIL: VCC product not added");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Test 14: Invalid category
  console.log("\n--- Test 14: Invalid Category ---");
  try {
    const response = await chatbot.processMessage(
      adminId,
      "/addproduct test | Test Product | 1 | Test | 10 | invalidcategory"
    );

    if (response.includes("Kategori tidak valid")) {
      console.log("✅ PASS: Invalid category rejected");
      passCount++;
    } else {
      console.log("❌ FAIL: Should reject invalid category");
      failCount++;
    }
  } catch (error) {
    console.log("❌ FAIL:", error.message);
    failCount++;
  }

  // Cleanup: Remove test product
  console.log("\n--- Cleanup: Removing Test Products ---");
  await chatbot.processMessage(adminId, "/removeproduct vcc-premium");
  console.log("   Cleanup complete");

  // Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 TEST SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Passed: ${passCount}/14`);
  console.log(`❌ Failed: ${failCount}/14`);
  console.log(`📈 Success Rate: ${((passCount / 14) * 100).toFixed(1)}%`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (failCount === 0) {
    console.log("🎉 ALL TESTS PASSED! Product management features working!");
  } else {
    console.log("⚠️  Some tests failed. Please review the code.");
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
testProductManagement().catch((error) => {
  console.error("❌ Test suite error:", error);
  process.exit(1);
});
