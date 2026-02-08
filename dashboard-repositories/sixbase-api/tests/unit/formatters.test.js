const formatters = require('../../utils/formatters');

const makeSut = () => {
  const sut = formatters;
  return {
    sut,
  };
};

describe('Formatters', () => {
  it('should format to BRL coin', () => {
    const { sut } = makeSut();
    const value = sut.formatBRL(100);
    expect(value).toBe('R$\xa0100,00');
  });

  it('should not capitalize empty name', () => {
    const { sut } = makeSut();
    const name = null;
    const nameTest = sut.capitalizeName(name);
    expect(nameTest).toBe('');
  });

  it('should capitalize name', () => {
    const { sut } = makeSut();
    const name = 'any name';
    const nameTest = sut.capitalizeName(name);
    expect(nameTest).toBe('Any Name');
  });

  it('should throw error when slugify null text', () => {
    const { sut } = makeSut();
    const text = null;
    let error = null;
    try {
      sut.slugify(text);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it('should slugify text', () => {
    const { sut } = makeSut();
    const text = 'any text';
    const testText = sut.slugify(text);
    expect(testText).toBe(text.replace(' ', '-'));
  });

  it('should throw error when formatting document', () => {
    const { sut } = makeSut();
    const document = null;
    let error = null;
    try {
      sut.formatDocument(document);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('document null or undefined');
  });

  it('should return cpf format', () => {
    const { sut } = makeSut();
    const document = '86070103017';
    const formattedDocument = sut.formatDocument(document);
    expect(formattedDocument).toBe('860.701.030-17');
  });

  it('should return cnpj format', () => {
    const { sut } = makeSut();
    const document = '65691089000125';
    const formattedDocument = sut.formatDocument(document);
    expect(formattedDocument).toBe('65.691.089/0001-25');
  });

  it('should throw error formatting null phone', () => {
    const { sut } = makeSut();
    const phone = null;
    let error = null;
    try {
      sut.formatPhone(phone);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it('should format cellphone', () => {
    const { sut } = makeSut();
    const phone = '47999999999';
    const phoneTest = sut.formatPhone(phone);
    expect(phoneTest).toBe('(47) 99999-9999');
  });

  it('should not format phone', () => {
    const { sut } = makeSut();
    const phone = '4733333333';
    const phoneTest = sut.formatPhone(phone);
    expect(phoneTest).toBe(phone);
  });

  it('should throw error if email is not defined', () => {
    const { sut } = makeSut();
    const email = null;
    let error = null;
    try {
      sut.transformEmailToName(email);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('Expect email to be not undefined or null');
  });

  it('should throw error if email is not a string', () => {
    const { sut } = makeSut();
    const email = 1.23;
    let error = null;
    try {
      sut.transformEmailToName(email);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('email must be a string');
  });

  it('should throw error if email is invalid', () => {
    const { sut } = makeSut();
    const email = 'invalid email';
    let error = null;
    try {
      sut.transformEmailToName(email);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('email is invalid');
  });

  it('should return name from email', () => {
    const { sut } = makeSut();
    const email = 'any_email@mail.com';
    const name = sut.transformEmailToName(email);
    expect(name).toBe(email.split('@')[0]);
  });

  it('should throw error if whatsapp is undefined', () => {
    const { sut } = makeSut();
    const whatsapp = null;
    let error = null;
    try {
      sut.formatWhatsapp(whatsapp);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it('should return formatted whatsapp', () => {
    const { sut } = makeSut();
    const whatsapp = '47 99999-9999';
    const formattedWhatsapp = sut.formatWhatsapp(whatsapp);
    expect(formattedWhatsapp).toBe('4799999-9999');
  });

  it('should throw error if name is undefined', () => {
    const { sut } = makeSut();
    const name = null;
    let error = null;
    try {
      sut.formatName(name);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it('should return formatted name', () => {
    const { sut } = makeSut();
    const name = 'Any Name';
    const formattedName = sut.formatName(name);
    expect(formattedName).toBe('any name');
  });

  it('should throw error if string is undefined', () => {
    const { sut } = makeSut();
    const string = null;
    let error = null;
    try {
      sut.stringToBase64(string);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it('should return base64 string', () => {
    const { sut } = makeSut();
    const string = 'any string';
    const base64String = sut.stringToBase64(string);
    expect(base64String).toBeDefined();
    expect(typeof base64String).toBe('string');
  });

  it('should throw error if data is undefined', () => {
    const { sut } = makeSut();
    const data = null;
    let error = null;
    try {
      sut.SHA256(data);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it('should return sha256 format', () => {
    const { sut } = makeSut();
    const string = 'any string';
    const sha256 = sut.SHA256(string);
    expect(sha256).toBeDefined();
    expect(typeof sha256).toBe('string');
  });

  it('should return 0 when number is null or undefined', () => {
    const { sut } = makeSut();
    const float = null;
    const value = sut.floatAmountToInteger(float);
    expect(value).toBe(0);
  });

  it('should return integer number part', () => {
    const { sut } = makeSut();
    const float = 1.25;
    const value = sut.floatAmountToInteger(float);
    expect(value).toBe(float * 100);
  });
});
