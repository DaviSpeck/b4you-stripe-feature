import { getCreditCardNameByNumber } from 'creditcard.js';

export const creditCardBrandParser = (cardNumber) => {
  const brand = getCreditCardNameByNumber(cardNumber);
  const data = {
    'American Express': 'amex',
    'Amex': 'amex',
    'Aura': 'aura',
    'Diners': 'diners',
    'Discover': 'discover',
    'Elo': 'elo',
    'Hipercard': 'hiper',
    'Mastercard': 'master',
    'Visa': 'visa',
  };
  return data[brand];
};
