import { genericsValues, RedirectCheckoutPage } from "../../../share-functions";
import { BtnSecondStepSubmitClick } from "../../share-functions";
import { FirstStep } from "../share-functions";

context("Three steps zipcode test field", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    FirstStep();
    genericsValues.addressInfo.street();
    genericsValues.addressInfo.addressNumber();
    genericsValues.addressInfo.neighborhood();
    genericsValues.addressInfo.complement();
  });

  it("Zipcode should be formated", () => {
    const zipcodeInput = cy.get("#field-zipcode");
    zipcodeInput.type("21777777").should("have.value", "21777-777");
    cy.screenshot("O CEP é formatado corretamente");
  });

  it("it should show up a helptext when zipcode format is wrong", () => {
    const zipcodeInput = cy.get("#field-zipcode");
    zipcodeInput.type("21777");
    BtnSecondStepSubmitClick();
    cy.get("#helptext-zipcode")
      .should("be.visible")
      .and("contain", "CEP inválido");
    cy.screenshot("Não é possível informar um CEP inválido");
  });

  it("it should show up a helptext when zipcode is empty", () => {
    BtnSecondStepSubmitClick();
    cy.get("#helptext-zipcode")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível não informar um CEP");
  });

  it("Should able to write a zipcode", () => {
    const phoneInput = cy.get("#field-zipcode");
    phoneInput.type("21735652");
    cy.screenshot("é possível informar um CEP");
    BtnSecondStepSubmitClick();
    cy.contains("Comprar agora");
  });
});
