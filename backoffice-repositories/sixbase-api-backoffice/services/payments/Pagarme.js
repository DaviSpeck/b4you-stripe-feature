const HTTPClient = require('../HTTPClient');

const invalidRecipientsCache = new Set();

setInterval(() => {
  const previousSize = invalidRecipientsCache.size;
  invalidRecipientsCache.clear();
  if (previousSize > 0) {
    console.log(`🧹 Cleared ${previousSize} invalid recipients from cache`);
  }
}, 60 * 60 * 1000);

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

  b4you_recipient_id;

  constructor(provider) {
    const password = resolvePassword(provider);
    const recipient = resolveRecipient(provider);
    this.headers = {
      Authorization: `Basic ${Buffer.from(`${password}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
    this.#service = new HTTPClient({
      baseURL: `${PAGARME_URL}`,
    });
    this.b4you_recipient_id = recipient;
  }

  async getOrder(order_id) {
    try {
      const { data } = await this.#service.get(`/orders/${order_id}`, {
        headers: this.headers,
      });
      return data;
    } catch (error) {
      // eslint-disable-next-line
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
      // eslint-disable-next-line
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
    sale_item_uuid = null,
  }) {
    const body = {
      amount: parseInt(amount * 100, 10),
      metadata: {
        amount_refund: parseInt(amount * 100, 10),
        sale_item_uuid,
      },
    };

    if (bank_account && Object.keys(bank_account).length > 0) {
      body.bank_account = bankAccountParser(
        bank_account,
        full_name,
        document_number,
      );
    }

    if (splits && splits.length > 0) {
      body.split = splits;
    }
    // eslint-disable-next-line
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

  async getRecipientBalance(recipient_id) {
    // if (invalidRecipientsCache.has(recipient_id)) {
    //   return null;
    // }

    try {
      const { data } = await this.#service.get(
        `/recipients/${recipient_id}/balance`,
        {
          headers: this.headers,
        },
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        invalidRecipientsCache.add(recipient_id);
        return null;
      }
      throw error;
    }
  }
}

PagarMe.getCacheStats = () => ({
  invalidRecipientsCount: invalidRecipientsCache.size,
  invalidRecipients: Array.from(invalidRecipientsCache),
});

PagarMe.clearCache = () => {
  const previousSize = invalidRecipientsCache.size;
  invalidRecipientsCache.clear();
  return { cleared: previousSize };
};

module.exports = PagarMe;
