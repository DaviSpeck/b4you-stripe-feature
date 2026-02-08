import axios from 'axios';

export class Pagarme {
  #config;

  constructor(password) {
    const authorization = btoa(`${password}:`);
    this.#config = {
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Basic ${authorization}`,
      },
    };
  }

  async getBalance(recipient_id) {
    const { data } = await axios.get(
      `https://api.pagar.me/core/v5/recipients/${recipient_id}/balance`,
      this.#config
    );
    return data;
  }
}
