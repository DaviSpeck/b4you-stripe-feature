import {
  genericsValues,
  RedirectCheckoutPage,
} from "../../../../../share-functions";
import {
  BtnThirdStepSubmitClick,
  firstAndSecontStepInfo,
} from "../../../../share-functions";
import { requestPaymentObserver } from "./share-functions";

context("Card holder name teste field", () => {
  const cardHolderNameInput = () => cy.get("#field-holder-name");

  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    firstAndSecontStepInfo();
    genericsValues.cardInfo.cardValidate();
    genericsValues.cardInfo.cardNumber();
    genericsValues.cardInfo.secreteCardNumber();
    genericsValues.userInfo.document();
  });

  it("it should show up a helptext when card holder name is empty", () => {
    BtnThirdStepSubmitClick();
    cy.get("#helptext-cardHolderName")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível deixar o nome vazio");
  });

  it("Should able to write a card holder name", () => {
    requestPaymentObserver["credit-card"]();
    cardHolderNameInput().type("Leonardo Neves");
    cy.screenshot("É possível informar o nome do usuário do cartão");
    BtnThirdStepSubmitClick();
    cy.contains("Comprar agora");
    cy.wait("@creditCard");
  });
});
