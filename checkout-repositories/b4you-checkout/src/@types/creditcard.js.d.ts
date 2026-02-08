declare module "creditcard.js" {
  export function isValid(cardNumber: string): boolean;

  export function isExpirationDateValid(month: string, year: string): boolean;

  export function isSecurityCodeValid(
    cardNumber: string,
    securityCode: string,
  ): boolean;

  export function getCreditCardNameByNumber(cardNumber: string): string | null;
}
