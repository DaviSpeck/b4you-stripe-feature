import { genericsValues, RedirectCheckoutPage } from "../../../share-functions";
import { BtnSecondStepSubmitClick } from "../../share-functions";
import { FirstStep } from "../share-functions";

context("Three steps neighborhood test field", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    FirstStep();
    genericsValues.addressInfo.street();
    genericsValues.addressInfo.addressNumber();
    genericsValues.addressInfo.complement();
  });

  it("it should show up a helptext when neighborhood is empty", () => {
    BtnSecondStepSubmitClick();
    cy.get("#helptext-neighborhood")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível deixar o bairro vazio");
  });

  it("Should able to write a neighborhood", () => {
    const neighborhoodInput = cy.get("#field-neighborhood");
    neighborhoodInput.type("neighborhood teste");
    cy.screenshot("É possível informar um bairro");
    genericsValues.addressInfo.zipcode();
    BtnSecondStepSubmitClick();
    cy.contains("Comprar agora");
  });
});
