// Link documentação -> https://ajuda.bling.com.br/hc/pt-br/articles/360047064693-POST-pedido
import { HttpClient } from './HTTPClient.mjs';

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

    this.#API_BLING = process.env.API_BLING_V3 || 'https://bling.com.br/Api/v3/';

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
      console.log('error.response', error?.response?.data);
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

  async generateInvoice(id) {
    console.log('id', id);
    const {
      data: { data },
    } = await this.#service.get(`/pedidos/vendas/${id}`);
    console.log('data', data);

    if (data && data.notaFiscal && data.notaFiscal.id) {
      console.log('ja existe nota para esse pedido', data.notaFiscal.id);
      return {
        idNotaFiscal: data.notaFiscal.id,
      };
    } else {
      const {
        data: { data: response_data },
      } = await this.#service.post(`/pedidos/vendas/${id}/gerar-nfe`);
      console.log(`response bling`, response_data);
      return response_data;
    }
  }

  async generateServiceInvoice(body) {
    const {
      data: { data },
    } = await this.#service.post(`/nfse`, body);
    return data;
  }

  async confirmInvoice(id) {
    const {
      data: { data },
    } = await this.#service.post(`/nfse/${id}/enviar`, null);
    console.log('data', data);
    return data;
  }

  async getInvoice(id) {
    const {
      data: { data },
    } = await this.#service.get(`/nfse/${id}`, null);
    console.log('data', data);
    return data;
  }
}
