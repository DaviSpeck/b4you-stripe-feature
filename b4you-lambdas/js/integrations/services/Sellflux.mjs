// DOC: https://github.com/SellFlux/Webhook
import { HttpClient } from './HTTPClient.mjs';
import { capitalizeName } from '../utils/formatters.mjs';
import { date } from '../utils/date.mjs';

const DATABASE_DATE = 'YYYY-MM-DD HH:mm:ss';

const parsePaymentMethod = (method) => {
  if (method === 'card') return 'cartao-credito';
  if (method === 'pix') return 'pix';
  if (method === 'billet') return 'boleto';
  return null;
};

const parseStatus = (status) => {
  if (status === 'approved-payment') return 'compra-realizada';
  if (status === 'refused-payment') return 'cancelado';
  if (status === 'refund') return 'estornou';
  if (status === 'abandoned-cart') return 'abandonou-carrinho';
  if (status === 'pending') return 'pendente';

  return null;
};

export class Sellflux {
  #service;

  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#service = new HttpClient({ baseURL: apiUrl });
  }

  async webhook({
    name,
    email,
    phone,
    uuid,
    status,
    link = '',
    method,
    expiration_date = null,
    uuid_product,
    product_name,
    amount,
    payment_date = null,
  }) {
    const body = {
      name: capitalizeName(name),
      email,
      phone,
      gateway: 'B4you',
      transaction_id: `B4you-${uuid}`,
      status: parseStatus(status),
      payment_date: payment_date ? date(payment_date).format(DATABASE_DATE) : null,
      url: link,
      payment_method: parsePaymentMethod(method),
      expiration_date: expiration_date ? date(expiration_date).format(DATABASE_DATE) : null,
      product_id: uuid_product,
      product_name,
      transaction_value: Number(amount).toFixed(2),
      tags: [parseStatus(status), parsePaymentMethod(method)],
    };
    console.log('INTEGRATION SELLFLUX BODY', body);
    const { data } = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return { data };
  }
}
