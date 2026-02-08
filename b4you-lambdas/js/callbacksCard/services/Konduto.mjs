import { HttpClient } from './HTTPClient.mjs';

const {
  KONDUTO_URL = 'https://api.konduto.com/v1/',
  KONDUTO_API_KEY_DIGITAL,
  KONDUTO_API_KEY_PHYSICAL,
} = process.env;

export class Konduto {
  #service;

  constructor(provider) {
    let envPassword = null;
    if (provider === 'DIGITAL') {
      envPassword = KONDUTO_API_KEY_DIGITAL;
    }

    if (provider === 'PHYSICAL') {
      envPassword = KONDUTO_API_KEY_PHYSICAL;
    }

    this.headers = {
      Authorization: `Basic ${Buffer.from(envPassword).toString('base64')}`,
      'Content-Type': 'application/json',
    };
    this.#service = new HttpClient({
      baseURL: `${KONDUTO_URL}`,
    });
  }

  async createBlock(data) {
    console.log('adding on konduto', data);
    const response = await this.#service.post(
      `greylist/email`,
      { email_address: data },
      {
        headers: this.headers,
      }
    );
    console.log('response konduto on create block', response.data);
  }

  async updateOrder(order_id) {
    try {
      const response = await this.#service.get(`/orders/${order_id}`, {
        headers: this.headers,
      });
      console.log('response', response?.data?.order);
    } catch (error) {
      console.log('pedido nao encontrado na konduto');
      return false;
    }
    console.log('atualizando pedido konduto');
    const response = await this.#service.put(
      `/orders/${order_id}`,
      { comments: 'CBK enviado pela pagarme', status: 'fraud' },
      {
        headers: this.headers,
      }
    );
    console.log('response update order konduto', response);
    return response;
  }
}
