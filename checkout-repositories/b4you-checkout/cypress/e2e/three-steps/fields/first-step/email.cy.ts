import { genericsValues, RedirectCheckoutPage } from "../../../share-functions";
import { BtnFirstStepSubmitClick } from "../../share-functions";

context("Three steps email test field", () => {
  beforeEach(() => {
    RedirectCheckoutPage({ offerType: "physical", type: "three-steps" });
    genericsValues.userInfo.name();
    genericsValues.userInfo.phone();
  });

  it("it should show up a helptext when email format is wrong", () => {
    const emailInput = cy.get("#field-email");
    emailInput.type("teste@teste");
    cy.get("#helptext-email")
      .should("be.visible")
      .and("contain", "email inválido");
    BtnFirstStepSubmitClick();
    cy.screenshot("Não é possível adicionar um email com o formato inválido");
  });

  it("it should show up a helptext when email is empty", () => {
    BtnFirstStepSubmitClick();
    cy.get("#helptext-email")
      .should("be.visible")
      .and("contain", "campo obrigatório");
    cy.screenshot("Não é possível deixar o email vazio");
  });

  it("Should able to write a email", () => {
    const emailInput = cy.get("#field-email");
    emailInput.type("email@email.com");
    BtnFirstStepSubmitClick();
    cy.contains("CEP").should("be.visible");
    cy.screenshot("É possível adicionar um email");
  });
});
