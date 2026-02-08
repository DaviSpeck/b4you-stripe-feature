// Link documentação -> https://ajuda.bling.com.br/hc/pt-br/articles/360047064693-POST-pedido
import { HttpClient } from './HTTPClient.mjs';

const CANCELED_ID = 12;
export class BlingV3 {
  #refreshToken;

  #accessToken;

  #API_BLING;

  #BLING_CLIENT_ID;
  #BLING_CLIENT_SECRET;

  constructor(refreshToken, accessToken) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#refreshToken = refreshToken;
    this.#accessToken = accessToken;

    this.#API_BLING =
      process.env.API_BLING_V3 || 'https://api.bling.com.br/v3/';
    this.#BLING_CLIENT_ID = process.env.BLING_CLIENT_ID;
    this.#BLING_CLIENT_SECRET = process.env.BLING_CLIENT_SECRET;
  }

  get #service() {
    return new HttpClient({
      baseURL: `${this.#API_BLING}`,
      headers: {
        Authorization: `Bearer ${this.#accessToken}`,
      },
    });
  }

  async refreshToken() {
    try {
      const authToken = Buffer.from(
        `${this.#BLING_CLIENT_ID}:${this.#BLING_CLIENT_SECRET}`
      ).toString('base64');

      const form = new FormData();
      form.append('grant_type', 'refresh_token');
      form.append('refresh_token', this.#refreshToken);

      const response = await this.#service.post(`oauth/token`, form, {
        headers: {
          authorization: `Basic ${authToken}`,
        },
      });

      this.#accessToken = response?.data?.access_token;

      return response.data;
    } catch (error) {
      console.log('error.response', error?.response);
      throw error;
    }
  }

  async verifyCredentials() {
    try {
      return false;
    } catch {
      return false;
    }
  }

  async cancelOrder({ id_bling }) {
    try {
      console.log('trying get order bling', id_bling);
      const {
        data: { data: order },
      } = await this.#service.get(`/pedidos/vendas/${id_bling}`);
      console.log('order', JSON.stringify(order));
    } catch (error) {
      console.log(error?.response?.data);
      throw error;
    }
    const responseCancel = await this.#service.patch(
      `/pedidos/vendas/${id_bling}/situacoes/${CANCELED_ID}`
    );
    console.log('Response cancel ->', responseCancel);
  }
}
