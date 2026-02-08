const HTTPClient = require('../HTTPClient');

class Invision {
  #apiKey;

  #apiUrl;

  constructor(apiUrl, apiKey) {
    this.#apiKey = apiKey;
    this.#apiUrl = apiUrl;

    this.service = new HTTPClient({
      baseURL: this.#apiUrl,
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
  async createMember({ name, email, group_id }) {
    try {
      const response = await this.service.post(`/core/members`, {
        params: {
          name,
          email,
          group: group_id,
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async updateMemberGroup({ id, group_id }) {
    try {
      const response = await this.service.post(`/core/members/${id}`, {
        params: {
          group: group_id,
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async deleteMemberGroup({ email }) {
    try {
      const response = await this.service.get(`/core/members/?email=${email}`, {
        auth: {
          username: this.#apiKey,
          password: '',
        },
      });
      const filtered = response.data.results.find(
        (elem) => elem.email === email,
      );

      const responseDelete = await this.service.post(
        `/core/members/${filtered.id}?secondaryGroups=`,
        {
          params: {
            secondaryGroups: [],
          },
        },
        {
          auth: {
            username: this.#apiKey,
            password: '',
          },
        },
      );
      return responseDelete.data;
    } catch (error) {
      return error;
    }
  }
}

module.exports = Invision;
