import {
  genericsValues,
  RedirectCheckoutPage,
} from "../../../../../share-functions";
import {
  BtnThirdStepSubmitClick,
  firstAndSecontStepInfo,
} from "../../../../share-functions";
import { requestPaymentObserver } from "./share-functions";

context("Card secret number teste field", () => {
  const cardHolderNameInput = () => cy.get("#field-secrete-card-number");

  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    firstAndSecontStepInfo();
    genericsValues.cardInfo.cardValidate();
    genericsValues.cardInfo.cardNumber();
    genericsValues.cardInfo.cardHolderName();
    genericsValues.userInfo.document();
  });

  it("It should show up a helptext when card secret number is empty", () => {
    BtnThirdStepSubmitClick();
    cy.get("#helptext-secreteCardNumber")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot(
      "Não é possível deixar o código de segurança do cartão vazio",
    );
  });

  it("Should able to write a card secret number", () => {
    requestPaymentObserver["credit-card"]();
    cardHolderNameInput().type("393");
    cy.screenshot("É possível informar o código de segurança do cartão");
    BtnThirdStepSubmitClick();
    cy.contains("Comprar agora");
    cy.wait("@creditCard");
  });
});
