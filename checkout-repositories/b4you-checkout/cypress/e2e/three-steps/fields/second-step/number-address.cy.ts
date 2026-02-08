import { genericsValues, RedirectCheckoutPage } from "../../../share-functions";
import { BtnSecondStepSubmitClick } from "../../share-functions";
import { FirstStep } from "../share-functions";

context("Three steps number address test field", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    FirstStep();
    genericsValues.addressInfo.street();
    genericsValues.addressInfo.neighborhood();
    genericsValues.addressInfo.complement();
  });

  it("it should show up a helptext when number address is empty", () => {
    BtnSecondStepSubmitClick();
    cy.get("#helptext-number_address")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível deixar o número do endereço inválido");
  });

  it("Should able to write a number address", () => {
    const numberAddresstInput = cy.get("#field-number-address");
    numberAddresstInput.type("123");
    genericsValues.addressInfo.zipcode();
    cy.screenshot("É possível adicionar um número do endereço");
    BtnSecondStepSubmitClick();
    cy.contains("Comprar agora");
  });
});
