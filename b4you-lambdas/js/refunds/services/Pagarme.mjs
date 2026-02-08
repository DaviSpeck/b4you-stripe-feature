import { HttpClient as HTTPClient } from './HTTPClient.mjs';

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
  if (typeof bankAccount === 'object' && Object.keys(bankAccount).length === 0) return null;
  const { bank_code, account_agency, account_number, account_type } = bankAccount;
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

export class PagarMe {
  #service;

  b4you_recipient_id;

  constructor(provider) {
    const password = resolvePassword(provider);

    this.headers = {
      'Authorization': `Basic ${Buffer.from(`${password}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
    this.#service = new HTTPClient({
      baseURL: `${PAGARME_URL}`,
    });
    this.b4you_recipient_id = resolveRecipient(provider);
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

  async refundCharge({
    provider_id,
    amount,
    splits,
    full_name,
    document_number,
    bank_account = {},
  }) {
    const body = {
      amount: Math.round(amount * 100),
    };

    if (bank_account && Object.keys(bank_account).length > 0) {
      body.bank_account = bankAccountParser(bank_account, full_name, document_number);
    }

    if (splits.length > 0) {
      body.split = splits;
    }

    const { data } = await this.#service.delete(`/charges/${provider_id}`, {
      headers: this.headers,
      data: body,
    });
    return data;
  }
}
