// Link documentação -> https://ajuda.bling.com.br/hc/pt-br/articles/360047064693-POST-pedido
const HTTPClient = require('../HTTPClient');

const { API_BLING } = process.env;

class Bling {
  #service;

  #apiKey;

  constructor(apiKey) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#apiKey = apiKey;
    this.#service = new HTTPClient({
      baseURL: `${API_BLING}`,
    });
  }

  async verifyCredentials() {
    try {
      const response = await this.#service.get(`pedidos/json/`, {
        params: {
          apikey: this.#apiKey,
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = Bling;
