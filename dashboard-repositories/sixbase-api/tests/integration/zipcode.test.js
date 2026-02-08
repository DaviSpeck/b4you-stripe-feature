const ApiError = require('../../error/ApiError');
const Zipcode = require('../../services/Zipcode');
const getError = require('../getError');
const HttpClient = require('../../services/HTTPClient');
require('dotenv').config();

const makeSut = () => {
  const service = new HttpClient({
    baseURL: process.env.ZIPCODE_SERVICE,
  });

  const sut = new Zipcode(service);
  return {
    sut,
  };
};

describe('zipcode', () => {
  it('should throw error if zipcode is not an string', async () => {
    const { sut } = makeSut();
    const error = await getError(() => sut.consult(123));
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(400);
  });

  it('should throw error if zipcode has not 8 digits', async () => {
    const { sut } = makeSut();
    const error = await getError(() => sut.consult('123'));
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(400);
  });

  it('should return null if address is not found', async () => {
    const { sut } = makeSut();
    const address = await sut.consult('12345678');
    expect(address).toBeNull();
  });

  it('should return address', async () => {
    const { sut } = makeSut();
    const address = await sut.consult('88330123');
    expect(address).not.toBeNull();
    expect(address.street).toBe('Avenida Normando Tedesco');
    expect(address.neighborhood).toBe('Centro');
    expect(address.city).toBe('Balneário Camboriú');
    expect(address.state).toBe('SC');
  });
});
