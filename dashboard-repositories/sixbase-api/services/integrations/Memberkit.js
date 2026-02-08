const HTTPClient = require('../HTTPClient');

const { MEMBERKIT_URL = 'https://memberkit.com.br/api/v1/' } = process.env;

class Memberkit {
  #service;

  constructor(token) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.params = {
      api_key: token,
    };
    this.#service = new HTTPClient({ baseURL: MEMBERKIT_URL });
  }

  async getClassrooms() {
    const response = await this.#service.get('classrooms', {
      headers: this.headers,
      params: this.params,
    });
    return response.data;
  }

  async postUser({ full_name, email, classroom_id }) {
    const body = {
      full_name,
      email,
      classroom_ids: [`${classroom_id}`],
      status: 'active',
    };
    const response = await this.#service.post('users', body, {
      headers: this.headers,
      params: this.params,
    });
    return response;
  }

  async getClassroomsById(id) {
    const response = await this.#service.get(`classrooms/${id}`, {
      headers: this.headers,
      params: this.params,
    });
    return response.data;
  }
}

module.exports = Memberkit;
