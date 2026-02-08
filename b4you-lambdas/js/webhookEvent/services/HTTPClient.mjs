import axios from 'axios';

export class HttpClient {
  #client;

  constructor(config) {
    this.headers = { 'Accept-Encoding': 'gzip,deflate,compress' };
    this.#client = axios.create({
      timeout: 5000,
      ...config,
    });
  }

  async get(url, config) {
    return this.#client.get(url, {
      ...config,
      headers: { ...this.headers, ...config?.headers },
    });
  }

  async post(url, data, config) {
    return this.#client.post(url, data, {
      ...config,
      headers: { ...this.headers, ...config?.headers },
    });
  }

  async delete(url, config) {
    return this.#client.delete(url, {
      ...config,
      headers: { ...this.headers, ...config?.headers },
    });
  }

  async put(url, data, config) {
    return this.#client.put(url, data, {
      ...config,
      headers: { ...this.headers, ...config?.headers },
    });
  }
}
