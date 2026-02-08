const HTTPClient = require('./HTTPClient');

const {
  CIRCLES_KEY = '2DwVLGxYpU5dBvfzWUv5MHZf',
  CIRCLES_URL = 'https://app.circle.so/api/v1/',
  CIRCLES_COMMUNITY_ID = 95177,
} = process.env;
class CirclesCommunity {
  #service;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: CIRCLES_KEY,
    };
    this.#service = new HTTPClient({ baseURL: `${CIRCLES_URL}` });
  }

  async searchMember({ email }) {
    const response = await this.#service.get(
      `community_members/search?community_id=${CIRCLES_COMMUNITY_ID}&email=${email}`,
      {
        headers: this.headers,
      },
    );
    return response.data;
  }

  async inviteMember({ email, name }) {
    const body = {
      email,
      name,
      community_id: CIRCLES_COMMUNITY_ID,
    };
    const response = await this.#service.post(`community_members`, body, {
      headers: this.headers,
    });
    return response.data;
  }

  async removeMember({ email }) {
    const response = await this.#service.delete(
      `community_members?community_id=${CIRCLES_COMMUNITY_ID}&email=${email}`,
      {
        headers: this.headers,
      },
    );
    return response.data;
  }
}

module.exports = CirclesCommunity;
