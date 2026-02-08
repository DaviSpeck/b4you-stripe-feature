const generators = require('../../utils/generators');

const makeSut = () => {
  const sut = generators;
  return {
    sut,
  };
};

describe('Generators', () => {
  it('should generate random password', () => {
    const { sut } = makeSut();
    const randomPassword = sut.generateRandomPassword();
    expect(randomPassword).toBeDefined();
    expect(typeof randomPassword).toBe('string');
  });

  it('should generate random code', () => {
    const { sut } = makeSut();
    const randomCode = sut.generateRandomCode();
    expect(randomCode).toBeDefined();
    expect(typeof randomCode).toBe('string');
  });

  it('should generate random code with 10 characters', () => {
    const { sut } = makeSut();
    const randomCode = sut.generateRandomCode(10);
    expect(randomCode).toBeDefined();
    expect(typeof randomCode).toBe('string');
    expect(randomCode.length).toBe(10);
  });
});
