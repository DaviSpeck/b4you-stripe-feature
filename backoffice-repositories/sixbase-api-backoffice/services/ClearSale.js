const HTTPClient = require('./HTTPClient');
const Clear_token = require('../database/models/Clear_token');

const { CLEAR_USER, CLEAR_PASSWORD } = process.env;

function buildTransactionBody({
  cpf,
  name,
  email,
  uuid_sale,
  whatsapp,
  address,
}) {
  const areaCode = parseInt(whatsapp?.slice(0, 2), 10);
  const number = parseInt(whatsapp?.slice(2), 10);

  const body = {
    documentType: 'CPF',
    document: cpf,
    name,
    email,
    identifierId: uuid_sale,
    phone: {
      countryCode: 55,
      areaCode,
      number,
      verified: false,
    },
  };

  if (address && Object.keys(address).length > 0) {
    body.address = {
      zipCode: address.zipcode || '',
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      district: address.neighborhood || '',
      city: address.city || '',
      state: address.state || '',
      country: 'Brasil',
    };
  }

  return body;
}

class ClearSaleService {
  #service;

  #config;

  constructor() {
    this.user = CLEAR_USER;
    this.password = CLEAR_PASSWORD;
    this.baseUrl = 'https://datatrustapi.clearsale.com.br/v1';
    this.token = null;
    this.#config = null;
    this.#service = new HTTPClient({
      baseURL: this.baseUrl,
    });
  }

  async authenticate() {
    const existingToken = await Clear_token.findOne({
      where: { id: 1 },
    });
    console.log('stored token', existingToken);
    console.log(
      'token data',
      new Date(existingToken.expires_at).getTime() > Date.now(),
    );
    if (
      existingToken &&
      existingToken.token &&
      new Date(existingToken.expires_at).getTime() > Date.now()
    ) {
      this.token = existingToken.token;
    } else {
      const resp = await this.#service.post('/authentication', {
        username: this.user,
        password: this.password,
      });
      const token = resp?.data?.token;
      if (!token) throw new Error('Token não retornado pela ClearSale.');
      const expiresIn = 7190;
      const expiresAt = Date.now() + expiresIn * 1000;
      console.log('expires_at', expiresAt);
      await Clear_token.update(
        { token, expires_at: expiresAt },
        {
          where: { id: 1 },
        },
      );
      this.token = token;

      console.log(
        `Novo token obtido e salvo. Expira em ${expiresIn} segundos.`,
      );
    }

    this.#config = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    };

    return this.token;
  }

  async createTransaction({ cpf, name, email, uuid_sale, whatsapp, address }) {
    try {
      await this.authenticate();

      const body = buildTransactionBody({
        cpf,
        name,
        email,
        uuid_sale,
        whatsapp,
        address,
      });

      const { data } = await this.#service.post(
        '/transaction',
        body,
        this.#config,
      );

      if (!data?.id) return null;

      const { data: scoreData } = await this.#service.post(
        `/transaction/${data.id}/scores`,
        {},
        this.#config,
      );

      return {
        transaction_id: data.id,
        data: scoreData ?? null,
      };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return null;
    }
  }
}

module.exports = new ClearSaleService();
