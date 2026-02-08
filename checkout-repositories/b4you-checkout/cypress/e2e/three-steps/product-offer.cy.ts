import { genericsValues, RedirectCheckoutPage } from "../share-functions";
import {
  BtnThirdStepSubmitClick,
  firstAndSecontStepInfo,
} from "./share-functions";

context("Checkout Three steps product offer", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ type: "three-steps", offerType: "physical" });
    firstAndSecontStepInfo();
  });

  it("Buy by credit card", () => {
    cy.intercept("POST", "/api/payment/credit-card").as("creditCardPayment");
    genericsValues.cardInfo.cardNumber();
    genericsValues.cardInfo.cardValidate();
    genericsValues.cardInfo.cardHolderName();
    genericsValues.cardInfo.secreteCardNumber();
    genericsValues.userInfo.document();
    BtnThirdStepSubmitClick();
    cy.wait("@creditCardPayment").its("response.statusCode").should("eq", 200);
  });

  it("Buy by bank slip", () => {
    cy.intercept("POST", "/api/payment/bank-slip").as("bankSlipPayment");
    cy.get("#bank-slip-option").click();
    genericsValues.userInfo.document();
    BtnThirdStepSubmitClick();
    cy.wait("@bankSlipPayment").its("response.statusCode").should("eq", 200);
  });

  it("Buy by pix", () => {
    cy.intercept("POST", "/api/payment/pix/payment-information").as(
      "pixPayment",
    );
    cy.get("#pix-option").click();
    genericsValues.userInfo.document();
    BtnThirdStepSubmitClick();
    cy.wait("@pixPayment").its("response.statusCode").should("eq", 200);
  });
});
