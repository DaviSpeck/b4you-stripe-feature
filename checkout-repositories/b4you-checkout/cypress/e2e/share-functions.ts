interface iParams {
  type: "three-steps" | "single";
  offerType: "physical" | "subscription";
}

export function RedirectCheckoutPage(params: iParams) {
  const { type = "three-steps", offerType = "physical" } = params;

  const offerUuid =
    offerType === "physical"
      ? Cypress.env("offerProductUuid")
      : Cypress.env("offerPlanUuid");

  const url = `${Cypress.env("base_url")}/checkout/${type}/${offerUuid}`;

  cy.visit(url);

  if (type === "three-steps") {
    cy.contains("Identifique-se").should("be.visible");
  }

  if (type === "single") {
    cy.contains("Resumo da compra").should("be.visible");
  }
}

export const genericsValues = {
  userInfo: {
    name: () => cy.get("#field-full-name").type("Rafael Filipe Heitor Ribeiro"),
    email: () => cy.get("#field-email").type("usuario@gmail.com"),
    phone: () => cy.get("#field-phone").type("99999999999"),
    document: () => cy.get("#field-document").type("40379403706"),
  },
  addressInfo: {
    zipcode: () => cy.get("#field-zipcode").type("21735652"),
    street: () => cy.get("#field-street").type("Rua teste"),
    addressNumber: () => cy.get("#field-number-address").type("123"),
    neighborhood: () => cy.get("#field-neighborhood").type("Bairro teste"),
    complement: () => cy.get("#field-complement").type("complemento de teste"),
  },
  cardInfo: {
    cardNumber: () => cy.get("#field-card-number").type("4000000000000010"),
    secreteCardNumber: () => cy.get("#field-secrete-card-number").type("393"),
    cardValidate: () => cy.get("#field-card-validate").type("0226"),
    cardHolderName: () =>
      cy.get("#field-holder-name").type("Rafael F H Ribeiro"),
  },
};
