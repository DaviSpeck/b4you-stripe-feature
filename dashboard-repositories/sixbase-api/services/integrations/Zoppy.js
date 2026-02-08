const HttpClient = require('../HTTPClient');

// Link documentação -> https://partners-staging.zoppy.com.br/home

const { API_ZOPPY = 'https://api-partners.zoppy.com.br' } = process.env;

class Zoppy {
  #service;

  constructor(api_key) {
    this.api_key = api_key;
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.api_key}`,
      'zoppy-access': process.env.ZOPPY_TOKEN_ACCESS,
    };
    this.#service = new HttpClient({ baseURL: API_ZOPPY });
  }

  async verifyCredentials() {
    const response = await this.#service.get('/coupons/1', {
      headers: this.headers,
    });

    return response;
  }
}

module.exports = Zoppy;
