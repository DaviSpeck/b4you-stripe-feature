const { getCreditCardNameByNumber } = require('creditcard.js');

const creditCardBrandParser = (cardNumber) => {
  const brand = getCreditCardNameByNumber(cardNumber);
  const data = {
    'American Express': 'amex',
    Aura: 'aura',
    Diners: 'diners',
    Discover: 'discover',
    Elo: 'elo',
    Hipercard: 'hiper',
    Mastercard: 'master',
    Visa: 'visa',
  };
  return data[brand];
};

module.exports = {
  creditCardBrandParser,
};
