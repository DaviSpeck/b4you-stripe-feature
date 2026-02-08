import { HttpClient } from './HTTPClient.mjs';
import { capitalizeName } from '../utils/formatters.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';

// Link documentação -> https://hotzapp.me/suporte/integracoes/webhooks-de-pedidos

const prepareNameProduct = async (sale_item_uuid, products) => {
  const sale = await Sales_items.findOne({
    where: { uuid: sale_item_uuid },
    attributes: ['uuid', 'id', 'id_offer'],
    paranoid: false,
    include: [
      {
        association: 'offer',
        attributes: ['name'],
        paranoid: false,
      },
      {
        association: 'affiliate',
        required: false,
        include: [
          {
            association: 'user',
            attributes: ['full_name', 'email'],
          },
        ],
      },
    ],
  });
  if (sale && sale.offer && sale.offer.name) {
    products[0].product_name = `${products[0].product_name} - ${sale.offer.name}`;
  }
  return { products, sale };
};
export class HotzApp {
  #service;

  constructor(baseURL) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#service = new HttpClient({ baseURL });
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
    };

    const lineItens = await prepareNameProduct(transaction_id, products);
    body.line_items = lineItens.products;
    if (lineItens && lineItens.sale && lineItens.sale.affiliate && lineItens.sale.affiliate.user) {
      body.aff_name = `${lineItens.sale.affiliate.user.full_name} - ${lineItens.sale.affiliate.user.email}`;
    }
    console.log('printedBillet Hotzapp', JSON.stringify(body, null, 2));
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
      paid_at,
    };
    const lineItens = await prepareNameProduct(transaction_id, products);
    body.line_items = lineItens.products;
    if (lineItens && lineItens.sale && lineItens.sale.affiliate && lineItens.sale.affiliate.user) {
      body.aff_name = `${lineItens.sale.affiliate.user.full_name} - ${lineItens.sale.affiliate.user.email}`;
    }
    console.log('paid billet Hotzapp', JSON.stringify(body, null, 2));
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
      transaction_error_msg: error_message,
    };
    const lineItens = await prepareNameProduct(transaction_id, products);
    body.line_items = lineItens.products;
    if (lineItens && lineItens.sale && lineItens.sale.affiliate && lineItens.sale.affiliate.user) {
      body.aff_name = `${lineItens.sale.affiliate.user.full_name} - ${lineItens.sale.affiliate.user.email}`;
    }
    console.log('refused card Hotzapp', JSON.stringify(body, null, 2));
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
      paid_at,
    };
    const lineItens = await prepareNameProduct(transaction_id, products);
    body.line_items = lineItens.products;
    if (lineItens && lineItens.sale && lineItens.sale.affiliate && lineItens.sale.affiliate.user) {
      body.aff_name = `${lineItens.sale.affiliate.user.full_name} - ${lineItens.sale.affiliate.user.email}`;
    }
    console.log('paid card Hotzapp', JSON.stringify(body, null, 2));
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
  async abandonedCart({ created_at, name, phone, email, document_number, amount, products }) {
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
      paid_at,
      pix_code,
      pix_url,
    };
    const lineItens = await prepareNameProduct(transaction_id, products);
    body.line_items = lineItens.products;
    if (lineItens && lineItens.sale && lineItens.sale.affiliate && lineItens.sale.affiliate.user) {
      body.aff_name = `${lineItens.sale.affiliate.user.full_name} - ${lineItens.sale.affiliate.user.email}`;
    }
    console.log('paid pix Hotzapp', JSON.stringify(body, null, 2));
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
      pix_code,
      pix_url,
    };
    const lineItens = await prepareNameProduct(transaction_id, products);
    body.line_items = lineItens.products;
    if (lineItens && lineItens.sale && lineItens.sale.affiliate && lineItens.sale.affiliate.user) {
      body.aff_name = `${lineItens.sale.affiliate.user.full_name} - ${lineItens.sale.affiliate.user.email}`;
    }
    console.log('generated pix Hotzapp', JSON.stringify(body, null, 2));
    const { data } = await this.#service.post('', body, {
      headers: this.headers,
    });
    return data;
  }
}
