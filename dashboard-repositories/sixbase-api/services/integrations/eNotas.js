const HTTPClient = require('../HTTPClient');

const { API_ENOTAS } = process.env;
const cityPortoBeloScIbgeCode = 4213500;
class Enotas {
  #service;

  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${this.apiKey}`,
    };
    this.#service = new HTTPClient({ baseURL: API_ENOTAS });
  }

  async verifyCredentials() {
    const response = await this.#service.get('vendas/getFilterBy', {
      headers: this.headers,
    });
    return response;
  }

  /**
   * @param {string} field must be 'cpfCnpj' or 'email'
   * @param {string} data a valid mail or document number
   */
  async getClient(field, data) {
    const parameters = `?pageNumber=0&pageSize=10&filter=contains(${field}, '${data}')`;
    const { data: response } = await this.#service.get(
      `clientes/getFilterBy${parameters}`,
      {
        headers: this.headers,
      },
    );
    return { response };
  }

  async createClient({
    clienteId,
    email,
    phone_number,
    full_name,
    document_number,
    address: { city, number, neighbourhood, zipcode, complement, street },
  }) {
    const body = {
      clienteId,
      nomeFantasia: null,
      inscricaoMunicipal: null,
      inscricaoEstadual: null,
      email,
      telefone: phone_number,
      nome: full_name,
      cpfCnpj: document_number,
      endereco: {
        cidade: city,
        numero: number,
        bairro: neighbourhood,
        cep: zipcode,
        complemento: complement,
        logradouro: street,
      },
    };
    const { data } = await this.#service.post('clientes', body, {
      headers: this.headers,
    });
    return { data };
  }

  async createProduct({ name, external_id, price, warranty_days }) {
    const body = {
      nome: name,
      idExterno: external_id,
      valorTotal: price,
      diasGarantia: warranty_days,
    };
    const { data } = await this.#service.post('produtos', body, {
      headers: this.headers,
    });
    return { data };
  }

  /**
   * @param {object} client
   * @param {object} product
   * @param {string} date
   * @param {date} dueDate
   * @param {number} total_price
   * @param {string} id_sale
   * @param {string} description
   * @param {number} issue_invoice 0-to emit | 1-emit after warranty days | 3-not emit
   * @param {boolean} tax_over_service issRetidoFonte true or false
   * @param {boolean} send_invoice_customer_mail
   * @param {number} payment_method 1-billet | 2-credit card | 3-deposit | 4-bank transfer | 5-bCash | 6-Paypal | 7-another
   */
  async createInvoice({
    client: { email, phone_number, full_name, document_number },
    product: { name, external_id, price, warranty_days },
    date,
    dueDate,
    total_price,
    id_sale,
    description,
    issue_invoice,
    tax_over_service,
    send_invoice_customer_mail,
    payment_method,
  }) {
    const body = {
      cliente: {
        email,
        telefone: phone_number,
        nome: full_name,
        cpfCnpj: document_number,
      },
      produto: {
        nome: name,
        idExterno: external_id,
        valorTotal: price,
        diasGarantia: warranty_days,
      },
      municipioPrestacao: {
        codigoIbge: cityPortoBeloScIbgeCode,
      },
      idExterno: id_sale,
      data: date,
      vencimento: dueDate,
      dataCompetencia: date,
      discriminacao: description,
      valorTotal: total_price,
      issRetidoFonte: tax_over_service,
      quandoEmitirNFe: issue_invoice,
      enviarNFeCliente: send_invoice_customer_mail,
      meioPagamento: payment_method,
    };
    const { data } = await this.#service.post('vendas', body, {
      headers: this.headers,
    });
    return data;
  }

  /**
   * @param {number} page
   * @param {number} size
   * @param {string} filter contains(cliente/id, '0ca1f866-c89a-42c0-a251-dfcb9e910700') and data ge '2021-10-05'
   */
  async getSales(page = 0, size = 10, filter = '') {
    const parameters = filter ? `&filter=${filter}` : '';
    const { data } = await this.#service.get(
      `vendas/getFilterBy?pageNumber=${page}&pageSize=${size}${parameters}`,
      {
        headers: this.headers,
      },
    );
    return { data };
  }

  /**
   * @param {number} page
   * @param {number} size
   * @param {string} filter contains(cpfCnpj, '08654944951')
   */
  async getClients(page = 0, size = 10, filter = '') {
    const parameters = filter ? `&filter=${filter}` : '';
    const { data } = await this.#service.get(
      `clientes/getFilterBy?pageNumber=${page}&pageSize=${size}${parameters}`,
      {
        headers: this.headers,
      },
    );
    return { data };
  }

  /**
   * @param {number} id
   * @param {number} issue_invoice 0-to emit | 1-emit after warranty days | 3-not emit
   */
  async updateInvoice({ id, issue_invoice }) {
    const body = { id, quandoEmitirNFe: issue_invoice };
    const { data } = await this.#service.post('vendas', body, {
      headers: this.headers,
    });
    return { data };
  }
}

module.exports = Enotas;
