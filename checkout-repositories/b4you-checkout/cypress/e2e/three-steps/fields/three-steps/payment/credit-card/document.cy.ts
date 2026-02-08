import {
  genericsValues,
  RedirectCheckoutPage,
} from "../../../../../share-functions";
import {
  BtnThirdStepSubmitClick,
  firstAndSecontStepInfo,
} from "../../../../share-functions";
import { requestPaymentObserver } from "./share-functions";

context("Card holder document teste field", () => {
  const cardHolderDocumentInput = () => cy.get("#field-document");

  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    firstAndSecontStepInfo();
    genericsValues.cardInfo.cardHolderName();
    genericsValues.cardInfo.cardNumber();
    genericsValues.cardInfo.secreteCardNumber();
    genericsValues.cardInfo.cardValidate();
    requestPaymentObserver["credit-card"]();
  });

  it("Card holder document should be formated", () => {
    cardHolderDocumentInput()
      .type("19999999999")
      .should("have.value", "199.999.999-99");
    cy.screenshot("O CPF é formatado corretamente");
  });

  it("Should not able to write a wrong card holder document", () => {
    cardHolderDocumentInput().type("1999999");
    BtnThirdStepSubmitClick();
    cy.get("#helptext-document")
      .should("be.visible")
      .and("contain", "CPF inválido");
    cy.screenshot("Não é possível informar um CPF inválido");
  });

  it("it should show up a helptext when card holder name is empty", () => {
    BtnThirdStepSubmitClick();
    cy.get("#helptext-document")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível deixar o CPF inválido");
  });

  it("Should able to write a card holder name", () => {
    cardHolderDocumentInput().type("19999999999");
    cy.screenshot("É possível adicionar um CPF");
    BtnThirdStepSubmitClick();
    cy.wait("@creditCard");
  });
});
