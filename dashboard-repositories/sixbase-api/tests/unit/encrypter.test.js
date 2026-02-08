const Encrypter = require('../../utils/helpers/encrypter');

describe('testing encrypter', () => {
  it('should encrypt data', async () => {
    const hash = await Encrypter.hash('encrypt this');
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
  });

  it('should be valid', async () => {
    const data = 'encrypt this string';
    const hash = await Encrypter.hash(data);
    const isValid = await Encrypter.compare(data, hash);
    expect(isValid).toBe(true);
  });

  it('should be invalid', async () => {
    const data = 'encrypt this string';
    const hash = await Encrypter.hash('encrypt this');
    const isValid = await Encrypter.compare(data, hash);
    expect(isValid).toBe(false);
  });
});
