import { genericsValues, RedirectCheckoutPage } from "../../../share-functions";
import { BtnFirstStepSubmitClick } from "../../share-functions";

context("Three steps phone test field", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    genericsValues.userInfo.name();
    genericsValues.userInfo.email();
  });

  it("Phone should be formated", () => {
    const phoneInput = cy.get("#field-phone");
    phoneInput.type("21999999999").should("have.value", "(21) 99999-9999");
    cy.screenshot("O telefone é formatado corretamente");
  });

  it("it should show up a helptext when phone format is wrong", () => {
    const phoneInput = cy.get("#field-phone");
    phoneInput.type("2198695");
    BtnFirstStepSubmitClick();
    cy.get("#helptext-whatsapp")
      .should("be.visible")
      .and("contain", "Número inválido. Use (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX");
    cy.screenshot("Não é possível adicionar um telefone com formato inváliod");
  });

  it("it should show up a helptext when phone is empty", () => {
    BtnFirstStepSubmitClick();
    cy.get("#helptext-whatsapp")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível adicionar um telefone vazio");
  });

  it("Should able to write a phone", () => {
    const phoneInput = cy.get("#field-phone");
    phoneInput.type("21999999999");
    cy.screenshot("É possível adicionar um telefone");
    BtnFirstStepSubmitClick();
    cy.contains("CEP").should("be.visible");
  });
});
