import { genericsValues, RedirectCheckoutPage } from "../share-functions";
import { fieldInformations, BtnSubmitClick } from "./config";

context("Checkout single plan offer", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ type: "single", offerType: "subscription" });
    fieldInformations();
  });

  it("Buy by credit card", () => {
    cy.intercept("POST", "/api/payment/credit-card").as("creditCardPayment");
    genericsValues.cardInfo.cardNumber();
    genericsValues.cardInfo.cardValidate();
    genericsValues.cardInfo.cardHolderName();
    genericsValues.cardInfo.secreteCardNumber();
    genericsValues.userInfo.document();
    BtnSubmitClick();
    cy.wait("@creditCardPayment").its("response.statusCode").should("eq", 200);
  });

  it("Buy by pix", () => {
    cy.intercept("POST", "/api/payment/pix/payment-information").as(
      "pixPayment",
    );
    cy.get("#pix-option").click();
    BtnSubmitClick();
    cy.wait("@pixPayment").its("response.statusCode").should("eq", 200);
  });
});
