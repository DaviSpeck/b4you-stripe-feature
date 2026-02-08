const HTTPClient = require('../HTTPClient');

const { API_MAILCHIMP } = process.env;

class MailChimp {
  #service;

  constructor(token, subdomain) {
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    this.#service = new HTTPClient({
      baseURL: `https://${subdomain}.${API_MAILCHIMP}`,
    });
  }

  async verifyCredentials() {
    const response = await this.#service.get('/', {
      headers: this.headers,
    });
    return response;
  }

  async getAllLists() {
    const response = await this.#service.get('/lists', {
      headers: this.headers,
    });
    return response;
  }

  async getListById(idList) {
    const { data } = await this.#service.get(`/lists/${idList}`, {
      headers: this.headers,
    });
    return data;
  }

  async insertContactOnList(listId, email, firstName, lastName, phone) {
    const body = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
        PHONE: phone,
      },
    };
    const response = await this.#service.put(
      `/lists/${listId}/members/${email}`,
      body,
      {
        headers: this.headers,
      },
    );
    return response;
  }

  async removeContactOnList(listId, email) {
    const response = await this.#service.delete(
      `/lists/${listId}/members/${email}`,
      {
        headers: this.headers,
      },
    );
    return response;
  }
}

module.exports = MailChimp;
