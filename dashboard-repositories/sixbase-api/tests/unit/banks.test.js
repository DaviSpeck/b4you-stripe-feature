const banks = require('../../utils/banks');

const makeSut = () => {
  const sut = banks;
  return { sut };
};

describe('Banks', () => {
  it('should throw error if type is undefined or null', () => {
    const { sut } = makeSut();
    let error = null;
    try {
      sut.findBank(null);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('type must be provided');
  });

  it('should throw error if type is not a string', () => {
    const { sut } = makeSut();
    let error = null;
    try {
      sut.findBank(123);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('type must be string');
  });

  it('should return undefined if bank is not found', () => {
    const { sut } = makeSut();
    const value = 'any bank';
    const bank = sut.findBank(value);
    expect(bank).toBeUndefined();
  });

  it('should be called with correct value', () => {
    const { sut } = makeSut();
    const value = 'any bank';
    const spyBank = jest.spyOn(banks, 'findBank');
    sut.findBank(value);
    expect(spyBank).toHaveBeenCalledWith(value);
  });

  it('should return a bank', () => {
    const { sut } = makeSut();
    const { value, ispb, label } = banks.banks[0];
    const bank = sut.findBank(value);
    expect(bank).toBeDefined();
    expect(bank.ispb).toBeDefined();
    expect(bank.label).toBeDefined();
    expect(bank.value).toBeDefined();
    expect(bank.ispb).toBe(ispb);
    expect(bank.label).toBe(label);
    expect(bank.value).toBe(value);
  });
});
