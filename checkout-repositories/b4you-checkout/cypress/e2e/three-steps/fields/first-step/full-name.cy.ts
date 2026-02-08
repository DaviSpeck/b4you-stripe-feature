import { genericsValues, RedirectCheckoutPage } from "../../../share-functions";
import { BtnFirstStepSubmitClick } from "../../share-functions";

context("Three steps full name test field", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    genericsValues.userInfo.email();
    genericsValues.userInfo.phone();
  });

  it("it should show up a helptext when full name format is wrong", () => {
    const fullNameInput = cy.get("#field-full-name");
    fullNameInput.type("test");
    BtnFirstStepSubmitClick();
    cy.get("#helptext-full_name")
      .should("be.visible")
      .and("contain", "digite seu nome completo");
    cy.screenshot("Não é possível adicionar um nome inválido");
  });

  it("it should show up a helptext when full name is empty", () => {
    BtnFirstStepSubmitClick();
    cy.get("#helptext-full_name")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível adicionar um nome vazio");
  });

  it("Should able to write a full name", () => {
    const fullNameInput = cy.get("#field-full-name");
    fullNameInput.type("usuário teste");
    cy.screenshot("É possível adicionar um nome");
    BtnFirstStepSubmitClick();
    cy.contains("CEP").should("be.visible");
  });
});
