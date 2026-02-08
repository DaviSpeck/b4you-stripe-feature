const HttpClient = require('../HTTPClient');

module.exports = class Webhooks {
  #service;

  #headers;

  constructor(url, token = '') {
    this.#service = new HttpClient({ baseURL: url });
    this.#headers = {
      headers: {
        'X-Platform-Token': token,
        'Content-Type': 'application/json',
      },
    };
  }

  async testURL() {
    await this.#service.post('', null, this.#headers);
  }

  async send(body) {
    const response = await this.#service.post('', body, this.#headers);
    return response;
  }
};
