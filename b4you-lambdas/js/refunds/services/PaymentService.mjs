const currency = 'BRL';

export class PaymentService {
  #service;

  #apikey;

  #urlCallback;

  constructor({ service, apiKey, urlCallback }) {
    this.#service = service;
    this.#apikey = apiKey;
    this.#urlCallback = urlCallback;
  }

  async refundCard({ refund_id, psp_id, amount }) {
    const body = {
      id: psp_id,
      refund_id,
      webhook: this.#urlCallback,
      amount,
    };
    const { data } = await this.#service.post('/refunds/card', body, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }

  async refundPix({ psp_id, refund_id, amount = null }) {
    const body = {
      refund_id,
      id: psp_id,
      webhook: this.#urlCallback,
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

  async getTransactionByPspId(pspid) {
    const { data } = await this.#service.get(`/transactions?id=${pspid}`, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }
}
