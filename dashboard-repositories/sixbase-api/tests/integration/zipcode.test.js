const { verifyRegionByZipcode } = require('../../utils/verifyRegionByZipcode');

describe('zipcode', () => {
  it('should return invalid message when zipcode is malformed', () => {
    const result = verifyRegionByZipcode('123');
    expect(result).toBe('CEP inválido');
  });

  it('should return region for southern zipcode', () => {
    const result = verifyRegionByZipcode('88330123');
    expect(result).toBe('SU');
  });

  it('should return region for southeastern zipcode', () => {
    const result = verifyRegionByZipcode('01310000');
    expect(result).toBe('SE');
  });
});
