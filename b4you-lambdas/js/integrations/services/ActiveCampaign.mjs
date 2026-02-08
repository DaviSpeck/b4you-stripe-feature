import { HttpClient } from './HTTPClient.mjs';

export class ActiveCampaign {
  #service;

  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'Api-token': this.apiKey,
    };
    this.#service = new HttpClient({ baseURL: `${apiUrl}/api/3` });
  }

  /**
   * @param {string} service The name of the service
   * @param {string} externalid The id of the account in the external service
   * @param {string} name The name associated with the account in the external service. Often this will be a company name (e.g., 'My Toystore, Inc.')
   * @param {string} logoUrl The URL to a logo image for the external service
   * @param {string} linkUrlThe URL to a page where the integration with the external service can be managed in the third-party's website
   * @returns {Response} Return created connection
   */
  async createConnection({ service, externalid, name, logoUrl, linkUrl }) {
    const body = {
      connection: {
        service,
        externalid,
        name,
        logoUrl,
        linkUrl,
      },
    };
    const response = await this.#service.post('/connections', body, {
      headers: this.headers,
    });
    return response;
  }

  /**
   * @returns {Connections} Return all connections
   */
  async listConnections() {
    const response = await this.#service.get('/connections', {
      headers: this.headers,
    });
    return response;
  }

  /**
   * @param {Number} id The connection ID
   * @returns {Object} Empty object on success
   */
  async deleteConnection(id) {
    const response = await this.#service.delete(`/connections/${id}`, {
      headers: this.headers,
    });
    return response;
  }

  /**
   * @returns {Lists} Return all user lists
   */
  async getAllLists() {
    const response = await this.#service.get('/lists', {
      headers: this.headers,
    });
    return response;
  }

  /**
   * @returns {Lists} Return list by id
   */
  async getListById(id) {
    const { data } = await this.#service.get(`/lists/${id}`, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {string} email Contact name
   * @param {string} firstName Constact first name
   * @param {string} lastName Contact last name
   * @param {string} phone Contact phone
   * @returns {Response} Return created contact
   */
  async createOrUpdateContact({ email, firstName, lastName, phone }) {
    const body = {
      contact: {
        email,
        firstName,
        lastName,
        phone,
      },
    };
    const { data } = await this.#service.post('/contact/sync', body, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {Number} idList id of list
   * @param {Number} idContact id of contact
   * @param {Number} status Contact last name
   * @returns {Response} Return created contact
   */
  async insertContactOnList({ idList, idContact, status = 1 }) {
    const body = {
      contactList: {
        list: idList,
        contact: idContact,
        status,
      },
    };
    const response = await this.#service.post('/contactLists', body, {
      headers: this.headers,
    });
    return response;
  }

  async updateTagToContact({ idTag, idContact }) {
    const body = {
      contactTag: {
        tag: idTag,
        contact: idContact,
      },
    };
    const response = await this.#service.post('/contactTags', body, {
      headers: this.headers,
    });
    console.log('response add update tag contact', response.data);
    return response;
  }

  async verifyCredentials() {
    const response = await this.#service.get('/', {
      headers: this.headers,
    });
    return response;
  }

  async removeContactOnList(email, idList) {
    const response = await this.#service.get('/contacts', {
      headers: this.headers,
    });
    const list = response.data.contacts;
    const contact = list.find((element) => element.email === email);
    if (contact.id) {
      const body = {
        contactList: {
          list: idList,
          contact: contact.id,
          status: 2,
        },
      };
      await this.#service.post(`/contactLists`, body, {
        headers: this.headers,
      });
      return true;
    }
    return false;
  }
}
