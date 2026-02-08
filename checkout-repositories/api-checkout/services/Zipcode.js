const ApiError = require('../error/ApiError');

module.exports = class Zipcode {
  #service;

  constructor(service) {
    this.#service = service;
  }

  async consult(zipcode) {
    if (typeof zipcode !== 'string')
      throw ApiError.badRequest('Zipcode deve ser uma string');
    const filteredZipcode = zipcode.replace(/\D/g, '');
    if (filteredZipcode.length !== 8)
      throw ApiError.badRequest('CEP deve ter 8 dígitos');
    try {
      const { data } = await this.#service.get(`/${filteredZipcode}/json/`);
      if (data.erro) {
        return null;
      }
      const { logradouro, complemento, bairro, localidade, uf } = data;
      return {
        zipcode: filteredZipcode,
        street: logradouro,
        complement: complemento,
        neighborhood: bairro,
        city: localidade,
        state: uf,
      };
    } catch (error) {
      return null;
    }
  }
};
