import { genericsValues, RedirectCheckoutPage } from "../share-functions";
import {
  BtnThirdStepSubmitClick,
  firstAndSecontStepInfo,
} from "./share-functions";

context("Checkout Three steps plan offer", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ type: "three-steps", offerType: "subscription" });
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
