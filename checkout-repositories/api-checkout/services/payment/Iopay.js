const HTTPClient = require('../HTTPClient');
const AWS = require('../../config/dynamo');

const {
  IOPAY_URL = 'https://sandbox.api.iopay.com.br/api/',
  ENVIRONMENT = 'DEVSs',
} = process.env;

const { get, set } = require('../../config/redis');

const parseAddress = (address) => ({
  line1: address.street || '',
  line2: address.number || '',
  line3: null,
  neighborhood: address.district || '',
  city: address.city || '',
  state: address.state || '',
  postal_code: address.zipcode || '',
  country_code: 'BR',
});

module.exports = class Iopay {
  #service;

  id_provider;

  #provider;

  constructor({ id_provider }) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.headers_card_token = {
      'Content-Type': 'application/json',
    };
    this.#service = new HTTPClient({
      baseURL: `${IOPAY_URL}`,
    });
    this.id_provider = id_provider;
    this.#provider = {};
  }

  async getProvider() {
    if (Object.keys(this.#provider).length === 0) {
      const docClient = new AWS.DynamoDB.DocumentClient();
      const params = {
        TableName: 'providers',
        Key: {
          id: this.id_provider,
        },
      };
      const data = await docClient.get(params).promise();
      if (!data?.Item?.secret) throw new Error('cannot get dynamo data');
      this.#provider = {
        email: data.Item.email,
        secret: data.Item.secret,
        seller: data.Item.seller,
      };
    }
    return this.#provider;
  }

  async getToken() {
    await this.getProvider(this.id_provider);
    const cachedToken = await get(
      `${ENVIRONMENT}_token_iopay_${this.id_provider}`,
    );
    if (cachedToken) {
      const data = JSON.parse(cachedToken);
      if (data && data.access_token) {
        this.headers.Authorization = `Bearer ${data.access_token}`;
        return;
      }
    }
    const body = {
      email: this.#provider.email,
      secret: this.#provider.secret,
      io_seller_id: this.#provider.seller,
    };
    const response = await this.#service.post('auth/login', body, {
      headers: this.headers,
    });
    await set(
      `${ENVIRONMENT}_token_iopay_${this.id_provider}`,
      JSON.stringify(response.data),
      'EX',
      response.data.expires_in - 10,
    );
    this.headers.Authorization = `Bearer ${response.data.access_token}`;
  }

  async createClient({
    firstName,
    lastName,
    email,
    phone,
    address,
    document_number,
  }) {
    const body = {
      first_name: firstName,
      last_name: lastName,
      email,
      taxpayer_id: document_number,
      phone_number: phone,
      address: address
        ? parseAddress(address)
        : {
            street: 'Av Pau Brasil',
            number: '6',
            city: 'Brasilia',
            state: 'DF',
            postal_code: '71916-500',
            country: 'Brasil',
          },
    };
    const response = await this.#service.post('v1/customer/new', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async updateClient(address, id_customer) {
    const body = {
      address: parseAddress(address),
    };
    const response = await this.#service.post(
      `v1/customer/update/${id_customer}`,
      body,
      {
        headers: this.headers,
      },
    );
    return response.data;
  }

  async createCardToken({ number, cvv, month, year, name }) {
    await this.getProvider(this.id_provider);
    const cachedToken = await get(
      `${ENVIRONMENT}_token_iopay_card_tokenize_${this.id_provider}`,
    );
    if (cachedToken) {
      const data = JSON.parse(cachedToken);
      if (data && data.access_token) {
        this.headers_card_token.Authorization = `Bearer ${data.access_token}`;
      }
    } else {
      const body = {
        email: this.#provider.email,
        secret: this.#provider.secret,
        io_seller_id: this.#provider.seller,
      };
      const response = await this.#service.post(
        'v1/card/authentication',
        body,
        {
          headers: this.headers,
        },
      );
      await set(
        `${ENVIRONMENT}_token_iopay_card_tokenize_${this.id_provider}`,
        JSON.stringify(response.data),
        'EX',
        response.data.expires_in - 10,
      );
      this.headers_card_token.Authorization = `Bearer ${response.data.access_token}`;
    }

    const body = {
      holder_name: name,
      expiration_month: month,
      expiration_year: year,
      card_number: number,
      security_code: cvv,
    };
    const response = await this.#service.post('v1/card/tokenize/token', body, {
      headers: this.headers_card_token,
    });
    return response.data;
  }

  async clientCardToken({ id_customer, token }) {
    const body = {
      id_customer,
      token,
    };
    const response = await this.#service.post(
      'v1/card/associeate_token_with_customer',
      body,
      {
        headers: this.headers_card_token,
      },
    );
    return response.data;
  }

  async createOrder({
    id_customer,
    items,
    external_id,
    amount,
    description,
    installments = 1,
    commissions,
    statement_descriptor,
  }) {
    const products = items.map((element) => ({
      name: element.name,
      quantity: element.qtd,
      code: element.uuid.substring(element.uuid.length - 32),
      amount: parseInt((Number(element.amount) * 100).toFixed(0), 10),
    }));

    const body = {
      amount: parseInt((Number(amount) * 100).toFixed(0), 10),
      currency: 'BRL',
      description,
      capture: 1,
      statement_descriptor: statement_descriptor || 'Venda na B4you',
      installment_plan: {
        number_installments: installments,
      },
      io_seller_id: this.#provider.seller,
      payment_type: 'credit',
      reference_id: external_id,
      products,
      split_rules: commissions,
    };

    const response = await this.#service.post(
      `v1/transaction/new/${id_customer}`,
      body,
      {
        headers: this.headers,
      },
    );

    return response;
  }

  async createPix({ id_customer, external_id, amount, commissions }) {
    const body = {
      amount: parseInt((Number(amount) * 100).toFixed(0), 10),
      currency: 'BRL',
      io_seller_id: this.#provider.seller,
      payment_type: 'pix',
      reference_id: external_id,
      split_rules: commissions,
    };
    const response = await this.#service.post(
      `v1/transaction/new/${id_customer}`,
      body,
      {
        headers: this.headers,
      },
    );

    return response;
  }

  async createBillet({
    id_customer,
    external_id,
    amount,
    items,
    soft_descriptor,
    expiration_date,
    commissions,
    description,
  }) {
    const products = items.map((element) => ({
      name: element.name,
      quantity: element.qtd,
      code: element.uuid.substring(element.uuid.length - 32),
      amount: parseInt((Number(element.amount) * 100).toFixed(0), 10),
    }));
    const body = {
      amount: parseInt((Number(amount) * 100).toFixed(0), 10),
      currency: 'BRL',
      description,
      io_seller_id: this.#provider.seller,
      payment_type: 'boleto',
      reference_id: external_id,
      products,
      statement_descriptor: soft_descriptor,
      expiration_date,
      payment_limit_date: expiration_date,
      split_rules: commissions,
    };
    const response = await this.#service.post(
      `v1/transaction/new/${id_customer}`,
      body,
      {
        headers: this.headers,
      },
    );

    return response;
  }

  async refundOrder({ id, amount }) {
    const body = {
      amount,
    };
    const response = await this.#service.post(
      `v1/transaction/void/${id}`,
      body,
      {
        headers: this.headers,
      },
    );
    return response.data.success;
  }

  async getOrder(id) {
    const response = await this.#service.get(`v1/transaction/get/${id}`, {
      headers: this.headers,
    });
    return response.data;
  }

  async createSeller(body) {
    const response = await this.#service.post(
      `v1/sellers/create/individuals`,
      body,
      {
        headers: this.headers,
      },
    );
    return response;
  }

  async getSellers() {
    const response = await this.#service.get(`v1/sellers/list`, {
      headers: this.headers,
    });
    return response.data;
  }

  async getCustomer(id_customer) {
    const response = await this.#service.get(`v1/customer/get/${id_customer}`, {
      headers: this.headers,
    });
    return response.data;
  }

  async createOrderUpsell({
    id_customer,
    items,
    external_id,
    amount,
    description,
    installments = 1,
    commissions,
    card_token,
    statement_descriptor,
  }) {
    const products = items.map((element) => ({
      name: element.name,
      quantity: element.qtd,
      code: element.uuid.substring(element.uuid.length - 32),
      amount: parseInt((Number(element.amount) * 100).toFixed(0), 10),
    }));

    const body = {
      id_card: card_token,
      amount: parseInt((Number(amount) * 100).toFixed(0), 10),
      currency: 'BRL',
      description,
      capture: 1,
      statement_descriptor: statement_descriptor || 'B4You',
      installment_plan: {
        number_installments: installments,
      },
      io_seller_id: this.#provider.seller,
      payment_type: 'credit',
      reference_id: external_id,
      products,
      split_rules: commissions,
    };
    const response = await this.#service.post(
      `v1/transaction/new/${id_customer}`,
      body,
      {
        headers: this.headers,
      },
    );

    return response;
  }
};
