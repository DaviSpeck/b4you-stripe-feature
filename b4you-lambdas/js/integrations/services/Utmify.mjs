import { HttpClient } from './HTTPClient.mjs';
import { capitalizeName } from '../utils/formatters.mjs';
import { date } from '../utils/date.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
const { UTMIFY_URL = 'https://api.utmify.com.br/api-credentials' } = process.env;

const parsePaymentMethod = (method) => {
  if (method === 'card') return 'credit_card';
  if (method === 'pix') return 'pix';
  if (method === 'billet') return 'boleto';
  return null;
};

const parseStatus = (status) => {
  if (status === 'approved-payment') return 'paid';
  if (status === 'refused-payment') return 'refused';
  if (status === 'refund') return 'refunded';
  if (status === 'pending') return 'waiting_payment';
  if (status === 'chargedback') return 'chargedback';
  return null;
};

export class Utmify {
  #service;

  constructor(token) {
    this.headers = {
      'Content-Type': 'application/json',
      'x-api-token': token,
    };
    this.#service = new HttpClient({ baseURL: UTMIFY_URL });
  }
  async createOrder({
    document_number,
    email,
    method,
    name,
    paid_at = null,
    phone,
    refund_at = null,
    status,
    uuid,
  }) {
    const saleItem = await Sales_items.findOne({
      where: {
        uuid,
      },
      attributes: [
        'sck',
        'src',
        'utm_campaign',
        'utm_content',
        'utm_medium',
        'utm_source',
        'utm_term',
        'fee_total',
        'quantity',
        'price_product',
        'created_at',
      ],
      include: [
        {
          association: 'commissions',
          where: { id_role: 1 },
        },
        { association: 'product', attributes: ['name', 'uuid'], paranoid: false },
      ],
    });
    const {
      sck = '',
      src = '',
      utm_campaign = '',
      utm_content = '',
      utm_medium = '',
      utm_source = '',
      utm_term = '',
    } = saleItem;
    if (status === 'refund') refund_at = date().toISOString();
    const body = {
      orderId: uuid,
      platform: 'B4YOU',
      paymentMethod: parsePaymentMethod(method),
      status: parseStatus(status),
      createdAt: date(saleItem.created_at).toISOString(),
      approvedDate: paid_at ? date(paid_at).toISOString() : null,
      refundedAt: refund_at ? date(refund_at).toISOString() : null,
      customer: {
        name: capitalizeName(name),
        email,
        phone,
        document: document_number,
      },
      product: {
        id: saleItem.product.uuid,
        name: saleItem.product.name,
        planId: null,
        planName: null,
        quantity: saleItem.quantity,
        priceInCents: saleItem.price_product * 100,
      },
      trackingParameters: {
        sck,
        src,
        utm_campaign,
        utm_content,
        utm_medium,
        utm_source,
        utm_term,
      },
      commission: {
        totalPriceInCents: saleItem.price_product * 100,
        gatewayFeeInCents: saleItem.fee_total * 100,
        userCommissionInCents: saleItem.commissions[0].amount * 100,
        currency: 'BRL',
      },
    };

    console.log('INTEGRATION UTMIFY START BODY', body);
    const { data } = await this.#service.post('/orders', body, {
      headers: this.headers,
    });
    console.log('INTEGRATION UTMIFY RESPONSE', data);
    return { data };
  }
}
