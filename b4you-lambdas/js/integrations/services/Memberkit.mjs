import { HttpClient } from './HTTPClient.mjs';
import moment from 'moment';
const { MEMBERKIT_URL = 'https://memberkit.com.br/api/v1/' } = process.env;

export class Memberkit {
  #service;

  constructor(token) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.params = {
      api_key: token,
    };
    this.#service = new HttpClient({ baseURL: MEMBERKIT_URL });
  }

  async getClassrooms() {
    const response = await this.#service.get('classrooms', {
      headers: this.headers,
      params: this.params,
    });
    return response.data;
  }

  async postUser({ full_name, email, classroom_id, subscription = null }) {
    console.log('classrom_id que vem->', classroom_id);
    const list = classroom_id.map((item) => item.value.toString());
    const body = {
      full_name,
      email,
      classroom_ids: list,
      status: 'active',
    };
    if (subscription) {
      body.expires_at = moment(subscription.next_charge).toISOString();
    }
    console.log('BODY MEMBERKIT->', body);
    const response = await this.#service.post('users', body, {
      headers: this.headers,
      params: this.params,
    });
    console.log('RESPONSE MEMBERKIT->', JSON.stringify(response));
    return response;
  }

  async getClassroomsById(id) {
    const response = await this.#service.get(`classrooms/${id}`, {
      headers: this.headers,
      params: this.params,
    });
    return response.data;
  }

  async deleteUSer({ email }) {
    const response = await this.#service.delete(`users/${email}`, {
      headers: this.headers,
      params: this.params,
    });
    return response;
  }
}
