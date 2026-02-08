const HTTPClient = require('../HTTPClient');
const dateHelper = require('../../utils/helpers/date');
const date = require('../../utils/helpers/date');

const {
  PAGARME_URL,
  PAGARME_PASSWORD,
  PAGARME_RECEIVER_ID,
  PAGARME_PASSWORD_2,
  PAGARME_RECEIVER_ID_2,
  PAGARME_PASSWORD_3,
  PAGARME_RECEIVER_ID_3,
} = process.env;

const bankAccountParser = (bankAccount, full_name, document_number) => {
  if (!bankAccount) return null;
  if (typeof bankAccount === 'object' && Object.keys(bankAccount).length === 0)
    return null;
  const { bank_code, account_agency, account_number, account_type } =
    bankAccount;
  return {
    holder_name: full_name,
    holder_type: 'individual',
    holder_document: document_number,
    bank: bank_code,
    branch_number: account_agency,
    account_number: account_number.slice(0, -1),
    account_check_digit: account_number.slice(-1),
    type: account_type,
  };
};

const resolvePassword = (provider) => {
  if (provider === 'B4YOU_PAGARME') {
    return PAGARME_PASSWORD;
  }

  if (provider === 'B4YOU_PAGARME_2') {
    return PAGARME_PASSWORD_2;
  }

  return PAGARME_PASSWORD_3;
};

const resolveRecipient = (provider) => {
  if (provider === 'B4YOU_PAGARME') {
    return PAGARME_RECEIVER_ID;
  }

  if (provider === 'B4YOU_PAGARME_2') {
    return PAGARME_RECEIVER_ID_2;
  }

  return PAGARME_RECEIVER_ID_3;
};

class PagarMe {
  #service;

  #service2;

  b4you_recipient_id;

  constructor(provider) {
    const password = resolvePassword(provider);

    this.headers = {
      Authorization: `Basic ${Buffer.from(`${password}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
    this.#service = new HTTPClient({
      baseURL: `${PAGARME_URL}`,
    });
    this.#service2 = new HTTPClient({
      baseURL: ``,
    });
    this.b4you_recipient_id = resolveRecipient(provider);
  }

  async getOrder(order_id) {
    try {
      const { data } = await this.#service.get(`/orders/${order_id}`, {
        headers: this.headers,
      });
      return data;
    } catch (error) {
      console.log(error.response);
      throw error;
    }
  }

  async getCharge(charge_id) {
    try {
      const { data } = await this.#service.get(`/charges/${charge_id}`, {
        headers: this.headers,
      });
      return data;
    } catch (error) {
      console.log(error.response);
      throw error;
    }
  }

  async createSellerCPF({
    email,
    document,
    phone,
    full_name,
    birthdate,
    revenue,
    occupation,
    bank_account: {
      holder_name,
      bank_code,
      agency,
      account,
      account_digit,
      type,
    },
    address,
  }) {
    const body = {
      register_information: {
        email,
        document,
        type: 'individual',
        name: full_name.substring(0, 30),
        birthdate: date(birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        monthly_income: revenue,
        professional_occupation: occupation,
        phone_numbers: [
          {
            ddd: phone.replace(/\s+/g, '').replace(/-/g, '').slice(0, 2),
            number: phone.replace(/\s+/g, '').replace(/-/g, '').slice(2),
            type: 'mobile',
          },
        ],
        address,
      },
      default_bank_account: {
        holder_name: holder_name.substring(0, 30),
        holder_type: 'individual',
        holder_document: document,
        bank: bank_code,
        branch_number: agency,
        account_number: account,
        account_check_digit: account_digit,
        type,
      },
      automatic_anticipation_settings: {
        enabled: true,
        volume_percentage: '60',
        type: 'full',
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
        ],
      },
    };
    const response = await this.#service.post('/recipients', body, {
      headers: this.headers,
    });
    return response.data;
  }

  async createSellerCNPJ({
    name,
    email,
    cpf,
    cnpj,
    address,
    company_name,
    trading_name,
    annual_revenue,
    phone,
    birthdate,
    monthly_income,
    company_type,
    founding_date,
    professional_occupation,
    bank_account: {
      holder_name,
      bank_code,
      agency,
      account,
      account_digit,
      type,
    },
  }) {
    const body = {
      register_information: {
        email,
        document: cnpj,
        type: 'corporation',
        corporation_type: company_type,
        main_address: address,
        company_name,
        trading_name,
        annual_revenue,
        founding_date,
        phone_numbers: [
          {
            ddd: phone.replace(/\s+/g, '').replace(/-/g, '').slice(0, 2),
            number: phone.replace(/\s+/g, '').replace(/-/g, '').slice(2),
            type: 'mobile',
          },
        ],
        managing_partners: [
          {
            name,
            email,
            document: cpf,
            birthdate: dateHelper(birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY'),
            monthly_income,
            self_declared_legal_representative: true,
            address,
            professional_occupation,
            phone_numbers: [
              {
                ddd: phone.replace(/\s+/g, '').replace(/-/g, '').slice(0, 2),
                number: phone.replace(/\s+/g, '').replace(/-/g, '').slice(2),
                type: 'mobile',
              },
            ],
          },
        ],
      },
      default_bank_account: {
        holder_name,
        holder_type: 'company',
        holder_document: cnpj,
        bank: bank_code,
        branch_number: agency,
        account_number: account,
        account_check_digit: account_digit,
        type,
      },
      automatic_anticipation_settings: {
        enabled: true,
        volume_percentage: '60',
        type: 'full',
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
        ],
      },
    };
    // console.log(JSON.stringify(body, null, 4));
    const response = await this.#service.post('/recipients', body, {
      headers: this.headers,
    });
    return response.data.id;
  }

  async refundCharge({
    provider_id,
    amount,
    split,
    full_name,
    document_number,
    bank_account = {},
  }) {
    const body = {
      amount: Math.round(amount * 100),
    };

    if (bank_account && Object.keys(bank_account).length > 0) {
      body.bank_account = bankAccountParser(
        bank_account,
        full_name,
        document_number,
      );
    }

    if (split && split.length > 0) {
      body.split = split;
    }

    console.log(body);

    const { data } = await this.#service.delete(`/charges/${provider_id}`, {
      headers: this.headers,
      data: body,
    });
    return data;
  }

  async getReceiver(recipient_id) {
    const { data } = await this.#service.get(`/recipients/${recipient_id}`, {
      headers: this.headers,
    });
    return data;
  }

  async createKYC(recipient_id) {
    const response = await this.#service.post(
      `/recipients/${recipient_id}/kyc_link`,
      {},
      {
        headers: this.headers,
      },
    );
    return response.data;
  }

  async mockKYC(recipient_id) {
    console.log(this.headers);
    const response = await this.#service2.post(
      `https://api.mundipagg.com/lifecycle/v1/kycs-mock/qr-code?customId=${recipient_id}`,
      {},
      // {
      //   headers: this.headers,
      // },
    );
    return response.data;
  }

  async updateSettings(recipient_id) {
    const body = {
      enabled: true,
      volume_percentage: '60',
      type: 'full',
      days: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      ],
    };
    const response = await this.#service.patch(
      `/recipients/${recipient_id}/automatic-anticipation-settings`,
      body,
      {
        headers: this.headers,
      },
    );
    console.log(response.data);
    return response.data;
  }

  async updateBankAddress({
    recipient_id,
    holder_name,
    document,
    bank_code,
    agency,
    account,
    account_digit,
    type,
    holder_type = 'individual',
  }) {
    const body = {
      bank_account: {
        holder_name: holder_name.substring(0, 30),
        holder_type,
        holder_document: document,
        bank: bank_code,
        branch_number: agency,
        account_number: account,
        account_check_digit: account_digit,
        type,
      },
    };
    console.log('dados bancarios', body);
    const response = await this.#service.patch(
      `/recipients/${recipient_id}/default-bank-account`,
      body,
      {
        headers: this.headers,
      },
    );
    console.log(response.data);
    return response.data;
  }
}

module.exports = PagarMe;
