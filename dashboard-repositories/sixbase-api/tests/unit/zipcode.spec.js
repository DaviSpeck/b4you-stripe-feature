const { verifyRegionByZipcode } = require('../../utils/verifyRegionByZipcode');

describe('zipcode', () => {
  it('should return invalid message when zipcode is not 8 digits', () => {
    const result = verifyRegionByZipcode('123');
    expect(result).toBe('CEP inválido');
  });

  it('should return southern region for Santa Catarina zipcodes', () => {
    const result = verifyRegionByZipcode('88338-270');
    expect(result).toBe('SU');
  });

  it('should return northeastern region for Bahia zipcodes', () => {
    const result = verifyRegionByZipcode('40140110');
    expect(result).toBe('NE');
  });
});
