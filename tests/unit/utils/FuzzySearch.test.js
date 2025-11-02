/**
 * Unit tests for FuzzySearch utility
 */

const { expect } = require("chai");
const FuzzySearch = require("../../../src/utils/FuzzySearch");

describe("FuzzySearch", () => {
  const mockProducts = [
    { id: "netflix", name: "Netflix Premium", price: 50000 },
    { id: "spotify", name: "Spotify Premium", price: 40000 },
    { id: "youtube", name: "YouTube Premium", price: 45000 },
    { id: "disney", name: "Disney+ Hotstar", price: 35000 },
    { id: "vcc-us", name: "VCC USA", price: 30000 },
  ];

  describe("search", () => {
    it("should find exact match by ID", () => {
      const result = FuzzySearch.search(mockProducts, "netflix");
      expect(result).to.exist;
      expect(result.id).to.equal("netflix");
    });

    it("should find exact match by name", () => {
      const result = FuzzySearch.search(mockProducts, "Netflix Premium");
      expect(result).to.exist;
      expect(result.id).to.equal("netflix");
    });

    it("should be case-insensitive", () => {
      const result = FuzzySearch.search(mockProducts, "NETFLIX");
      expect(result).to.exist;
      expect(result.id).to.equal("netflix");
    });

    it("should find partial match", () => {
      const result = FuzzySearch.search(mockProducts, "spot");
      expect(result).to.exist;
      expect(result.id).to.equal("spotify");
    });

    it("should handle typos with fuzzy matching", () => {
      const result = FuzzySearch.search(mockProducts, "netfix");
      expect(result).to.exist;
      expect(result.id).to.equal("netflix");
    });

    it("should handle small typos", () => {
      const result = FuzzySearch.search(mockProducts, "spotfy");
      expect(result).to.exist;
      expect(result.id).to.equal("spotify");
    });

    it("should return null for no match", () => {
      const result = FuzzySearch.search(
        mockProducts,
        "completely-different-product"
      );
      expect(result).to.be.null;
    });

    it("should respect threshold parameter", () => {
      const result = FuzzySearch.search(mockProducts, "netfli", 1);
      expect(result).to.exist; // Within threshold
    });

    it("should reject matches beyond threshold", () => {
      const result = FuzzySearch.search(mockProducts, "xyz123", 1);
      expect(result).to.be.null;
    });

    it("should handle empty query", () => {
      const testProducts = [
        { id: "netflix", name: "Netflix" },
        { id: "spotify", name: "Spotify" },
      ];
      // Empty query should be converted to string before toLowerCase
      const result = FuzzySearch.search("", testProducts);
      expect(result).to.not.be.null;
    });

    it("should handle empty products array", () => {
      const result = FuzzySearch.search([], "netflix");
      expect(result).to.be.null;
    });
  });

  describe("levenshteinDistance", () => {
    it("should return 0 for identical strings", () => {
      const distance = FuzzySearch.levenshteinDistance("test", "test");
      expect(distance).to.equal(0);
    });

    it("should return correct distance for different strings", () => {
      const distance = FuzzySearch.levenshteinDistance("kitten", "sitting");
      expect(distance).to.equal(3);
    });

    it("should handle empty strings", () => {
      const distance = FuzzySearch.levenshteinDistance("", "test");
      expect(distance).to.equal(4);
    });

    it("should handle single character difference", () => {
      const distance = FuzzySearch.levenshteinDistance("cat", "bat");
      expect(distance).to.equal(1);
    });

    it("should handle insertion", () => {
      const distance = FuzzySearch.levenshteinDistance("cat", "cats");
      expect(distance).to.equal(1);
    });

    it("should handle deletion", () => {
      const distance = FuzzySearch.levenshteinDistance("cats", "cat");
      expect(distance).to.equal(1);
    });

    it("should be symmetric", () => {
      const d1 = FuzzySearch.levenshteinDistance("abc", "xyz");
      const d2 = FuzzySearch.levenshteinDistance("xyz", "abc");
      expect(d1).to.equal(d2);
    });
  });

  describe("edge cases", () => {
    it("should handle special characters", () => {
      const products = [{ id: "special", name: "Product @#$%", price: 100 }];
      const result = FuzzySearch.search(products, "Product");
      expect(result).to.exist;
    });

    it("should handle unicode characters", () => {
      const products = [{ id: "unicode", name: "Café ☕", price: 100 }];
      const result = FuzzySearch.search(products, "Café");
      expect(result).to.exist;
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(1000);
      const distance = FuzzySearch.levenshteinDistance(longString, longString);
      expect(distance).to.equal(0);
    });

    it("should handle numbers in strings", () => {
      const products = [{ id: "prod123", name: "Product 123", price: 100 }];
      const result = FuzzySearch.search(products, "123");
      expect(result).to.exist;
    });

    it("should handle multiple spaces", () => {
      const products = [{ id: "test", name: "Test   Product", price: 100 }];
      const result = FuzzySearch.search(products, "Test Product");
      expect(result).to.exist;
    });
  });

  describe("performance", () => {
    it("should handle large product arrays", () => {
      const largeArray = Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: `product-${i}`,
          name: `Product ${i}`,
          price: 100,
        }));

      const start = Date.now();
      const result = FuzzySearch.search(largeArray, "Product 500");
      const duration = Date.now() - start;

      expect(result).to.exist;
      expect(duration).to.be.lessThan(1000); // Should complete within 1 second
    });
  });

  describe("priority", () => {
    it("should prioritize exact match over fuzzy match", () => {
      const products = [
        { id: "netfli", name: "Netfli Service", price: 100 },
        { id: "netflix", name: "Netflix Premium", price: 200 },
      ];
      const result = FuzzySearch.search(products, "netflix");
      expect(result.id).to.equal("netflix");
    });

    it("should prioritize partial match over fuzzy match", () => {
      const products = [
        { id: "abc", name: "ABC", price: 100 },
        { id: "netflix", name: "Netflix Premium", price: 200 },
      ];
      const result = FuzzySearch.search(products, "net");
      expect(result.id).to.equal("netflix");
    });
  });
});
