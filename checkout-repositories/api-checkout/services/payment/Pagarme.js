const date = require('../../utils/helpers/date');
const HTTPClient = require('../HTTPClient');
const { messages } = require('./pagarmeResponses');

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

const addressParser = (address = {}) => {
  if (
    Object.keys(address).length === 0 &&
    process.env.ENVIRONMENT === 'SANDBOX'
  ) {
    return {
      line_1: `1315,avenida normando tedesco,centro`,
      line_2: 'sala 01',
      zip_code: '88330118',
      city: 'Balneario Camboriu',
      state: 'SC',
      country: 'BR',
    };
  }
  if (!address) return null;
  if (typeof address === 'object' && Object.keys(address).length === 0)
    return null;
  const { street, number, neighborhood, city, state, complement, zipcode } =
    address;
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

  const totalCommissions = pagarmeSplits.reduce(
    (acc, obj) => acc + obj.amount,
    0,
  );

  pagarmeSplits.push({
    recipient_id:
      provider === 'B4YOU_PAGARME_2'
        ? PAGARME_RECEIVER_ID
        : PAGARME_RECEIVER_ID_3,
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

class PagarMe {
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
      Authorization: `Basic ${Buffer.from(`${envPassword}:`).toString(
        'base64',
      )}`,
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
    card,
    payments = null,
    amount,
    external_id,
    operation_type = 'auth_and_capture',
  }) {
    const parsedAddress = addressParser(address);
    const body = {
      items,
      customer_id: provider_external_id,
      code: `${external_id}`,
      ip,
      amount: Math.round(amount * 100),
    };

    if (Array.isArray(payments) && payments.length > 0) {
      body.payments = payments.map(
        ({
          amount: paymentAmount,
          installments: paymentInstallments = 1,
          statement_descriptor: paymentDescriptor = 'B4you',
          card: paymentCard,
          splits: paymentSplits,
        }) => ({
          amount: Math.round(paymentAmount * 100),
          split: splitsParser(
            paymentSplits || splits,
            paymentAmount,
            this.#provider,
          ),
          payment_method: 'credit_card',
          credit_card: {
            operation_type,
            recurrence: false,
            installments: paymentInstallments,
            statement_descriptor: paymentDescriptor,
            card: {
              number: paymentCard?.number,
              holder_name: paymentCard?.name,
              exp_month: paymentCard?.month,
              exp_year: paymentCard?.year,
              cvv: paymentCard?.cvv,
              billing_address: parsedAddress,
            },
          },
        }),
      );

      // Log do body completo que será enviado para a API da Pagarme
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('=== Pagarme - Body completo para API ===');
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('Número de payments:', body.payments.length);
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('Amount total:', body.amount);
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('External ID:', body.code);
      body.payments.forEach((payment, index) => {
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log(`\n--- Payment ${index + 1} no body ---`);
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log('Amount:', payment.amount);
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log('Payment method:', payment.payment_method);
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log('Installments:', payment.credit_card?.installments);
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log('Card number (last 4):', payment.credit_card?.card?.number?.slice(-4));
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log('Splits:', JSON.stringify(payment.split, null, 2));
      });
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('\nFull body:', JSON.stringify(body, null, 2));
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('========================================');
    } else {
      const {
        number,
        cvv,
        month,
        year,
        name,
        installments = 1,
        soft_descriptor = 'B4you',
      } = card;

      body.payments = [
        {
          split: splitsParser(splits, amount, this.#provider),
          payment_method: 'credit_card',
          credit_card: {
            operation_type,
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
      ];
    }
    const { data } = await this.#service.post('/orders', body, {
      headers: this.headers,
    });
    // Log da resposta completa da API da Pagarme
    // eslint-disable-next-line no-console
    console.log('=== Pagarme - Resposta completa da API ===');
    // eslint-disable-next-line no-console
    console.log('Status:', data.status);
    // eslint-disable-next-line no-console
    console.log('Charges count:', data.charges?.length || 0);
    if (data.charges && Array.isArray(data.charges)) {
      data.charges.forEach((charge, index) => {
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log(`Charge ${index + 1}:`, {
          id: charge.id,
          status: charge.status,
          amount: charge.amount,
          last_transaction: charge.last_transaction,
        });
      });
    }
    // eslint-disable-next-line no-console
    console.log('Full response:', JSON.stringify(data, null, 2));
    // eslint-disable-next-line no-console
    console.log('==========================================');
    let provider_response = 'Negado';

    if (data?.status === 'paid') {
      const acquirerMessage =
        data?.charges?.[0]?.last_transaction?.acquirer_message;

      if (acquirerMessage) {
        provider_response = acquirerMessage;
      }
    }

    if (data.status === 'failed') {
      // eslint-disable-next-line
      // eslint-disable-next-line no-console
      console.log(
        'response pagarme failed->',
        JSON.stringify(data.charges[0].last_transaction),
      );

      const { acquirer_return_code, acquirer_message, antifraud_response } =
        data.charges[0].last_transaction;
      const acquirerResponse = messages.find(
        (c) => c.id === acquirer_return_code,
      );
      if (acquirerResponse) {
        provider_response = acquirerResponse.message;
      } else {
        provider_response = acquirer_message;
      }
      if (antifraud_response && antifraud_response.status === 'reproved')
        provider_response = 'Entre em contato com o suporte';
    }
    if (data.status === 'rejected') {
      // eslint-disable-next-line
      // eslint-disable-next-line no-console
      console.log(
        'response pagarme rejected->',
        JSON.stringify(data.charges[0].last_transaction),
      );

      const { acquirer_return_code, antifraud_response } =
        data.charges[0].last_transaction;
      const acquirerResponse = messages.find(
        (c) => c.id === acquirer_return_code,
      );
      if (acquirerResponse) {
        provider_response = acquirerResponse.message;
      }
      if (antifraud_response && antifraud_response.status === 'reproved')
        provider_response = 'Entre em contato com o suporte';

      if (
        provider_response &&
        provider_response ===
        'Transação recusada por código irreversível - não tente novamente'
      ) {
        provider_response =
          'Transação recusada. Utilize outro método de pagamento ou entre em contato com seu banco.';
      }
    }
    if (
      data.status === 'pending' &&
      data.charges[0].last_transaction.status === 'authorized_pending_capture'
    ) {
      provider_response = 'Pendente de autorizacao';
    }
    // eslint-disable-next-line
    // eslint-disable-next-line no-console
    console.log('provider_response', provider_response);

    if (provider_response === 'Função não suportada') {
      provider_response =
        'Modalidade do cartão não aceita. (Cartões de débito, alimentação ou refeição não são aceitos). Use um cartão de crédito e tente novamente.';
    }
    return {
      ...data,
      status: translatePaymentStatus(data.status),
      provider: this.#provider,
      provider_id: data.charges[0].id,
      provider_response,
    };
  }

  async updateOrder({ charge_id, approved }) {
    if (approved) {
      const { data } = await this.#service.post(
        `/charges/${charge_id}/capture`,
        {},
        { headers: this.headers },
      );
      return { ...data, status: translatePaymentStatus(data.status) };
    }

    const { data } = await this.#service.delete(`/charges/${charge_id}`, {
      headers: this.headers,
    });
    return { ...data, status: translatePaymentStatus(data.status) };
  }

  async createPix({
    items,
    customer: { provider_external_id, ip },
    splits,
    amount,
    external_id,
  }) {
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
    // eslint-disable-next-line
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(body, null, 2));
    const { data } = await this.#service.post('/orders', body, {
      headers: this.headers,
    });
    if (data.status === 'failed') {
      // eslint-disable-next-line
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log(data);
      throw new Error('error generating billet');
    }
    return {
      ...data,
      status: translatePaymentStatus(data.status),
      line_code: data.charges[0].last_transaction.line,
      url: data.charges[0].last_transaction.url,
      qrcode_url: data.charges[0].last_transaction.qr_code,
      barcode: data.charges[0].last_transaction.barcode,
      provider: this.#provider,
      provider_id: data.charges[0].id,
      due: data.charges[0].last_transaction.due_at,
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
    // eslint-disable-next-line
    // eslint-disable-next-line no-console
    console.log('body token -> ', body);
    // eslint-disable-next-line
    // eslint-disable-next-line no-console
    console.log('split -> ', body.payments[0].split);
    // eslint-disable-next-line
    // eslint-disable-next-line no-console
    console.log('credit card -> ', body.payments[0].credit_card);
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

  async createClient({
    first_name,
    last_name,
    email,
    document_number,
    whatsapp,
    address = {},
  }) {
    const body = {
      name: `${first_name} ${last_name}`,
      email,
      document: document_number,
      type: document_number.length > 11 ? 'company' : 'individual',
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

  async createCardToken({
    provider_external_id,
    card_number,
    cvv,
    month,
    year,
    card_holder,
  }) {
    const body = {
      number: card_number,
      holder_name: card_holder,
      exp_month: parseInt(month, 10),
      exp_year: parseInt(year, 10),
      cvv,
    };
    const { data } = await this.#service.post(
      `/customers/${provider_external_id}/cards`,
      body,
      { headers: this.headers },
    );
    return {
      token: data.id,
    };
  }

  async updateCreditCard({
    card_number,
    cvv,
    month,
    year,
    card_holder,
    charge_id,
  }) {
    const body = {
      card: {
        number: card_number,
        holder_name: card_holder,
        exp_month: parseInt(month, 10),
        exp_year: parseInt(year, 10),
        cvv,
      },
    };

    const { data } = await this.#service.patch(
      `/charges/${charge_id}/card`,
      body,
      {
        headers: this.headers,
      },
    );
    return data;
  }

  async retryCharge(charge_id) {
    const { data } = await this.#service.post(
      `/charges/${charge_id}/retry`,
      {},
      {
        headers: this.headers,
      },
    );
    // eslint-disable-next-line
    // eslint-disable-next-line no-console
    console.log('reprocessing sale', data);
    return data;
  }

  async cancelCharge(charge_id) {
    try {
      const { data } = await this.#service.delete(
        `/charges/${charge_id}`,
        {
          headers: this.headers,
        },
      );
      // eslint-disable-next-line no-console
      console.log('charge canceled', data);
      return { ...data, status: translatePaymentStatus(data.status) };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error canceling charge', error);
      throw error;
    }
  }
}

module.exports = PagarMe;
