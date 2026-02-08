import { HttpClient } from './HTTPClient.mjs';
import { findRulesTypes } from '../types/integrationRulesTypes.mjs';
import { findSaleItemsType } from '../types/salesItemsTypes.mjs';
import { getFrequency } from '../types/frequencyTypes.mjs';
import { findRoleType, findRoleTypeByKey } from '../types/roles.mjs';
import { capitalizeName } from '../utils/formatters.mjs';
import { findSaleItemStatus } from '../status/salesItemsStatus.mjs';
import { findChargeStatus } from '../status/chargesStatus.mjs';
import { Cart } from '../database/models/Cart.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { findRefundStatus } from '../status/refundStatus.mjs';

const findSaleItemForWebhook = async (where) => {
  const saleItem = await Sales_items.findOne({
    where,
    nest: true,
    attributes: [
      'id',
      'uuid',
      'id_status',
      'payment_method',
      'id_product',
      'created_at',
      'updated_at',
      'paid_at',
      'type',
      'src',
      'sck',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'credit_card',
      'price_base',
      'fee_total',
    ],
    include: [
      { association: 'offer', attributes: ['uuid'], paranoid: false },
      {
        association: 'charges',
        attributes: [
          'installments',
          'pix_code',
          'qrcode_url',
          'billet_url',
          'line_code',
          'price',
          'id_status',
          'created_at',
          'uuid',
        ],
      },
      { association: 'commissions', include: [{ association: 'user', attributes: ['email'] }] },
      {
        association: 'product',
        attributes: ['id', 'uuid', 'name'],
        paranoid: false,
      },
      {
        association: 'student',
        attributes: ['full_name', 'whatsapp', 'document_number', 'email'],
      },
      {
        association: 'subscription',
        attributes: [
          'payment_method',
          'credit_card',
          'uuid',
          'created_at',
          'next_charge',
          'active',
        ],
        required: false,
        include: [
          {
            association: 'plan',
          },
        ],
      },
      {
        association: 'refund',
        attributes: ['reason', 'created_at', 'id_status'],
        required: false,
      },
    ],
  });
  return saleItem;
};

const findOneCartWithProduct = async (where) => {
  const cart = await Cart.findOne({
    where,
    nest: true,
    include: [
      {
        association: 'product',
        attributes: ['id', 'uuid', 'name', 'payment_type'],
        paranoid: false,
        include: [{ association: 'plans', required: false, attributes: ['label', 'price'] }],
      },
      { association: 'offer', attributes: ['uuid', 'price'] },
    ],
  });
  if (cart.product.payment_type === 'subscription' && cart.product.plans.length > 0) {
    cart.offer.price = cart.product.plans.map(({ label, price }) => {
      label, price;
    });
  }
  return cart;
};

const resolveSubscriptions = (subscription) => {
  if (!subscription) return null;
  const { plan } = subscription;
  return {
    id: subscription.uuid,
    start_date: subscription.created_at,
    next_charge: subscription.next_charge,
    status: subscription.active ? 'active' : 'inactive',
    plan: {
      id: plan.uuid,
      name: capitalizeName(plan.label),
      frequency: getFrequency(plan.frequency_quantity, plan.payment_frequency),
    },
  };
};

const resolvePayment = (saleItem, charges, subscription) => {
  const charge = charges[0];
  if (subscription) {
    if (subscription.payment_method === 'card') {
      return {
        installments: charge.installments,
        card: [
          {
            brand: subscription.credit_card.brand,
            last_four_digits: subscription.credit_card.last_four_digits,
          },
        ],
        pix: null,
        billet: null,
      };
    }

    if (subscription.payment_method === 'píx') {
      return {
        installments: 1,
        card: null,
        pix: {
          code: charge.pix_code,
          url: charge.qrcode_url,
        },
        billet: null,
      };
    }
  }

  if (saleItem.payment_method === 'card')
    return {
      installments: charge.installments,
      card: [
        {
          brand: saleItem.credit_card.brand,
          last_four_digits: saleItem.credit_card.last_four,
        },
      ],
      pix: null,
      billet: null,
    };

  if (saleItem.payment_method === 'pix')
    return {
      installments: 1,
      card: null,
      pix: {
        code: charge.pix_code,
        url: charge.qrcode_url,
      },
      billet: null,
    };

  return {
    installments: 1,
    card: null,
    pix: null,
    billet: {
      url: charge.billet_url,
      line_code: charge.line_code,
    },
  };
};

const resolveCharges = (charges) => {
  if (!charges || (Array.isArray(charges) && charges.length === 0)) return null;
  return charges.map(({ uuid, price, id_status, created_at }) => ({
    id: uuid,
    amount: price,
    status: findChargeStatus(id_status).key,
    created_at,
  }));
};

const resolveRefund = (refund) => {
  if (!refund) return null;
  const { created_at, reason, id_status } = refund;
  return {
    reason,
    created_at,
    status: findRefundStatus(id_status).key,
  };
};

const resolveSplits = (commissions, saleItem) => {
  if (!commissions || (Array.isArray(commissions) && commissions.length === 0)) return null;

  const producerCommission = commissions.find(
    (t) => t.id_role === findRoleTypeByKey('producer').id
  );

  return {
    base_price: saleItem.price_base,
    sixbase_fee: saleItem.fee_total,
    commissions: commissions.map(
      ({ id, id_role, amount, release_date, id_status, user: { email } }) => ({
        id,
        type: findRoleType(id_role).key,
        email,
        amount,
        release_date,
        released: id_status === 3,
      })
    ),
    my_commission: producerCommission.amount,
    release_date: producerCommission.release_date,
    released: producerCommission.id_status === 3,
  };
};

const resolveBodyCart = (cart, event) => ({
  event_name: event.key,
  sale_id: null,
  status: null,
  payment_method: null,
  installments: null,
  card: null,
  pix: null,
  billet: null,
  created_at: cart.created_at,
  updated_at: cart.updated_at,
  paid_at: null,
  type: null,
  product: {
    id: cart.product.uuid,
    name: capitalizeName(cart.product.name),
  },
  customer: {
    full_name: capitalizeName(cart.full_name),
    email: cart.email,
    whatsapp: cart.whatsapp,
    document_number: cart.document_number,
  },
  checkout: {
    url: `https://checkout.b4you.com.br/${cart.offer.uuid}`,
    price: cart.offer.price,
  },
  tracking_parameters: {
    src: null,
    sck: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
  },
  subscription: null,
  charges: null,
  splits: null,
  refund: null,
});

const resolveBodySaleItem = (saleItem, event) => {
  const { product, charges, commissions, subscription, student, refund, offer } = saleItem;
  return {
    event_name: event.key,
    sale_id: saleItem.uuid,
    status: findSaleItemStatus(saleItem.id_status).key,
    payment_method: saleItem.payment_method,
    installments: charges[0].installments,
    ...resolvePayment(saleItem, charges, subscription),
    created_at: saleItem.created_at,
    updated_at: saleItem.updated_at,
    paid_at: saleItem.paid_at,
    type: findSaleItemsType(saleItem.type).type,
    product: {
      id: product.uuid,
      name: capitalizeName(product.name),
    },
    customer: {
      full_name: capitalizeName(student.full_name),
      email: student.email,
      whatsapp: student.whatsapp,
      document_number: student.document_number,
    },
    tracking_parameters: {
      src: saleItem.src,
      sck: saleItem.sck,
      utm_source: saleItem.utm_source,
      utm_medium: saleItem.utm_medium,
      utm_campaign: saleItem.utm_campaign,
      utm_content: saleItem.utm_content,
      utm_term: saleItem.utm_term,
    },
    subscription: resolveSubscriptions(subscription),
    charges: resolveCharges(charges),
    splits: resolveSplits(commissions, saleItem),
    refund: resolveRefund(refund),
    checkout: {
      url: `https://checkout.b4you.com.br/${offer.uuid}`,
    },
  };
};
export class Cademi {
  #service;

  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#service = new HttpClient({ baseURL: apiUrl });
  }

  async webhook({ id_event, sale_uuid, cart_uuid, sale_id }) {
    console.log('CADEMI WEBHOOK', id_event, sale_uuid);
    let body = null;
    const event = findRulesTypes(id_event);
    if (!event) throw new Error('event not found');
    if (sale_uuid) {
      const saleItem = await findSaleItemForWebhook({ uuid: sale_uuid });
      body = resolveBodySaleItem(saleItem, event);
    } else if (sale_id) {
      const saleItem = await findSaleItemForWebhook({ id: sale_id });
      body = resolveBodySaleItem(saleItem, event);
    } else {
      const cart = await findOneCartWithProduct({ uuid: cart_uuid });
      body = resolveBodyCart(cart, event);
    }
    console.log('BODY CADEMI', body);
    const { data } = await this.#service.post('/', body, {
      headers: this.headers,
    });
    console.log('RESPONSE CADEMI', data);
    return { data };
  }
}
