import { genericsValues } from "../share-functions";

export const BtnFirstStepSubmitClick = () =>
  cy.get("#first-step-btn-submit").click();

export const BtnSecondStepSubmitClick = () =>
  cy.get("#second-step-btn-submit").click({ animationDistanceThreshold: 1 });

export const BtnThirdStepSubmitClick = () =>
  cy.get("#third-step-btn-submit").click({ animationDistanceThreshold: 1 });

export function firstAndSecontStepInfo() {
  cy.intercept("GET", "/api/cep/v1/21735652").as("zipcodeRequest");

  genericsValues.userInfo.name();
  genericsValues.userInfo.email();
  genericsValues.userInfo.phone();
  BtnFirstStepSubmitClick();

  genericsValues.addressInfo.zipcode();
  cy.wait("@zipcodeRequest").its("responseWaited");
  genericsValues.addressInfo.addressNumber();
  genericsValues.addressInfo.complement();
  BtnSecondStepSubmitClick();
}

export function SingleCheckoutInformations() {
  cy.intercept("GET", "`https://viacep.com.br/ws/*").as("zipcodeRequest");
  genericsValues.userInfo.name();
  genericsValues.userInfo.email();
  genericsValues.userInfo.phone();
  genericsValues.userInfo.document();
  genericsValues.addressInfo.zipcode();
  cy.wait("@zipcodeRequest");
  genericsValues.addressInfo.addressNumber();
  genericsValues.addressInfo.complement();
}
