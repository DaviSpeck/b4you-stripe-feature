export class PaymentService {
  #service;

  #apikey;

  constructor({ service, apiKey }) {
    this.#service = service;
    this.#apikey = apiKey;
  }

  async getWithdrawalByID(transaction_id) {
    const { data } = await this.#service.get(
      `/withdrawals/?transaction_id=${transaction_id}`,
      {
        headers: {
          Authorization: this.#apikey,
        },
      }
    );
    return data;
  }
}
