const CreditCard = require('../../utils/helpers/CreditCard');

describe('testing credit card helper', () => {
  it('should return invalid credit card', () => {
    const isValid = new CreditCard({
      card_number: '5495552089539770',
      card_holder: 'vinicius palma',
      expiration_date: '02/21',
      cvv: '639',
    }).isValid();

    expect(isValid).toBe(false);
  });

  it('should return invalid credit card if card number is invalid', () => {
    const isValid = new CreditCard({
      card_number: 'invalid_card',
      expiration_date: '01/29',
    }).isValid();
    expect(isValid).toBe(false);
  });

  it('should return invalid credit card if cvv is invalid', () => {
    const isValid = new CreditCard({
      card_number: '5495552089539770',
      expiration_date: '01/29',
      cvv: 'invalid_cvv',
    }).isValid();
    expect(isValid).toBe(false);
  });

  it('should return valid credit card', () => {
    const isValid = new CreditCard({
      card_number: '5495552089539770',
      card_holder: 'vinicius palma',
      expiration_date: '02/29',
      cvv: '639',
    }).isValid();

    expect(isValid).toBe(true);
  });

  it('should get credit card data', () => {
    const { brand, date } = new CreditCard({
      card_number: '5495552089539770',
      card_holder: 'vinicius palma',
      expiration_date: '02/25',
      cvv: '639',
    }).getFullData();

    expect(brand.name).toBe('Mastercard');
    expect(brand.psp_brand).toBe('master');
    expect(date.expiration_month).toBe('02');
    expect(date.expiration_year).toBe('25');
    expect(date.four_digits_year).toBe('2025');
    expect(date.full_date).toBe('02/25');
    expect(date.two_digits_year).toBe('25');
  });
});
