export const requestPaymentObserver = {
  "credit-card": () =>
    cy.intercept("/api/payment/credit-card").as("creditCard"),
  "bank-slip": () => cy.intercept("/api/payment/bank-slip").as("bankSlip"),
  pix: () => cy.intercept("/api/payment/pix/payment-information").as("pix"),
};
