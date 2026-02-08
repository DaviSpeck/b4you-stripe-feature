import {
  genericsValues,
  RedirectCheckoutPage,
} from "../../../../../share-functions";
import {
  BtnThirdStepSubmitClick,
  firstAndSecontStepInfo,
} from "../../../../share-functions";
import { requestPaymentObserver } from "./share-functions";

context("Card validate teste field", () => {
  const cardValidateInput = () => cy.get("#field-card-validate");

  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    firstAndSecontStepInfo();
    genericsValues.cardInfo.cardHolderName();
    genericsValues.cardInfo.cardNumber();
    genericsValues.cardInfo.secreteCardNumber();
    genericsValues.userInfo.document();
    requestPaymentObserver["credit-card"]();
  });

  it("Card validate should be formated", () => {
    cardValidateInput().type("0626").should("have.value", "06/26");
    cy.screenshot("A validade é formatada corretamente");
  });

  it("it should show up a helptext when card validate format is wrong", () => {
    cardValidateInput().type("02");
    BtnThirdStepSubmitClick();
    cy.get("#helptext-cardValidate")
      .should("be.visible")
      .and("contain", "formato inválido. Use MM/AA (ex: 02/30)");
    cy.screenshot("Não é possível informar uma data vencida");
  });

  it("it should show up a helptext when card validate is empty", () => {
    BtnThirdStepSubmitClick();
    cy.get("#helptext-cardValidate")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível deixar a data vazia");
  });

  it("Should able to write a card validate", () => {
    cardValidateInput().type("0639");
    cy.screenshot("É possível informar a data");
    BtnThirdStepSubmitClick();
    cy.wait("@creditCard");
  });
});
