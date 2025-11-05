/**
 * Unit Tests for ProductDelivery
 */

const fs = require("fs");
const path = require("path");
const ProductDelivery = require("../../../services/productDelivery");

// Mock fs module
jest.mock("fs");

// Mock config
jest.mock("../../../config", () => ({
  decrementStock: jest.fn(),
  incrementStock: jest.fn(),
  CURRENCY: "$",
}));

describe("ProductDelivery", () => {
  let productDelivery;

  beforeEach(() => {
    productDelivery = new ProductDelivery();
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    test("should initialize with correct paths", () => {
      expect(productDelivery.productsDataDir).toBe("./products_data");
      expect(productDelivery.deliveryLogFile).toBe("./delivery.log");
    });
  });

  describe("getProductCredentials()", () => {
    test("should return credentials when file exists", () => {
      const mockContent = "user1@example.com:password123\nuser2@example.com:password456\n";
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);
      fs.writeFileSync.mockImplementation(() => {});

      const result = productDelivery.getProductCredentials("netflix");

      expect(result).toEqual({
        email: "user1@example.com",
        password: "password123",
        raw: "user1@example.com:password123",
      });
      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join("./products_data", "netflix.txt"),
        "utf-8"
      );
    });

    test("should return null when file does not exist", () => {
      fs.existsSync.mockReturnValue(false);

      const result = productDelivery.getProductCredentials("nonexistent");

      expect(result).toBeNull();
    });

    test("should return null when no credentials available", () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue("");

      const result = productDelivery.getProductCredentials("empty");

      expect(result).toBeNull();
    });

    test("should handle pipe separator", () => {
      const mockContent = "user@example.com|password123\n";
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);
      fs.writeFileSync.mockImplementation(() => {});

      const result = productDelivery.getProductCredentials("product");

      expect(result).toEqual({
        email: "user@example.com",
        password: "password123",
        raw: "user@example.com|password123",
      });
    });

    test("should handle read errors gracefully", () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error("Read error");
      });

      const result = productDelivery.getProductCredentials("error");

      expect(result).toBeNull();
    });

    test("should update file with remaining credentials", () => {
      const mockContent = "line1\nline2\nline3\n";
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);
      fs.writeFileSync.mockImplementation(() => {});

      productDelivery.getProductCredentials("product");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        "line2\nline3\n",
        "utf-8"
      );
    });
  });

  describe("parseCredential()", () => {
    test("should parse email:password format", () => {
      const result = productDelivery.parseCredential("test@example.com:pass123");

      expect(result).toEqual({
        email: "test@example.com",
        password: "pass123",
        raw: "test@example.com:pass123",
      });
    });

    test("should parse email|password format", () => {
      const result = productDelivery.parseCredential("test@example.com|pass123");

      expect(result).toEqual({
        email: "test@example.com",
        password: "pass123",
        raw: "test@example.com|pass123",
      });
    });

    test("should handle single line format (VCC)", () => {
      const result = productDelivery.parseCredential("1234-5678-9012-3456");

      expect(result).toEqual({
        raw: "1234-5678-9012-3456",
      });
    });

    test("should trim whitespace", () => {
      const result = productDelivery.parseCredential("  test@example.com : pass123  ");

      expect(result.email).toBe("test@example.com");
      expect(result.password).toBe("pass123");
    });
  });

  describe("archiveSoldCredential()", () => {
    test("should store sold credential temporarily", () => {
      productDelivery.archiveSoldCredential("netflix", "user@example.com:pass");

      expect(productDelivery.lastSoldCredential).toEqual({
        productId: "netflix",
        credential: "user@example.com:pass",
      });
    });

    test("should not throw on errors", () => {
      // Force error by making lastSoldCredential read-only
      Object.defineProperty(productDelivery, "lastSoldCredential", {
        writable: false,
        value: null,
      });

      expect(() => {
        productDelivery.archiveSoldCredential("product", "cred");
      }).not.toThrow();
    });
  });

  describe("formatDeliveryMessage()", () => {
    test("should format delivery message with delivered products", () => {
      const deliveryResult = {
        success: true,
        delivered: [
          {
            product: { id: "netflix", name: "Netflix Premium" },
            credentials: {
              email: "test@example.com",
              password: "pass123",
              raw: "test@example.com:pass123",
            },
          },
        ],
        failed: [],
      };

      const result = productDelivery.formatDeliveryMessage(deliveryResult, "ORD-123");

      expect(result).toContain("ORD-123");
      expect(result).toContain("Netflix Premium");
      expect(result).toContain("test@example.com");
    });

    test("should format delivery message with failed products", () => {
      const deliveryResult = {
        success: false,
        delivered: [],
        failed: [
          { id: "product", name: "Failed Product" },
        ],
      };

      const result = productDelivery.formatDeliveryMessage(deliveryResult, "ORD-456");

      expect(result).toContain("ORD-456");
      expect(result).toContain("Failed Product");
    });
  });

  describe("deliverProducts()", () => {
    beforeEach(() => {
      // Mock WhatsApp client
      global.whatsappClient = {
        sendMessage: jest.fn().mockResolvedValue({}),
      };
    });

    test("should deliver products successfully", async () => {
      const cart = [
        { id: "netflix", name: "Netflix Premium", price: 1 },
      ];

      const mockCredentials = {
        email: "test@example.com",
        password: "pass123",
        raw: "test@example.com:pass123",
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue("test@example.com:pass123\n");
      fs.writeFileSync.mockImplementation(() => {});
      fs.appendFileSync.mockImplementation(() => {});

      productDelivery.getProductCredentials = jest.fn().mockReturnValue(mockCredentials);
      productDelivery.formatProductMessage = jest.fn().mockReturnValue("Product message");

      const result = await productDelivery.deliverProducts(
        "1234567890@c.us",
        "ORD-123",
        cart
      );

      expect(result.success).toBe(true);
      expect(result.delivered).toHaveLength(1);
      expect(result.failed).toHaveLength(0);
    });

    test("should handle delivery failures", async () => {
      const cart = [
        { id: "netflix", name: "Netflix Premium", price: 1 },
      ];

      productDelivery.getProductCredentials = jest.fn().mockReturnValue(null);

      const result = await productDelivery.deliverProducts(
        "1234567890@c.us",
        "ORD-123",
        cart
      );

      expect(result.success).toBe(false);
      expect(result.delivered).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
    });

    test("should handle mixed success and failure", async () => {
      const cart = [
        { id: "netflix", name: "Netflix Premium", price: 1 },
        { id: "spotify", name: "Spotify Premium", price: 1 },
      ];

      const mockCredentials = {
        email: "test@example.com",
        password: "pass123",
        raw: "test@example.com:pass123",
      };

      productDelivery.getProductCredentials = jest
        .fn()
        .mockReturnValueOnce(mockCredentials) // First product succeeds
        .mockReturnValueOnce(null); // Second product fails

      fs.existsSync.mockReturnValue(true);
      fs.appendFileSync.mockImplementation(() => {});
      productDelivery.formatProductMessage = jest.fn().mockReturnValue("Message");

      const result = await productDelivery.deliverProducts(
        "1234567890@c.us",
        "ORD-123",
        cart
      );

      expect(result.delivered).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });
  });

  describe("logDelivery()", () => {
    test("should log delivery to file", () => {
      fs.appendFileSync.mockImplementation(() => {});

      const delivered = [
        {
          product: { id: "netflix", name: "Netflix" },
          credentials: { email: "test@example.com", password: "pass" },
        },
      ];
      const failed = [];

      productDelivery.logDelivery(
        "1234567890@c.us",
        "ORD-123",
        delivered,
        failed
      );

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        "./delivery.log",
        expect.stringContaining("ORD-123"),
        "utf-8"
      );
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("1234567890@c.us"),
        "utf-8"
      );
    });

    test("should handle logging errors gracefully", () => {
      fs.appendFileSync.mockImplementation(() => {
        throw new Error("Write error");
      });

      expect(() => {
        productDelivery.logDelivery("customer", "ORD-123", [], []);
      }).not.toThrow();
    });
  });

  describe("checkStock()", () => {
    test("should return stock count when file exists", () => {
      const mockContent = "line1\nline2\nline3\n";
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);

      const result = productDelivery.checkStock("netflix");

      expect(result).toBe(3);
    });

    test("should return 0 when file does not exist", () => {
      fs.existsSync.mockReturnValue(false);

      const result = productDelivery.checkStock("nonexistent");

      expect(result).toBe(0);
    });

    test("should return 0 on errors", () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error("Read error");
      });

      const result = productDelivery.checkStock("error");

      expect(result).toBe(0);
    });
  });
});
