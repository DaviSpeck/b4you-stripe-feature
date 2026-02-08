import { HttpClient } from './HTTPClient.mjs';
import awsConfig from '../config/dynamo.mjs';

const { IOPAY_URL = 'https://sandbox.api.iopay.com.br/api/', ENVIRONMENT = 'sandbox' } =
  process.env;

export class Iopay {
  #service;

  id_provider;

  #provider;

  #io_seller_id;

  constructor({ id_provider, io_seller_id }) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#service = new HttpClient({
      baseURL: `${IOPAY_URL}`,
    });
    this.id_provider = Number(id_provider);
    this.#provider = {};
    this.#io_seller_id = io_seller_id;
  }

  async getProvider() {
    const docClient = new awsConfig.DynamoDB.DocumentClient();
    const params = {
      TableName: 'providers',
      Key: {
        id: this.id_provider,
      },
    };

    const data = await docClient.get(params).promise();
    if (data?.Item?.secret) {
      this.#provider = {
        email: data.Item.email,
        secret: data.Item.secret,
        seller: data.Item.seller,
      };
    }
  }

  async getToken() {
    const body = {
      email: this.#provider.email,
      secret: this.#provider.secret,
      io_seller_id: this.#io_seller_id,
    };

    const response = await this.#service.post('auth/login', body, {
      headers: this.headers,
    });
    this.headers.Authorization = `Bearer ${response.data.access_token}`;
  }

  async getUserBalance() {
    console.log('seller id', this.#io_seller_id);
    const response = await this.#service.get(`v1/sellers/get/${this.#io_seller_id}/balances`, {
      headers: this.headers,
    });
    return response.data.items;
  }

  async getBankAccounts() {
    const response = await this.#service.get(
      `v1/sellers/bank_accounts/list/${this.#io_seller_id}`,
      {
        headers: this.headers,
      }
    );
    return response.data;
  }

  async requestWithdrawal({ bank_account_id, amount }) {
    const body = {
      description: 'Saque',
      statement_descriptor: 'B4YOU',
      amount: parseInt((Number(amount) * 100).toFixed(0), 10),
    };
    const response = await this.#service.post(
      `v1/sellers/transfers/new/${this.#io_seller_id}/${bank_account_id}`,
      body,
      {
        headers: this.headers,
      }
    );
    return response.data;
  }
}
