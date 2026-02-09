const baseUrl = Cypress.env("base_url");

const visitInternationalCheckout = () => {
  cy.visit(`${baseUrl}/international/offer-international`);
  cy.contains("International checkout").should("be.visible");
};

describe("International checkout", () => {
  beforeEach(() => {
    cy.fixture("international-offer.json").then((offer) => {
      cy.intercept("GET", "/api/checkout/offers/*", offer).as("offer");
    });
    cy.intercept("GET", "/api/feature-flags/stripe", {
      enabled: true,
      source: "backoffice",
    }).as("featureFlag");
  });

  it("creates a pending payment and shows confirmation link", () => {
    cy.intercept(
      "POST",
      "/api/checkout/international/payments/stripe/payment-intents",
      {
        transaction_id: "tx-123",
        order_id: "order-123",
        sale_id: "sale-123",
        provider: "stripe",
        status: "pending",
      },
    ).as("createPayment");

    cy.intercept("GET", "/api/checkout/delivery/sale-123", (req) => {
      cy.fixture("international-sale.json").then((sale) => {
        req.reply({
          statusCode: 200,
          body: sale,
        });
      });
    }).as("delivery");

    visitInternationalCheckout();

    cy.get("#field-full-name").type("Jane Doe");
    cy.get("#field-email").type("jane@example.com");
    cy.get("#field-phone").type("5551234567");
    cy.get("#field-document").type("123456789");

    cy.contains("Pay now").click();
    cy.wait("@createPayment").its("response.statusCode").should("eq", 200);
    cy.contains("Payment pending").should("be.visible");
    cy.contains("Go to confirmation").click();

    cy.wait("@delivery");
    cy.contains("Payment pending").should("be.visible");
  });

  it("retries with the same transaction id", () => {
    let firstTransactionId: string | undefined;

    cy.intercept(
      "POST",
      "/api/checkout/international/payments/stripe/payment-intents",
      (req) => {
        if (!firstTransactionId) {
          firstTransactionId = req.body.transaction_id;
          req.reply({ statusCode: 500, body: { message: "error" } });
          return;
        }

        expect(req.body.transaction_id).to.eq(firstTransactionId);
        req.reply({
          statusCode: 200,
          body: {
            transaction_id: firstTransactionId,
            order_id: "order-123",
            sale_id: "sale-123",
            provider: "stripe",
            status: "pending",
          },
        });
      },
    ).as("createPayment");

    visitInternationalCheckout();

    cy.get("#field-full-name").type("Jane Doe");
    cy.get("#field-email").type("jane@example.com");
    cy.get("#field-phone").type("5551234567");
    cy.get("#field-document").type("123456789");

    cy.contains("Pay now").click();
    cy.wait("@createPayment");
    cy.contains("Pay now").click();
    cy.wait("@createPayment");
  });

  it("blocks when the feature flag is disabled", () => {
    cy.intercept("GET", "/api/feature-flags/stripe", {
      enabled: false,
      reason: "inconsistent",
      source: "fail-safe",
    }).as("featureFlagDisabled");

    visitInternationalCheckout();

    cy.get("#field-full-name").type("Jane Doe");
    cy.get("#field-email").type("jane@example.com");
    cy.get("#field-phone").type("5551234567");
    cy.get("#field-document").type("123456789");

    cy.contains("International checkout is unavailable").should("be.visible");
    cy.contains("Pay now").should("be.disabled");
  });

  ["approved", "failed", "refunded", "dispute"].forEach((status) => {
    it(`renders ${status} status on the thank you page`, () => {
      cy.fixture("international-sale.json").then((sale) => {
        cy.intercept("GET", "/api/checkout/delivery/sale-123", {
          ...sale,
          products: [
            {
              ...sale.products[0],
              payment: {
                ...sale.products[0].payment,
                status,
              },
            },
          ],
        }).as("delivery");
      });

      cy.visit(`${baseUrl}/international/thank-you/sale-123`);
      cy.wait("@delivery");
      cy.contains("Payment").should("be.visible");
    });
  });
});
