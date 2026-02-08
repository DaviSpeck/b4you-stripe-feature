const uuidHelper = require('../../utils/helpers/uuid');
const validations = require('../../utils/validations');

const makeSut = () => {
  const sut = validations;
  return {
    sut,
  };
};

describe('Email Validator', () => {
  it('should return invalid email', () => {
    const { sut } = makeSut();
    const email = 'invalid_email';
    const isValid = sut.validateEmail(email);
    expect(isValid).toBe(false);
  });

  it('should return valid email', () => {
    const { sut } = makeSut();
    const email = 'valid_email@mail.com';
    const isValid = sut.validateEmail(email);
    expect(isValid).toBe(true);
  });

  it('should be called with valid mail', () => {
    const { sut } = makeSut();
    const email = 'valid_email@mail.com';
    const emailSpy = jest.spyOn(validations, 'validateEmail');
    sut.validateEmail(email);
    expect(emailSpy).toHaveBeenCalledWith(email);
  });
});

describe('Phone Validator', () => {
  it('should return invalid phone', () => {
    const { sut } = makeSut();
    const phone = 'invalid_phone';
    const isValid = sut.validatePhone(phone);
    expect(isValid).toBe(false);
  });

  it('should return valid phone with cellphone fornat', () => {
    const { sut } = makeSut();
    const phone = '47999999999';
    const isValid = sut.validatePhone(phone);
    expect(isValid).toBe(true);
  });

  it('should return valid phone with phone fornat', () => {
    const { sut } = makeSut();
    const phone = '4733333333';
    const isValid = sut.validatePhone(phone);
    expect(isValid).toBe(true);
  });

  it('should be called with valid phone', () => {
    const { sut } = makeSut();
    const phone = 'any_phone';
    const phoneSpy = jest.spyOn(validations, 'validatePhone');
    sut.validatePhone(phone);
    expect(phoneSpy).toHaveBeenCalledWith(phone);
  });
});

describe('Document validator', () => {
  it('should return invalid document', () => {
    const { sut } = makeSut();
    const document = 'invalid_document';
    const isValid = sut.validateDocument(document);
    expect(isValid).toBe(false);
  });

  it('should return valid document', () => {
    const { sut } = makeSut();
    const document = '68328144026';
    const isValid = sut.validateDocument(document);
    expect(isValid).toBe(true);
  });

  it('should be called with valid phone', () => {
    const { sut } = makeSut();
    const document = 'any_document';
    const documentSpy = jest.spyOn(validations, 'validateDocument');
    sut.validateDocument(document);
    expect(documentSpy).toHaveBeenCalledWith(document);
  });
});

describe('Validate And Format Document', () => {
  it('should return status code 400 if invalid document', () => {
    const { sut } = makeSut();
    const document = 'invalid_document';
    let error = null;
    try {
      sut.validateAndFormatDocument(document);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Documento inválido');
  });

  it('should return document type and raw document if document is valid', () => {
    const { sut } = makeSut();
    const document = '68328144026';
    const data = sut.validateAndFormatDocument(document);
    expect(data).toBeDefined();
    expect(data.document_type).toBeDefined();
    expect(data.rawDocument).toBeDefined();
  });

  it('should be called with valid document', () => {
    const { sut } = makeSut();
    const document = 'any_document';
    const documentSpy = jest.spyOn(validations, 'validateAndFormatDocument');
    try {
      sut.validateAndFormatDocument(document);
      // eslint-disable-next-line no-empty
    } catch (error) {}
    expect(documentSpy).toHaveBeenCalledWith(document);
  });
});

describe('UUID Validator', () => {
  it('should return invalid uuid', () => {
    const { sut } = makeSut();
    const uuid = 'invalid_uuid';
    const isValid = sut.validateUUID(uuid);
    expect(isValid).toBe(false);
  });

  it('should return valid uuid', () => {
    const { sut } = makeSut();
    const uuid = uuidHelper.v4();
    const isValid = sut.validateUUID(uuid);
    expect(isValid).toBe(true);
  });

  it('should be called with correct uuid', () => {
    const { sut } = makeSut();
    const uuid = 'any_uuid';
    const uuidSpy = jest.spyOn(validations, 'validateUUID');
    sut.validateUUID(uuid);
    expect(uuidSpy).toHaveBeenCalledWith(uuid);
  });
});
