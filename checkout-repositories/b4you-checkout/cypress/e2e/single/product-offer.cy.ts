import { genericsValues, RedirectCheckoutPage } from "../share-functions";
import { fieldInformations, BtnSubmitClick } from "./config";

context("Checkout single product offer", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ type: "single", offerType: "physical" });
    fieldInformations();
    genericsValues.addressInfo.zipcode();
    cy.wait("@zipcodeRequest");
    genericsValues.addressInfo.addressNumber();
    genericsValues.addressInfo.complement();
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

  it("Buy by bank slip", () => {
    cy.intercept("POST", "/api/payment/bank-slip").as("bankSlipPayment");
    cy.get("#bank-slip-option").click();
    BtnSubmitClick();
    cy.wait("@bankSlipPayment").its("response.statusCode").should("eq", 200);
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
