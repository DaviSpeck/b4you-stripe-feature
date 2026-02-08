const HTTPClient = require('../HTTPClient');

class Bling {
  #service;

  #client_id;

  #client_secret;

  constructor() {
    this.#client_id = process.env.BLING_CLIENT_ID;
    this.#client_secret = process.env.BLING_CLIENT_SECRET;
    const basic_auth = `${this.#client_id}:${this.#client_secret}`;

    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(basic_auth).toString('base64')}`,
    };

    this.#service = new HTTPClient({
      baseURL: `https://api.bling.com.br/v3/`,
    });
  }

  async generateToken(code) {
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'localhost:3000/apps/bling-shipping-v3/',
      });
      const response = await this.#service.post(`oauth/token`, body, {
        headers: this.headers,
      });
      if (response && response.data && response.data.refresh_token) {
        return response.data.refresh_token;
      }
      return null;
    } catch (error) {
      return error;
    }
  }

  getAuthorizeUrl() {
    return `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${
      this.#client_id
    }&state=acaa31d733c46ff6eef97b3206b7f221`;
  }
}

module.exports = Bling;
