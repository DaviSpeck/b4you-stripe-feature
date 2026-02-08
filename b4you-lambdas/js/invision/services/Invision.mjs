import { HttpClient } from './HTTPClient.mjs';

export class Invision {
  #apiKey;

  #apiUrl;

  constructor(apiUrl, apiKey) {
    this.#apiKey = apiKey;
    this.#apiUrl = apiUrl;

    this.service = new HttpClient({
      baseURL: this.#apiUrl,
      auth: {
        username: this.#apiKey,
        password: '',
      },
    });
  }

  async getGroups() {
    try {
      const response = await this.service.get(`/core/groups`, {
        auth: {
          username: this.#apiKey,
          password: '',
        },
      });

      return response.data.results;
    } catch (error) {
      return error;
    }
  }

  /**
   * @typedef {Object} MemberData
   * @property {String} name client name
   * @property {String} email client email
   * @property {Int16Array} group_id group id
   */
  /**
   * @param {MemberData} MemberData Member Data
   */
  async createMember({ name, email, primary_group_id, secondary_group_id }) {
    try {
      const user = await this.service.get(`/core/members/?email=${email}`, {
        auth: {
          username: this.#apiKey,
          password: '',
        },
      });

      const filtered = user.data.results.find((elem) => elem.email === email) || null;

      if (filtered) {
        const response = await this.service.post(
          `/core/members/${filtered.id}`,
          {},
          {
            params: {
              name,
              email,
              group: primary_group_id,
              secondaryGroups: [secondary_group_id],
            },
          }
        );
        return response.data;
      } else {
        const response = await this.service.post(
          `/core/members`,
          {},
          {
            params: {
              name,
              email,
              group: primary_group_id,
              secondaryGroups: [secondary_group_id],
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      return error;
    }
  }
}
