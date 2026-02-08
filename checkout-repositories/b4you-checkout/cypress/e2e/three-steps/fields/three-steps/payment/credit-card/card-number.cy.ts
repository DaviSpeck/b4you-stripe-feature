import {
  genericsValues,
  RedirectCheckoutPage,
} from "../../../../../share-functions";
import {
  BtnThirdStepSubmitClick,
  firstAndSecontStepInfo,
} from "../../../../share-functions";
import { requestPaymentObserver } from "./share-functions";

context("Card number teste field", () => {
  const cardNumberInput = () => cy.get("#field-card-number");

  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    firstAndSecontStepInfo();
    genericsValues.cardInfo.cardHolderName();
    genericsValues.cardInfo.cardValidate();
    genericsValues.cardInfo.secreteCardNumber();
    genericsValues.userInfo.document();
    requestPaymentObserver["credit-card"]();
  });

  it("Card number should be formated", () => {
    cardNumberInput()
      .type("5555555555555555")
      .should("have.value", "5555 5555 5555 5555");
    cy.screenshot("O número do cartão é formatado corretamente");
  });

  it("it should show up a helptext when card number format is wrong", () => {
    cardNumberInput().type("55555555");
    BtnThirdStepSubmitClick();
    cy.get("#helptext-cardNumber")
      .should("be.visible")
      .and("contain", "número inválido");
    cy.screenshot("Não é possível informar um número inváliod");
  });

  it("it should show up a helptext when card number is empty", () => {
    BtnThirdStepSubmitClick();
    cy.get("#helptext-cardNumber")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possivel deixar o número do cartão vazio");
  });

  it("Should able to write a card number", () => {
    cardNumberInput().type("4000000000000010");
    cy.screenshot("É possível adicionar o número do cartão");
    BtnThirdStepSubmitClick();
    cy.wait("@creditCard");
  });
});
