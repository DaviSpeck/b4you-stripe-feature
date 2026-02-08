import { genericsValues, RedirectCheckoutPage } from "../../../share-functions";
import { BtnSecondStepSubmitClick } from "../../share-functions";
import { FirstStep } from "../share-functions";

context("Three steps street test field", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    FirstStep();
    genericsValues.addressInfo.addressNumber();
    genericsValues.addressInfo.neighborhood();
    genericsValues.addressInfo.complement();
  });

  it("it should show up a helptext when street is empty", () => {
    BtnSecondStepSubmitClick();
    cy.get("#helptext-street")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível deixar o campo de rua vazio");
  });

  it("Should able to write a street", () => {
    const streetInput = cy.get("#field-street");
    streetInput.type("rua teste");
    genericsValues.addressInfo.zipcode();
    cy.screenshot("É possível informar a rua");
    BtnSecondStepSubmitClick();
    cy.contains("Comprar agora");
  });
});
