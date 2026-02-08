const card = require('../../utils/card');

const makeSut = () => {
  const sut = card;
  return { sut };
};

describe('card', () => {
  it('should return undefined if card number is undefined or null', () => {
    const { sut } = makeSut();
    const cardNumber = null;
    const cardBrand = sut.creditCardBrandParser(cardNumber);
    expect(cardBrand).toBeUndefined();
  });

  it('should return card brand with correct value', () => {
    const { sut } = makeSut();
    const visaCard = '4929 5200 6689 1380';
    const cardBrand = sut.creditCardBrandParser(visaCard);
    expect(cardBrand).toBe('visa');
  });

  it('should be called with correct card', () => {
    const { sut } = makeSut();
    const cardNumber = 'any card';
    const cardSpy = jest.spyOn(card, 'creditCardBrandParser');
    sut.creditCardBrandParser(cardNumber);
    expect(cardSpy).toHaveBeenCalledWith(cardNumber);
  });
});
