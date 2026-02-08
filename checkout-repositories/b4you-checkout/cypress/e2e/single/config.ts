import { genericsValues } from "../share-functions";

export const BtnSubmitClick = () => cy.get("#btn-form-submit").click();

export function fieldInformations() {
  cy.intercept("GET", "https://viacep.com.br/ws/*").as("zipcodeRequest");
  genericsValues.userInfo.name();
  genericsValues.userInfo.email();
  genericsValues.userInfo.phone();
  genericsValues.userInfo.document();
}
