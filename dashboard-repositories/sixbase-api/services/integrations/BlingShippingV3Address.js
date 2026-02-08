/* eslint-disable no-console */
const HTTPClient = require('../HTTPClient');

class Bling {
  #client_id;

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
    return new HTTPClient({
      baseURL: `${this.#API_BLING}`,
      headers: {
        Authorization: `Bearer ${this.#accessToken}`,
      },
    });
  }

  async refreshToken() {
    try {
      const authToken = Buffer.from(
        `${this.#BLING_CLIENT_ID}:${this.#BLING_CLIENT_SECRET}`,
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

  async updateAddress({ id_bling, address }) {
    let newOrder = null;
    try {
      console.log('trying get order bling', id_bling);
      const {
        data: { data: order },
      } = await this.#service.get(`/pedidos/vendas/${id_bling}`);
      console.log('order', JSON.stringify(order));
      newOrder = order;
    } catch (error) {
      console.log(error?.response?.data);
      throw error;
    }
    const { street, zipcode, state, city, neighborhood, number, complement } =
      address;
    newOrder.transporte.etiqueta = {
      nome: newOrder.transporte.etiqueta.nome,
      endereco: street,
      numero: number,
      complemento: complement,
      municipio: city,
      uf: state,
      cep: zipcode,
      bairro: neighborhood,
      nomePais: 'BRASIL',
    };

    try {
      console.log('trying update order bling', JSON.stringify(newOrder));
      const { data } = await this.#service.put(
        `/pedidos/vendas/${id_bling}`,
        newOrder,
      );
      console.log('new pedido', data);
      return data;
    } catch (error) {
      console.log(error?.response?.data);
      throw error;
    }
  }
}

module.exports = Bling;
