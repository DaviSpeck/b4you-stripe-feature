import { HttpClient } from './HTTPClient.mjs';
import { findRulesTypes } from '../types/integrationRulesTypes.mjs';
import { findSaleItemsType } from '../types/salesItemsTypes.mjs';
import { getFrequency } from '../types/frequencyTypes.mjs';
import { findRoleType, findRoleTypeByKey } from '../types/roles.mjs';
import { capitalizeName } from '../utils/formatters.mjs';
import { findSaleItemStatus } from '../status/salesItemsStatus.mjs';
import { findChargeStatus } from '../status/chargesStatus.mjs';
import { findTransactionTypeByKey } from '../types/transactionTypes.mjs';
import { Cart } from '../database/models/Cart.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';

const findSaleItemForWebhook = async (where) => {
  const saleItem = await Sales_items.findOne({
    where,
    nest: true,
    include: [
      {
        association: 'transactions',
        include: [
          {
            association: 'charge',
          },
          {
            association: 'user',
            attributes: ['email'],
          },
        ],
      },
      {
        association: 'product',
        paranoid: false,
      },
      {
        association: 'student',
      },
      {
        association: 'subscription',
        required: false,
        include: [
          {
            association: 'plan',
          },
        ],
      },
      {
        association: 'refund',
      },
    ],
  });
  return saleItem;
};

const findOneCartWithProduct = async (where) => {
  const cart = await Cart.findOne({
    where,
    include: [{ association: 'product' }],
  });
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
  const charge = charges[charges.length - 1];
  if (subscription) {
    if (subscription.payment_method === 'card') {
      return {
        installments: 1,
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

const resolveRefund = (refund, transactions) => {
  if (!refund) return null;
  const { created_at, reason } = refund;
  const refundCost = transactions.find(
    (t) => t.id_type === findTransactionTypeByKey('cost_refund').id
  );
  return {
    reason,
    created_at,
    cost: refundCost.fee_total,
  };
};

const resolveSplits = (transactions) => {
  if (!transactions || (Array.isArray(transactions) && transactions.length === 0)) return null;

  const commissions = transactions.filter(
    (t) => t.id_type === findTransactionTypeByKey('commission').id
  );
  const paymentTransaction = transactions.find(
    (t) => t.id_type === findTransactionTypeByKey('payment').id
  );
  const producerCommission = commissions.find(
    (t) => t.id_role === findRoleTypeByKey('producer').id
  );
  return {
    base_price: paymentTransaction.price_base,
    sixbase_fee: paymentTransaction.fee_total,
    commissions: commissions.map(
      ({ uuid, id_role, user_net_amount, release_date, released, user: { email } }) => ({
        id: uuid,
        type: findRoleType(id_role).key,
        email,
        amount: user_net_amount,
        release_date,
        released,
      })
    ),
    my_commission: producerCommission.user_net_amount,
    release_date: producerCommission.release_date,
    released: producerCommission.released,
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
  const { product, transactions, subscription, student, refund } = saleItem;
  const charges = transactions
    .filter(({ id_type }) => id_type === findTransactionTypeByKey('payment').id)
    .map(({ charge }) => charge)
    .flat();
  return {
    event_name: event.key,
    sale_id: saleItem.uuid,
    status: findSaleItemStatus(saleItem.id_status).key,
    payment_method: subscription ? subscription.payment_method : saleItem.payment_method,
    installments: 1,
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
    splits: resolveSplits(transactions),
    refund: resolveRefund(refund, transactions),
  };
};

export class Astronmember {
  #service;

  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#service = new HttpClient({ baseURL: apiUrl });
  }

  async webhook({ id_event, sale_uuid, cart_uuid, sale_id }) {
    const event = findRulesTypes(id_event);
    let body = null;
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
    const { data } = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return { data };
  }
}
