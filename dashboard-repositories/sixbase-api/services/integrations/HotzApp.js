const { capitalizeName } = require('../../utils/formatters');
const HTTPClient = require('../HTTPClient');

// Link documentação -> https://hotzapp.me/suporte/integracoes/webhooks-de-pedidos
class HotzApp {
  #service;

  constructor(baseURL) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#service = new HTTPClient({ baseURL });
  }

  async verifyCredentials() {
    const response = await this.#service.post('/', {
      headers: this.headers,
    });
    return response;
  }

  /**
   * @param {string} created_at '2018-04-06T07:18:26+03:00'
   * @param {string} transaction_id '1234'
   * @param {string} document_number raw cpf or cnpj (08654944951)
   * @param {string} name customer name
   * @param {string} phone customer phone
   * @param {string} email customer email
   * @param {number} amount billet amount
   * @param {string} billet_url billet url
   * @param {string} billet_barcode billet bard code
   * @param {array} products array of object like this -> [{product_name: 'curso x', quantity: '1', price: 245.50}]
   * @returns {Response} Return string object like this ok_61f159569c47cd6f572c5269s
   */
  async printedBillet({
    created_at,
    transaction_id,
    name,
    phone,
    email,
    document_number,
    amount,
    billet_url,
    billet_barcode,
    products,
  }) {
    const body = {
      created_at,
      transaction_id,
      name,
      phone,
      email,
      doc: document_number,
      total_price: amount,
      billet_url,
      billet_barcode,
      payment_method: 'billet',
      financial_status: 'issued',
      currency_code_from: 'R$',
      line_items: products,
    };
    const { data } = await this.#service.post('', body, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {string} created_at '2018-04-06T07:18:26+03:00'
   * @param {string} paid_at '2018-04-06T07:18:26+03:00'
   * @param {string} transaction_id '1234'
   * @param {string} document_number raw cpf or cnpj (08654944951)
   * @param {string} name customer name
   * @param {string} phone customer phone
   * @param {string} email customer email
   * @param {number} amount billet amount
   * @param {string} billet_url billet url
   * @param {string} billet_barcode billet bard code
   * @param {array} products array of object like this -> [{product_name: 'curso x', quantity: '1', price: 245.50}]
   * @returns {Response} Return string object like this ok_61f159569c47cd6f572c5269s
   */
  async paidBillet({
    created_at,
    transaction_id,
    name,
    phone,
    email,
    document_number,
    amount,
    billet_url,
    billet_barcode,
    products,
    paid_at,
  }) {
    const body = {
      created_at,
      transaction_id,
      name,
      phone,
      email,
      doc: document_number,
      total_price: amount,
      billet_url,
      billet_barcode,
      payment_method: 'billet',
      financial_status: 'paid',
      currency_code_from: 'R$',
      line_items: products,
      paid_at,
    };
    const { data } = await this.#service.post('', body, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {string} created_at '2018-04-06T07:18:26+03:00'
   * @param {string} transaction_id '1234'
   * @param {string} document_number raw cpf or cnpj (08654944951)
   * @param {string} name customer name
   * @param {string} email customer email
   * @param {string} phone customer phone
   * @param {number} amount billet amount
   * @param {string} error_message error message o refused card transaction
   * @param {array} products array of object like this -> [{product_name: 'curso x', quantity: '1', price: 245.50}]
   * @returns {Response} Return string object like this ok_61f159569c47cd6f572c5269s
   */
  async refusedCard({
    created_at,
    transaction_id,
    name,
    phone,
    email,
    document_number,
    amount,
    products,
    error_message,
  }) {
    const body = {
      created_at,
      transaction_id,
      name,
      phone,
      email,
      doc: document_number,
      total_price: amount,
      payment_method: 'credit',
      financial_status: 'refused',
      currency_code_from: 'R$',
      line_items: products,
      transaction_error_msg: error_message,
    };
    const { data } = await this.#service.post('', body, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {string} created_at '2018-04-06T07:18:26+03:00'
   * @param {string} paid_at '2018-04-06T07:18:26+03:00'
   * @param {string} transaction_id '1234'
   * @param {string} document_number raw cpf or cnpj (08654944951)
   * @param {string} name customer name
   * @param {string} phone customer phone
   * @param {string} email customer email
   * @param {number} amount billet amount
   * @param {array} products array of object like this -> [{product_name: 'curso x', quantity: '1', price: 245.50}]
   * @returns {Response} Return string object like this ok_61f159569c47cd6f572c5269s
   */
  async paidCard({
    created_at,
    paid_at,
    transaction_id,
    name,
    phone,
    email,
    document_number,
    amount,
    products,
  }) {
    const body = {
      created_at,
      transaction_id,
      name,
      phone,
      email,
      doc: document_number,
      total_price: amount,
      payment_method: 'credit',
      financial_status: 'paid',
      currency_code_from: 'R$',
      line_items: products,
      paid_at,
    };
    const { data } = await this.#service.post('', body, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {string} created_at '2018-04-06T07:18:26+03:00'
   * @param {string} document_number raw cpf or cnpj (08654944951)
   * @param {string} name customer name
   * @param {string} phone customer phone
   * @param {string} email customer email
   * @param {number} amount billet amount
   * @param {array} products array of object like this -> [{product_name: 'curso x', quantity: '1', price: 245.50}]
   * @returns {Response} Return string object like this ok_61f159569c47cd6f572c5269s
   */
  async abandonedCart({
    created_at,
    name,
    phone,
    email,
    document_number,
    amount,
    products,
  }) {
    const body = {
      created_at,
      name: capitalizeName(name),
      phone,
      email,
      doc: document_number,
      total_price: amount,
      currency_code_from: 'R$',
      line_items: products,
    };
    const { data } = await this.#service.post('', body, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {string} created_at '2018-04-06T07:18:26+03:00'
   * @param {string} paid_at '2018-04-06T07:18:26+03:00'
   * @param {string} transaction_id '1234'
   * @param {string} pix_code '1234'
   * @param {string} pix_url '1234'
   * @param {string} document_number raw cpf or cnpj (08654944951)
   * @param {string} name customer name
   * @param {string} phone customer phone
   * @param {string} email customer email
   * @param {number} amount billet amount
   * @param {array} products array of object like this -> [{product_name: 'curso x', quantity: '1', price: 245.50}]
   * @returns {Response} Return string object like this ok_61f159569c47cd6f572c5269s
   */
  async paidPix({
    created_at,
    paid_at,
    transaction_id,
    name,
    phone,
    email,
    document_number,
    amount,
    products,
    pix_code,
    pix_url,
  }) {
    const body = {
      created_at,
      transaction_id,
      name,
      phone,
      email,
      doc: document_number,
      total_price: amount,
      payment_method: 'pix',
      financial_status: 'paid',
      currency_code_from: 'R$',
      line_items: products,
      paid_at,
      pix_code,
      pix_url,
    };
    const { data } = await this.#service.post('', body, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {string} created_at '2018-04-06T07:18:26+03:00'
   * @param {string} transaction_id '1234'
   * @param {string} pix_code '1234'
   * @param {string} pix_url '1234'
   * @param {string} document_number raw cpf or cnpj (08654944951)
   * @param {string} name customer name
   * @param {string} phone customer phone
   * @param {string} email customer email
   * @param {number} amount billet amount
   * @param {array} products array of object like this -> [{product_name: 'curso x', quantity: '1', price: 245.50}]
   * @returns {Response} Return string object like this ok_61f159569c47cd6f572c5269s
   */
  async generatedPix({
    created_at,
    transaction_id,
    name,
    phone,
    email,
    document_number,
    amount,
    products,
    pix_code,
    pix_url,
  }) {
    const body = {
      created_at,
      transaction_id,
      name,
      phone,
      email,
      doc: document_number,
      total_price: amount,
      payment_method: 'pix',
      financial_status: 'issued',
      currency_code_from: 'R$',
      line_items: products,
      pix_code,
      pix_url,
    };
    const { data } = await this.#service.post('', body, {
      headers: this.headers,
    });
    return data;
  }
}

module.exports = HotzApp;
