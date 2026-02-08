const HTTPClient = require('./HTTPClient');

const {
  API_PAY42_URL,
  API_PAY42_KEY,
  URL_WITHDRAWAL_CALLBACK,
  URL_REFUND_CALLBACK,
} = process.env;
const currency = 'BRL';

class PaymentService {
  #service;

  #apikey;

  constructor(service, apiKey) {
    this.#service = service;
    this.#apikey = apiKey;
  }

  static translatePaymentStatus(status) {
    if (status === 0)
      return {
        label: 'created',
        charge: 1,
        transaction: 1,
        sale: 1,
        subscription: 2,
      };
    if (status === 1)
      return {
        label: 'paid',
        charge: 2,
        transaction: 2,
        sale: 2,
        subscription: 1,
      };
    if (status === 2)
      return {
        label: 'rejected',
        charge: 4,
        transaction: 4,
        sale: 3,
        subscription: 3,
      };
    if (status === 3)
      return {
        label: 'expired',
        charge: 3,
        transaction: 7,
        sale: 7,
        subscription: 3,
      };
    return {
      label: 'refunded',
      charge: 5,
      transaction: 8,
      sale: 4,
      subscription: 5,
    };
  }

  async generatePayout({
    bank,
    amount,
    document_type,
    document_number,
    name,
    transaction_id,
  }) {
    const body = {
      amount,
      bank,
      document_type,
      document_number,
      currency,
      name,
      transaction_id,
      webhook: URL_WITHDRAWAL_CALLBACK,
    };
    const { data } = await this.#service.post(`/payout`, body, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }

  async getTransactionByID(transaction_id) {
    const { data } = await this.#service.get(
      `/transactions/?transaction_id=${transaction_id}`,
      {
        headers: {
          Authorization: this.#apikey,
        },
      },
    );
    return data;
  }

  async getTransactionByPSP(psp_id) {
    const { data } = await this.#service.get(`/transactions?id=${psp_id}`, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }

  async getWithdrawalByID(transaction_id) {
    const { data } = await this.#service.get(
      `/withdrawals/?transaction_id=${transaction_id}`,
      {
        headers: {
          Authorization: this.#apikey,
        },
      },
    );
    return data;
  }

  async refundPix({ psp_id, refund_id, amount = null }) {
    const body = {
      id: psp_id,
      refund_id,
      webhook: URL_REFUND_CALLBACK,
    };
    if (amount) {
      body.amount = amount;
    }
    const { data } = await this.#service.post('/refunds/pix', body, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }

  async refundBillet({
    psp_id,
    refund_id,
    amount,
    bank: { bank_name, ispb, account_agency, account_number },
  }) {
    const body = {
      refund_id,
      id: psp_id,
      bank: {
        type: 'PIX',
        bank_name,
        ispb,
        account_agency,
        account_number,
      },
      webhook: URL_REFUND_CALLBACK,
    };
    if (amount) {
      body.amount = amount;
    }
    const { data } = await this.#service.post('/refunds/boleto', body, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }

  async refundCard({
    psp_id,
    refund_id,
    webhook = URL_REFUND_CALLBACK,
    amount,
  }) {
    const body = {
      id: psp_id,
      refund_id,
      webhook,
      amount,
    };
    const { data } = await this.#service.post('/refunds/card', body, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }
}

module.exports = new PaymentService(
  new HTTPClient({
    baseURL: API_PAY42_URL,
  }),
  API_PAY42_KEY,
);
