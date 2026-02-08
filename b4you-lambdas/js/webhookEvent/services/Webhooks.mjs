import { HttpClient } from './HTTPClient.mjs';

export class Webhooks {
  #service;

  #headers;

  constructor(url, token = '', arco = false) {
    this.#service = new HttpClient({ baseURL: url });
    const hasTokenParam = /\?token=/.test(url);
    this.#headers = {
      headers: hasTokenParam || arco
        ? {
          'X-Platform-Token': token,
          'Content-Type': 'application/json',
        }
        : {
          Authorization: token,
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
}
