const axios = require('axios');

module.exports = class Frenet {
  #token;

  constructor(token) {
    this.#token = token;
  }

  async getShippingQuote(shippingObj) {
    const { data } = await axios.post(
      'https://api.frenet.com.br/shipping/quote',
      shippingObj,
      {
        headers: {
          token: this.#token,
        },
      },
    );
    return data;
  }
};
