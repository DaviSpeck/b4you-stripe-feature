const axios = require('axios');

class HttpClient {
  #client;

  constructor(config) {
    this.#client = axios.create(config);
  }

  async get(url, config) {
    return this.#client.get(url, config);
  }

  async post(url, data, config) {
    return this.#client.post(url, data, config);
  }

  async delete(url, config) {
    return this.#client.delete(url, config);
  }

  async put(url, data, config) {
    return this.#client.put(url, data, config);
  }
}

module.exports = HttpClient;
