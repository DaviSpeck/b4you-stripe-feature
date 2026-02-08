export class PaymentService {
  #service;

  #apikey;

  constructor(service, apiKey) {
    this.#service = service;
    this.#apikey = apiKey;
  }

  async getTransactionByID(transaction_id) {
    const { data } = await this.#service.get(`/transactions?id=${transaction_id}`, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }
}
