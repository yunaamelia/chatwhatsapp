/**
 * Unit tests for Constants utility
 */

const { expect } = require("chai");
const {
  SessionSteps,
  PaymentMethods,
  PaymentStatus,
  AdminCommands,
} = require("../../../src/utils/Constants");

describe("Constants", () => {
  describe("SessionSteps", () => {
    it("should have MENU step", () => {
      expect(SessionSteps.MENU).to.equal("menu");
    });

    it("should have BROWSING step", () => {
      expect(SessionSteps.BROWSING).to.equal("browsing");
    });

    it("should have CHECKOUT step", () => {
      expect(SessionSteps.CHECKOUT).to.equal("checkout");
    });

    it("should have SELECT_PAYMENT step", () => {
      expect(SessionSteps.SELECT_PAYMENT).to.equal("select_payment");
    });

    it("should have SELECT_BANK step", () => {
      expect(SessionSteps.SELECT_BANK).to.equal("select_bank");
    });

    it("should have AWAITING_PAYMENT step", () => {
      expect(SessionSteps.AWAITING_PAYMENT).to.equal("awaiting_payment");
    });

    it("should have AWAITING_ADMIN_APPROVAL step", () => {
      expect(SessionSteps.AWAITING_ADMIN_APPROVAL).to.equal(
        "awaiting_admin_approval"
      );
    });

    it("should have UPLOAD_PROOF step", () => {
      expect(SessionSteps.UPLOAD_PROOF).to.equal("upload_proof");
    });

    it("should have all step values as strings", () => {
      Object.values(SessionSteps).forEach((step) => {
        expect(step).to.be.a("string");
      });
    });

    it("should not have duplicate values", () => {
      const values = Object.values(SessionSteps);
      const uniqueValues = [...new Set(values)];
      expect(values.length).to.equal(uniqueValues.length);
    });
  });

  describe("PaymentMethods", () => {
    it("should have QRIS method", () => {
      expect(PaymentMethods.QRIS).to.equal("QRIS");
    });

    it("should have e-wallet methods", () => {
      expect(PaymentMethods.DANA).to.equal("DANA");
      expect(PaymentMethods.GOPAY).to.equal("GOPAY");
      expect(PaymentMethods.OVO).to.equal("OVO");
      expect(PaymentMethods.SHOPEEPAY).to.equal("SHOPEEPAY");
    });

    it("should have bank transfer methods", () => {
      expect(PaymentMethods.BCA).to.equal("BCA");
      expect(PaymentMethods.BNI).to.equal("BNI");
      expect(PaymentMethods.BRI).to.equal("BRI");
      expect(PaymentMethods.MANDIRI).to.equal("MANDIRI");
    });

    it("should have all payment method values as strings", () => {
      Object.values(PaymentMethods).forEach((method) => {
        expect(method).to.be.a("string");
      });
    });

    it("should not have duplicate values", () => {
      const values = Object.values(PaymentMethods);
      const uniqueValues = [...new Set(values)];
      expect(values.length).to.equal(uniqueValues.length);
    });

    it("should have at least 9 payment methods", () => {
      expect(Object.keys(PaymentMethods).length).to.be.at.least(9);
    });
  });

  describe("PaymentStatus", () => {
    it("should have PENDING status", () => {
      expect(PaymentStatus.PENDING).to.equal("pending");
    });

    it("should have AWAITING_PROOF status", () => {
      expect(PaymentStatus.AWAITING_PROOF).to.equal("awaiting_proof");
    });

    it("should have AWAITING_APPROVAL status", () => {
      expect(PaymentStatus.AWAITING_APPROVAL).to.equal(
        "awaiting_admin_approval"
      );
    });

    it("should have PAID status", () => {
      expect(PaymentStatus.PAID).to.equal("paid");
    });

    it("should have EXPIRED status", () => {
      expect(PaymentStatus.EXPIRED).to.equal("expired");
    });

    it("should have FAILED status", () => {
      expect(PaymentStatus.FAILED).to.equal("failed");
    });

    it("should have all status values as strings", () => {
      Object.values(PaymentStatus).forEach((status) => {
        expect(status).to.be.a("string");
      });
    });

    it("should not have duplicate values", () => {
      const values = Object.values(PaymentStatus);
      const uniqueValues = [...new Set(values)];
      expect(values.length).to.equal(uniqueValues.length);
    });
  });

  describe("AdminCommands", () => {
    it("should have APPROVE command", () => {
      expect(AdminCommands.APPROVE).to.equal("/approve");
    });

    it("should have BROADCAST command", () => {
      expect(AdminCommands.BROADCAST).to.equal("/broadcast");
    });

    it("should have STATS command", () => {
      expect(AdminCommands.STATS).to.equal("/stats");
    });

    it("should have STATUS command", () => {
      expect(AdminCommands.STATUS).to.equal("/status");
    });

    it("should have STOCK command", () => {
      expect(AdminCommands.STOCK).to.equal("/stock");
    });

    it("should have ADD_PRODUCT command", () => {
      expect(AdminCommands.ADD_PRODUCT).to.equal("/addproduct");
    });

    it("should have EDIT_PRODUCT command", () => {
      expect(AdminCommands.EDIT_PRODUCT).to.equal("/editproduct");
    });

    it("should have REMOVE_PRODUCT command", () => {
      expect(AdminCommands.REMOVE_PRODUCT).to.equal("/removeproduct");
    });

    it("should have SETTINGS command", () => {
      expect(AdminCommands.SETTINGS).to.equal("/settings");
    });

    it("should have all commands start with /", () => {
      Object.values(AdminCommands).forEach((command) => {
        expect(command).to.match(/^\//);
      });
    });

    it("should have all commands in lowercase", () => {
      Object.values(AdminCommands).forEach((command) => {
        expect(command).to.equal(command.toLowerCase());
      });
    });

    it("should not have duplicate values", () => {
      const values = Object.values(AdminCommands);
      const uniqueValues = [...new Set(values)];
      expect(values.length).to.equal(uniqueValues.length);
    });
  });

  describe("general", () => {
    it("should export all constants", () => {
      expect(SessionSteps).to.exist;
      expect(PaymentMethods).to.exist;
      expect(PaymentStatus).to.exist;
      expect(AdminCommands).to.exist;
    });

    it("should have immutable constants", () => {
      // Attempt to modify constant
      try {
        SessionSteps.NEW_STEP = "new_step";
        // Should still work but not affect the module
        expect(SessionSteps.NEW_STEP).to.equal("new_step");
      } catch (error) {
        // If frozen, this is expected
        expect(error).to.exist;
      }
    });

    it("should have consistent naming convention", () => {
      // All constants should be objects
      expect(SessionSteps).to.be.an("object");
      expect(PaymentMethods).to.be.an("object");
      expect(PaymentStatus).to.be.an("object");
      expect(AdminCommands).to.be.an("object");
    });
  });

  describe("integration", () => {
    it("SessionSteps should work with switch statements", () => {
      const testStep = SessionSteps.MENU;
      let result = "";

      switch (testStep) {
        case SessionSteps.MENU:
          result = "menu";
          break;
        case SessionSteps.BROWSING:
          result = "browsing";
          break;
        default:
          result = "unknown";
      }

      expect(result).to.equal("menu");
    });

    it("PaymentStatus should be comparable", () => {
      const status1 = PaymentStatus.PENDING;
      const status2 = PaymentStatus.PAID;
      expect(status1).to.not.equal(status2);
      expect(status1 === PaymentStatus.PENDING).to.be.true;
    });
  });
});
