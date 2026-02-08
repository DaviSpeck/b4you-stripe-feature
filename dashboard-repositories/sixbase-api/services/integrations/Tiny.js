const { default: axios } = require('axios');

module.exports = class Tiny {
  #token;

  constructor(token) {
    this.#token = token;
  }

  async getInfo() {
    const { data } = await axios.post(
      'https://api.tiny.com.br/api2/info.php',
      new URLSearchParams({
        token: this.#token,
        formato: 'json',
      }).toString(), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return data;
  }
};