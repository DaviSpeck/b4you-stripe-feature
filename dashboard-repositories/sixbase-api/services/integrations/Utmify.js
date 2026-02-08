const HTTPClient = require('../HTTPClient');

const { UTMIFY_URL = 'https://api.utmify.com.br/api-credentials' } =
  process.env;

class Utmify {
  #service;

  constructor(token) {
    this.headers = {
      'Content-Type': 'application/json',
      'x-api-token': token,
    };
    this.#service = new HTTPClient({ baseURL: UTMIFY_URL });
  }

  async postOrder() {
    const body = {};
    const response = await this.#service.psot('/orders', body, {
      headers: this.headers,
    });
    return response.data;
  }
}

module.exports = Utmify;
