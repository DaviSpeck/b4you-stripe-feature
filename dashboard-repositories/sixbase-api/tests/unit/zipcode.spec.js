const ApiError = require('../../error/ApiError');
const Zipcode = require('../../services/Zipcode');
const getError = require('../getError');

const fakeService = () =>
  class Service {
    static async get() {
      return new Promise((resolve) => {
        resolve({});
      });
    }
  };

const makeSut = () => {
  const service = fakeService();
  const sut = new Zipcode(service);
  return {
    sut,
    service,
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
    const { sut, service } = makeSut();
    jest.spyOn(service, 'get').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolve(null);
        }),
    );
    const address = await sut.consult('12345678');
    expect(address).toBeNull();
  });

  it('should return address', async () => {
    const { sut, service } = makeSut();
    jest.spyOn(service, 'get').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolve({ data: { hello: true } });
        }),
    );
    const address = await sut.consult('88338270');
    expect(address).not.toBeNull();
  });

  it('should return address when zipcode is separated with -', async () => {
    const { sut, service } = makeSut();
    jest.spyOn(service, 'get').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolve({ data: { hello: true } });
        }),
    );
    const address = await sut.consult('88338-270');
    expect(address).not.toBeNull();
  });
});
