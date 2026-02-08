import { HttpClient as HTTPClient } from './HTTPClient.mjs';
import { date } from '../utils/date.mjs';

const {
  PAGARME_URL,
  PAGARME_PASSWORD,
  PAGARME_RECEIVER_ID,
  PAGARME_PASSWORD_3,
  PAGARME_RECEIVER_ID_3,
} = process.env;

const parsePhoneNumber = (phone) => ({
  country_code: '55',
  area_code: phone.slice(0, 2),
  number: phone.slice(2, phone.length),
});

const addressParser = (address) => {
  if (!address) return null;
  if (typeof address === 'object' && Object.keys(address).length === 0) return null;
  const { street, number, neighborhood, city, state, complement, zipcode } = address;
  return {
    line_1: `${number},${street},${neighborhood}`,
    line_2: complement,
    zip_code: zipcode,
    city,
    state,
    country: 'BR',
  };
};

const splitsParser = (commissions, amount, provider) => {
  const pagarmeSplits = commissions.map((e) => ({
    recipient_id: e.id_seller,
    type: 'flat',
    amount: Math.floor(parseFloat(e.amount) * 100),
    options: {
      charge_processing_fee: false,
      charge_remainder_fee: false,
      liable: true,
    },
  }));

  const totalCommissions = pagarmeSplits.reduce((acc, obj) => acc + obj.amount, 0);

  pagarmeSplits.push({
    recipient_id: provider === 'B4YOU_PAGARME_2' ? PAGARME_RECEIVER_ID : PAGARME_RECEIVER_ID_3,
    type: 'flat',
    amount: Math.round(amount * 100 - totalCommissions),
    options: {
      charge_processing_fee: true,
      charge_remainder_fee: true,
      liable: true,
    },
  });
  return pagarmeSplits;
};

const translatePaymentStatus = (status) => {
  if (status === 'pending')
    return {
      label: 'created',
      charge: 1,
      transaction: 1,
      sale: 1,
      subscription: 2,
    };
  if (status === 'paid')
    return {
      label: 'paid',
      charge: 2,
      transaction: 2,
      sale: 2,
      subscription: 1,
    };
  return {
    label: 'rejected',
    charge: 4,
    transaction: 4,
    sale: 3,
    subscription: 3,
  };
};

export class Pagarme {
  #service;

  #provider;

  constructor(provider) {
    let envPassword = null;
    if (provider === 'B4YOU_PAGARME_2') {
      envPassword = PAGARME_PASSWORD;
    }

    if (provider === 'B4YOU_PAGARME_3') {
      envPassword = PAGARME_PASSWORD_3;
    }

    this.#provider = provider;

    this.headers = {
      'Authorization': `Basic ${Buffer.from(`${envPassword}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
    this.#service = new HTTPClient({
      baseURL: `${PAGARME_URL}`,
    });
  }

  /**
   * @param {array} sale array of object like this -> [{name: 'caneta', qtd: 1,  uuid: '1234', }]
   * */
  async createOrder({
    items,
    customer: { provider_external_id, ip, address },
    splits,
    card: { number, cvv, month, year, name, installments = 1, soft_descriptor = 'B4you' },
    amount,
    external_id,
  }) {
    const parsedAddress = addressParser(address);
    const body = {
      items,
      customer_id: provider_external_id,
      payments: [
        {
          split: splitsParser(splits, amount, this.#provider),
          payment_method: 'credit_card',
          credit_card: {
            recurrence: false,
            installments,
            statement_descriptor: soft_descriptor,
            card: {
              number,
              holder_name: name,
              exp_month: month,
              exp_year: year,
              cvv,
              billing_address: parsedAddress,
            },
          },
        },
      ],
      code: `${external_id}`,
      ip,
      amount: Math.round(amount * 100),
    };
    const { data } = await this.#service.post('/orders', body, {
      headers: this.headers,
    });
    let provider_response = 'Negado';
    if (data.status === 'failed') {
      // eslint-disable-next-line
      console.log(
        'response pagarme failed->',
        JSON.stringify(data.charges[0].last_transaction, null, 4)
      );

      const { acquirer_return_code, acquirer_message, antifraud_response } =
        data.charges[0].last_transaction;
      const acquirerResponse = messages.find((c) => c.id === acquirer_return_code);
      if (acquirerResponse) {
        provider_response = acquirerResponse.message;
      } else {
        provider_response = acquirer_message;
      }
      if (antifraud_response && antifraud_response.status === 'reproved')
        provider_response = 'Negado pelo antifraude';
    }
    if (data.status === 'rejected') {
      // eslint-disable-next-line
      console.log(
        'response pagarme rejected->',
        JSON.stringify(data.charges[0].last_transaction, null, 4)
      );

      const { acquirer_return_code, antifraud_response } = data.charges[0].last_transaction;
      const acquirerResponse = messages.find((c) => c.id === acquirer_return_code);
      if (acquirerResponse) {
        provider_response = acquirerResponse.message;
      }
      if (antifraud_response && antifraud_response.status === 'reproved')
        provider_response = 'Negado pelo antifraude';
    }
    return {
      ...data,
      status: translatePaymentStatus(data.status),
      provider: this.#provider,
      provider_id: data.charges[0].id,
      provider_response,
    };
  }

  async createPix({ items, customer: { provider_external_id, ip }, splits, amount, external_id }) {
    const body = {
      items,
      customer_id: provider_external_id,
      payments: [
        {
          split: splitsParser(splits, amount, this.#provider),
          amount: Math.round(amount * 100),
          payment_method: 'pix',
          Pix: {
            expires_at: date().add(3, 'days').format('YYYY-MM-DDTHH:mm:ss'),
          },
        },
      ],
      code: `${external_id}`,
      ip,
    };
    console.log(JSON.stringify(body, null, 2));
    const { data } = await this.#service.post('/orders', body, {
      headers: this.headers,
    });
    if (data.status === 'failed') {
      console.log(data);
      throw new Error('error generating pix');
    }
    return {
      ...data,
      status: translatePaymentStatus(data.status),
      qrcode_url: data.charges[0].last_transaction.qr_code_url,
      qrcode: data.charges[0].last_transaction.qr_code,
      provider: this.#provider,
      provider_id: data.charges[0].id,
    };
  }

  async createBillet({
    items,
    customer: { provider_external_id, ip },
    splits,
    amount,
    external_id,
    due_date,
  }) {
    const body = {
      items,
      customer_id: provider_external_id,
      payments: [
        {
          payment_method: 'boleto',
          boleto: {
            due_at: due_date,
          },
          split: splitsParser(splits, amount, this.#provider),
        },
      ],
      code: `${external_id}`,
      ip,
      amount: Math.round(amount * 100),
    };
    const { data } = await this.#service.post('/orders', body, {
      headers: this.headers,
    });
    if (data.status === 'failed') {
      console.log(data);
      throw new Error('error generating billet');
    }
    return {
      ...data,
      status: translatePaymentStatus(data.status),
      line_code: data.charges[0].last_transaction.line,
      url: data.charges[0].last_transaction.url,
      qrcode_url: data.charges[0].last_transaction.qr_code,
      provider: this.#provider,
      provider_id: data.charges[0].id,
    };
  }

  async createOrderWithToken({
    items,
    customer: { provider_external_id, ip },
    splits,
    card: { token, installments = 1, statement_descriptor = 'B4you' },
    amount,
    external_id,
  }) {
    const body = {
      items,
      customer_id: provider_external_id,
      payments: [
        {
          split: splitsParser(splits, amount, this.#provider),
          payment_method: 'credit_card',
          credit_card: {
            recurrence: false,
            installments,
            statement_descriptor,
            card_id: token,
          },
        },
      ],
      code: `${external_id}`,
      ip,
      amount: Math.round(amount * 100),
    };
    const { data } = await this.#service.post('/orders', body, {
      headers: this.headers,
    });
    return {
      ...data,
      status: translatePaymentStatus(data.status),
      provider: this.#provider,
      provider_id: data.charges[0].id,
    };
  }

  async createClient({ first_name, last_name, email, document_number, whatsapp, address = {} }) {
    const body = {
      name: `${first_name} ${last_name}`,
      email,
      document: document_number,
      type: 'individual',
      address: addressParser(address),
      phones: {
        mobile_phone: parsePhoneNumber(whatsapp),
      },
    };

    const { data } = await this.#service.post('/customers', body, {
      headers: this.headers,
    });

    return {
      ...data,
      id: data.id,
    };
  }

  async createCardToken({ provider_external_id, card_number, cvv, month, year, card_holder }) {
    const body = {
      number: card_number,
      holder_name: card_holder,
      exp_month: parseInt(month, 10),
      exp_year: parseInt(year, 10),
      cvv,
    };
    const { data } = await this.#service.post(`/customers/${provider_external_id}/cards`, body, {
      headers: this.headers,
    });
    return {
      token: data.id,
    };
  }

  async updateCreditCard({ card_number, cvv, month, year, card_holder, charge_id }) {
    const body = {
      card: {
        number: card_number,
        holder_name: card_holder,
        exp_month: parseInt(month, 10),
        exp_year: parseInt(year, 10),
        cvv,
      },
    };

    const { data } = await this.#service.patch(`/charges/${charge_id}/card`, body, {
      headers: this.headers,
    });
    return data;
  }

  async retryCharge(charge_id) {
    const { data } = await this.#service.post(
      `/charges/${charge_id}/retry`,
      {},
      {
        headers: this.headers,
      }
    );
    console.log('reprocessing sale', data);
    return data;
  }
}
