const {
  getCreditCardNameByNumber,
  isExpirationDateValid,
  isSecurityCodeValid,
  isValid,
} = require('creditcard.js');

const pspCardBrand = (cardNumber) => {
  const brand = getCreditCardNameByNumber(cardNumber);
  const data = {
    'American Express': 'amex',
    Aura: 'aura',
    Diners: 'diners',
    Discover: 'discover',
    Elo: 'elo',
    Hipercard: 'hipercard',
    Mastercard: 'master',
    Visa: 'visa',
  };
  return data[brand];
};

class CreditCard {
  constructor({ card_number, cvv, expiration_date, card_holder }) {
    const [month, year] = expiration_date.split('/');
    this.card_number = card_number;
    this.card_holder = card_holder;
    this.cvv = cvv;
    this.month = month;
    this.year = year;
    this.brand = getCreditCardNameByNumber(card_number);
    this.psp_brand = pspCardBrand(card_number);
  }

  isValid() {
    if (!isValid(this.card_number)) return false;
    if (!isExpirationDateValid(this.month, this.year)) return false;
    if (!isSecurityCodeValid(this.card_number, this.cvv)) return false;
    return true;
  }

  getFullData() {
    return {
      card_holder: this.card_holder,
      card_number: this.card_number,
      cvv: this.cvv,
      brand: {
        name: this.brand,
        psp_brand: this.psp_brand,
      },
      date: {
        full_date: `${this.month}/${this.year}`,
        four_digits_year:
          this.year.length === 4
            ? this.year
            : `${new Date().getFullYear().toString().substring(0, 2)}${
                this.year
              }`,
        two_digits_year:
          this.year.length === 2 ? this.year : this.year.slice(-2),
        expiration_month: this.month,
        expiration_year: this.year,
      },
    };
  }
}

module.exports = CreditCard;
