import { HttpClient } from './HTTPClient.mjs';

const { API_ENOTAS } = process.env;

export class Enotas {
  #service;

  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${this.apiKey}`,
    };
    this.#service = new HttpClient({ baseURL: API_ENOTAS });
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
    const cityPortoBeloScIbgeCode = 4213500;
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
}
