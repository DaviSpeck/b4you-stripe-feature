import { PaymentProvider } from './PaymentProvider.mjs';

export class Pagarme extends PaymentProvider {
  #service;

  #config;
  constructor(service, password) {
    super();
    this.#service = service;
    const authorization = btoa(`${password}:`);
    this.#config = {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${authorization}`,
      },
    };
  }
  async getBalance(recipient_id) {
    const { data } = await this.#service.get(`/recipients/${recipient_id}/balance`, this.#config);
    console.log('recipient ', recipient_id, ' response -> ', data);
    if (data.waiting_funds_amount < 0) {
      return data.available_amount + data.waiting_funds_amount;
    }
    return data.available_amount;
  }

  async requestWithdrawal(recipient_id, amount) {
    const { data } = await this.#service.post(
      `/recipients/${recipient_id}/withdrawals`,
      {
        amount,
      },
      this.#config
    );
    return data;
  }

  async generatePayout() {
    throw new Error('Pagarme does not support payout generation directly');
  }
}
