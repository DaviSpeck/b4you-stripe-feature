import { Op } from 'sequelize';
import { Affiliates } from '../database/models/Affiliates.mjs';
import { Cart } from '../database/models/Cart.mjs';
import { Products } from '../database/models/Products.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Webhooks as WebhooksModel } from '../database/models/Webhooks.mjs';
import { Webhooks_logs } from '../database/models/Webhooks_logs.mjs';
import { Webhooks } from '../services/Webhooks.mjs';
import { findChargeStatus } from '../status/chargesStatus.mjs';
import { findRefundStatus } from '../status/refundStatus.mjs';
import { findSaleItemStatus } from '../status/salesItemsStatus.mjs';
import { getFrequency } from '../types/frequencyTypes.mjs';
import { findRulesTypes } from '../types/integrationRulesTypes.mjs';
import { findRoleType, findRoleTypeByKey } from '../types/roles.mjs';
import { findSaleItemsType } from '../types/salesItemsTypes.mjs';
import { date } from '../utils/date.mjs';
import { capitalizeName } from '../utils/formatters.mjs';

const ARCO_TYPE = 3;

const createWebhookLog = async (data) => Webhooks_logs.create(data);

function getDocumentType(doc) {
  const clean = String(doc).replace(/\D/g, '');
  if (clean.length === 11) return 'cpf';
  if (clean.length === 14) return 'cnpj';
  return 'INVÁLIDO';
}

const DATABASE_DATE = 'YYYY-MM-DD HH:mm:ss';

const send = async (body, webhooks, event_id = null, arco = false) => {
  console.log(`body ${arco} ->  ${JSON.stringify(body)}`);
  for await (const { id, url, token } of webhooks) {
    let data = {
      id_webhook: id,
      tries: 1,
      body,
      id_event: event_id,
    };
    try {
      const response = await new Webhooks(url, token, arco).send(body);
      data = {
        ...data,
        response_status: response.status,
        sent_at: date().format(DATABASE_DATE),
        success: true,
      };
      if (arco) {
        console.log('response arco sem json', response);

        if (response?.data) {
          console.log('response arco json', JSON.stringify(response.data));
        }
      }
    } catch (error) {
      console.log('error -> ', error);
      if (error?.response?.status) data.response_status = error.response.status;
      data.success = false;
      console.log(`Erro ao enviar webhook em ID WEBHOOK ${id} - ${url} - ${error}`);
      const w = await WebhooksModel.findOne({ where: { id } });
      if (w) {
        if (w.tries > 4) {
          await WebhooksModel.update({ invalid: true }, { where: { id } });
          console.log(`WEBHOOK ID  ${id} desativado por varias tentativas sem sucesso`);
        } else {
          await WebhooksModel.update({ tries: w.tries + 1 }, { where: { id } });
        }
      }
      if (error?.response?.data) {
        try {
          console.log(
            `(ERROR DATA) Erro ao enviar webhook em ID WEBHOOK ${id} - ${url} - ${error} - ${JSON.stringify(
              error.response.data
            )}`
          );
        } catch (e) {
          console.log(
            `(ERROR DATA) Erro ao enviar webhook em ID WEBHOOK ${id} - ${url} - ${error} - [Não foi possível converter error.response.data]`
          );
        }
      }
    }
    await createWebhookLog(data);
  }
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

  if (saleItem.payment_method === 'card') {
    const response = {
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
    if (charge.provider_response_details) {
      response.card_details = charge.provider_response_details;
    }
    return response;
  }

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

const resolveCharges = (charges) => {
  if (!charges || (Array.isArray(charges) && charges.length === 0)) return null;
  return charges.map(({ uuid, price, id_status, created_at }) => ({
    id: uuid,
    amount: price,
    status: findChargeStatus(id_status).key,
    created_at,
  }));
};

const resolveSplits = (commissions, saleItem) => {
  if (!commissions || (Array.isArray(commissions) && commissions.length === 0)) return null;

  const producerCommission = commissions.find(
    (t) => t.id_role === findRoleTypeByKey('producer').id
  );
  return {
    base_price: saleItem.price_base,
    fee: saleItem.fee_total,
    commissions: commissions.map(
      ({ id_role, amount, release_date, id_status, user: { email } }) => ({
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

const resolveSplitsArco = (commissions) => {
  if (!commissions || (Array.isArray(commissions) && commissions.length === 0)) return null;

  return commissions.map(({ id_role, amount, user: { email, full_name, document_number } }) => ({
    type: findRoleType(id_role).label_arco,
    email,
    amount,
    name: full_name,
    document: document_number,
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

const resolveAffiliateCart = (cart) => {
  if (cart.affiliate) {
    return {
      b4f: cart.affiliate.uuid,
    };
  }
  return null;
};

const resolveBodyCart = (cart, event) => {
  const baseUrl =
    cart.product.uuid === '66dc9e2b-f92d-4175-b2ee-36ba733f830a'
      ? 'https://seguro.sejaziva.com.br'
      : 'https://checkout.b4you.com.br';
  //let url = `https://checkout.b4you.com.br/${cart.offer.uuid}`;
  let url = `${baseUrl}/${cart.offer.uuid}`;
  let url3steps = url;
  if (cart.affiliate) {
    url += `?b4f=${cart.affiliate.uuid}`;
    url3steps += `?b4f=${cart.affiliate.uuid}`;
  }
  return {
    event_name: event.key,
    sale_id: null,
    group_id: null,
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
      logo: cart.product.logo ?? null,
      cover: cart.product.cover ?? null,
      offer_image: cart.offer.offer_image ?? null,
    },
    customer: {
      full_name: capitalizeName(cart.full_name),
      email: cart.email,
      whatsapp: cart.whatsapp,
      document_number: cart.document_number,
      address: cart.address,
    },
    affiliate: resolveAffiliateCart(cart),
    checkout: {
      url,
      url_3_steps: url3steps,
      price: cart.offer.price,
    },
    offer: {
      id: cart.offer.uuid,
      name: capitalizeName(cart.offer.name),
      quantity: cart.offer.quantity,
      original_price: cart.offer.price || 0,
    },
    tracking_parameters: {
      src: null,
      sck: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      b1: null,
      b2: null,
      b3: null,
    },
    subscription: null,
    charges: null,
    splits: null,
    refund: null,
  };
};

const resolveCoupon = (coupon, discount_amount = 0) => {
  if (!coupon) return null;
  const {
    coupons_sales: { coupon: name, amount },
  } = coupon;
  return {
    name,
    amount: discount_amount,
    type: amount > 0 ? 'amount' : 'percentage',
  };
};

const resolveAffiliate = (aff) => {
  if (!aff) return null;
  const {
    user_affiliate: { full_name, email },
  } = aff;
  return { full_name, email, b4f: aff.uuid };
};

/**
 * Resolve marketplace data from offer metadata
 * @param {Object} metadata - Offer metadata containing line_items
 * @returns {Array|null} - Array of marketplace items or null if no metadata
 */
const resolveMarketplace = (metadata) => {
  if (!metadata || !metadata.line_items || !Array.isArray(metadata.line_items)) {
    return null;
  }

  return metadata.line_items.map((item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const priceTotal = price * quantity;
    return {
      id: item.variant_id,
      quantity: quantity,
      price: price,
      price_total: Math.round(priceTotal * 100) / 100, // Round to 2 decimal places
    };
  });
};

const resolveBodySaleItem = (saleItem, event) => {
  const {
    product,
    charges,
    commissions,
    subscription,
    refund,
    offer,
    coupon_sale,
    affiliate,
    sale,
    student,
    discount_amount,
    otherSalesItems = [],
  } = saleItem;

  const baseUrl =
    product.uuid === 'dcb85ce0-313d-4f8d-80e2-3f21452dbcf8'
      ? 'https://seguro.rejuderme.com.br'
      : 'https://checkout.b4you.com.br';

  let url = `${baseUrl}/${offer.uuid}`;
  //let url = `https://checkout.b4you.com.br/${offer.uuid}`;
  let url3steps = `${url}/3steps`;
  if (affiliate) {
    url += `?b4f=${affiliate.uuid}`;
    url3steps += `?b4f=${affiliate.uuid}`;
  }

  const marketplace = resolveMarketplace(offer.metadata);

  return {
    event_name: event.key,
    sale_id: saleItem.uuid,
    group_id: saleItem.sale.uuid,
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
      logo: product.logo ?? null,
      cover: product.cover ?? null,
      dimensions: product.dimensions ?? null,
      offer_image: offer.offer_image ?? null,
    },
    products: otherSalesItems.map((s) => ({
      type: findSaleItemsType(s.type).type,
      id: s.product.uuid,
      name: capitalizeName(s.product.name),
      logo: s.product.logo ?? null,
      cover: s.product.cover ?? null,
      dimensions: s.product.dimensions ?? null,
    })),
    offer: {
      id: offer.uuid,
      name: capitalizeName(offer.name),
      quantity: offer.quantity,
      original_price: offer.price || 0,
    },
    customer: {
      id: student.uuid,
      full_name: capitalizeName(sale.full_name),
      email: sale.email,
      whatsapp: sale.whatsapp,
      document_number: sale.document_number,
      address: sale.address || null,
    },
    coupon: resolveCoupon(coupon_sale, discount_amount),
    affiliate: resolveAffiliate(affiliate),
    tracking_parameters: {
      src: saleItem.src,
      sck: saleItem.sck,
      utm_source: saleItem.utm_source,
      utm_medium: saleItem.utm_medium,
      utm_campaign: saleItem.utm_campaign,
      utm_content: saleItem.utm_content,
      utm_term: saleItem.utm_term,
      b1: saleItem.b1,
      b2: saleItem.b2,
      b3: saleItem.b3,
    },
    subscription: resolveSubscriptions(subscription),
    charges: resolveCharges(charges),
    splits: resolveSplits(commissions, saleItem),
    refund: resolveRefund(refund),
    checkout: {
      url,
      url_3_steps: url3steps,
    },
    tracking: {
      code: saleItem.tracking_code,
      url: saleItem.tracking_url,
      company: saleItem.tracking_company,
      price: saleItem.shipping_price,
    },
    marketplace,
  };
};

const findSaleItemForWebhook = async (where) => {
  const saleItem = await Sales_items.findOne({
    where,
    nest: true,
    attributes: [
      'id',
      'uuid',
      'id_sale',
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
      'b1',
      'b2',
      'b3',
      'credit_card',
      'price_base',
      'fee_total',
      'tracking_code',
      'tracking_url',
      'tracking_company',
      'price_product',
      'id_affiliate',
      'discount_amount',
      'shipping_price',
    ],
    include: [
      {
        association: 'offer',
        attributes: ['uuid', 'name', 'quantity', 'price', 'offer_image', 'metadata'],
        paranoid: false,
      },
      {
        association: 'sale',
        attributes: ['address', 'uuid', 'full_name', 'email', 'whatsapp', 'document_number'],
      },
      {
        association: 'coupon_sale',
        required: false,
        include: [
          {
            association: 'coupons_sales',
            required: false,
            attributes: ['coupon', 'percentage', 'amount'],
          },
        ],
      },
      {
        association: 'affiliate',
        required: false,
        attributes: ['id', 'id_user', 'uuid'],
        include: [
          {
            association: 'user_affiliate',
            required: false,
            attributes: ['email', 'full_name'],
          },
        ],
      },
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
          'provider_response_details',
        ],
      },
      {
        association: 'commissions',
        include: [
          {
            association: 'user',
            attributes: ['email', 'full_name', 'document_number'],
          },
        ],
      },
      {
        association: 'product',
        attributes: ['id', 'uuid', 'name', 'cover', 'logo', 'dimensions', 'content_delivery'],
        paranoid: false,
      },
      {
        association: 'student',
        attributes: ['uuid'],
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
        attributes: ['id', 'uuid', 'name', 'payment_type', 'logo', 'cover'],
        paranoid: false,
        include: [
          {
            association: 'plans',
            required: false,
            attributes: ['label', 'price'],
          },
        ],
      },
      {
        association: 'offer',
        attributes: ['uuid', 'name', 'price', 'offer_image', 'quantity'],
      },
      { association: 'affiliate', attributes: ['id', 'uuid'] },
    ],
  });
  if (cart.product.payment_type === 'subscription' && cart.product.plans.length > 0) {
    cart.offer.price = cart.product.plans.map(({ label, price }) => ({
      label,
      price,
    }));
  }
  return cart;
};

const resolveBodyArco = (saleItem, event) => {
  const { charges, sale } = saleItem;
  const products = [];
  const commissions = [];
  if (saleItem.otherSalesItems.length > 0) {
    for (const s of saleItem.otherSalesItems) {
      if (s.product.content_delivery === 'physical') {
        products.push({
          code: s.product.uuid,
          name: capitalizeName(s.product.name),
          plans: {
            code: s.offer.uuid,
            name: capitalizeName(s.offer.name),
            price: s.price_total,
            quantity: s.offer.quantity,
          },
        });
        for (const comm of s.commissions) {
          commissions.push(comm);
        }
      }
    }
  }
  const clean = commissions.map((c) => c.toJSON());
  const totalCommissions = Object.values(
    clean.reduce((acc, item) => {
      const key = `${item.id_user}-${item.id_role}`;
      if (!acc[key]) {
        acc[key] = { ...item };
      } else {
        acc[key].amount += item.amount;
      }
      return acc;
    }, {})
  );
  if (products.length > 0) {
    return {
      event: event.key === 'approved-payment' ? 'order:created' : 'order:updated',
      order: {
        token: saleItem.sale.uuid,
        amount: saleItem.price_product,
        effective_amount: saleItem.price_product,
        status: event.key === 'approved-payment' ? 'paid' : 'cancelled',
        payment_type:
          saleItem.payment_method === 'card'
            ? 'creditcard'
            : saleItem.payment_method === 'pix'
              ? 'pix'
              : 'billet',
        date_created: date(saleItem.created_at).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        date_updated: date(saleItem.updated_at).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        billet_link: saleItem.payment_method === 'billet' ? charges[0].billet_url : '',
        billet_code: saleItem.payment_method === 'billet' ? charges[0].line_code : '',
        receiver_name: capitalizeName(sale.full_name),
        receiver_document: sale.document_number,
        products,
        customer: {
          document: sale.document_number,
          email: sale.email,
          phone: sale.whatsapp,
          document_type: getDocumentType(sale.document_number),
          name: capitalizeName(sale.full_name),
        },
        shipping_address: {
          complement: saleItem.sale.address.complement,
          address: saleItem.sale.address.street,
          city: saleItem.sale.address.city,
          country: 'BR',
          district: saleItem.sale.address.neighborhood,
          number: saleItem.sale.address.number,
          state: saleItem.sale.address.state,
          zipcode: saleItem.sale.address.zipcode,
        },
        commissions: resolveSplitsArco(totalCommissions),
      },
    };
  } else {
    return null;
  }
};

export class WebhooksEvents {
  constructor(databaseInstance) {
    this.database = databaseInstance;
  }

  async getWebhooks({ event_id, id_product, id_user }) {
    const webhooks = await WebhooksModel.findAll({
      raw: true,
      logging: true,
      where: {
        id_user,
        [Op.and]: [
          {
            [Op.or]: [{ id_product }, { id_product: null }],
          },
          {
            [Op.or]: [
              { events: { [Op.like]: `${event_id}` } },
              { events: { [Op.like]: `${event_id},%` } },
              { events: { [Op.like]: `%,${event_id}` } },
              { events: { [Op.like]: `%,${event_id},%` } },
            ],
          },
        ],
        deleted_at: {
          [Op.eq]: null,
        },
        id_type: {
          [Op.ne]: ARCO_TYPE,
        },
      },
    });
    return webhooks;
  }

  async getWebhooksArco({ event_id, id_product, id_user }) {
    const webhooks = await WebhooksModel.findAll({
      raw: true,
      where: {
        id_user,
        [Op.and]: [
          {
            [Op.or]: [{ id_product }, { id_product: null }],
          },
          {
            [Op.or]: [
              { events: { [Op.like]: `${event_id}` } },
              { events: { [Op.like]: `${event_id},%` } },
              { events: { [Op.like]: `%,${event_id}` } },
              { events: { [Op.like]: `%,${event_id},%` } },
            ],
          },
        ],
        deleted_at: {
          [Op.eq]: null,
        },
        id_type: ARCO_TYPE,
      },
    });
    return webhooks;
  }

  async send({ event_id, id_product, id_user, id_sale_item, id_cart, id_affiliate }) {
    let body = null;
    let bodyArco = null;

    const event = findRulesTypes(event_id);

    if (!event) throw new Error('event not found');

    const webhooks = await this.getWebhooks({ event_id, id_product, id_user });
    let webhooksArco = await this.getWebhooksArco({
      event_id,
      id_product,
      id_user,
    });

    if (webhooks.length === 0 && webhooksArco.length === 0) {
      console.log('no webhooks found for user -> ', id_user);
      return null;
    }

    if (event_id === 12 || event_id === 13 || event_id === 14) {
      const affiliate = await Affiliates.findOne({
        where: {
          id: id_affiliate,
        },
        include: [
          {
            association: 'user_affiliate',
            attributes: ['full_name', 'email', 'whatsapp'],
          },
        ],
      });

      const product = await Products.findOne({
        where: {
          id: id_product,
        },
        attributes: ['id', 'uuid', 'name'],
      });

      if (!affiliate) {
        throw new Error('Affiliate not found for the event');
      }

      if (!product) {
        throw new Error('Product not found for the event');
      }

      const bodyObj = {
        affiliate: {
          name: affiliate.user_affiliate.full_name,
          email: affiliate.user_affiliate.email,
          phone: affiliate.user_affiliate.whatsapp,
        },
        product: {
          id: id_product,
          name: capitalizeName(product.name),
        },
        event_name: event.key,
      };

      body = bodyObj;

      if (webhooksArco.length > 0) {
        bodyArco = bodyObj;
      }
    }

    if (id_sale_item) {
      const saleItem = await findSaleItemForWebhook({ id: id_sale_item });
      if (saleItem.type === 3 && id_user === 218411 && event_id === 1) {
        // ignorando webhooks de order bump venda aprovada para o usuario
        console.log('ignorando webhooks desse usuario');
        return null;
      }

      if (webhooksArco.length > 0 && saleItem.type === 3 && event_id === 1) {
        // ignorando webhooks de order bump venda aprovada para o usuario
        console.log('ignorando webhooks desse usuario da arco');
        return null;
      }

      // saleItem type main
      if (saleItem.type === 1) {
        // carregar os outros produtos da venda pra montarmos o body completo
        const otherSalesItems = await Sales_items.findAll({
          nest: true,
          attributes: ['id', 'type', 'id_product', 'price_total'],
          where: {
            id_sale: saleItem.id_sale,
          },
          include: [
            {
              association: 'product',
              attributes: ['id', 'uuid', 'name', 'cover', 'logo', 'dimensions', 'content_delivery'],
              paranoid: false,
            },
            {
              association: 'offer',
              attributes: ['quantity', 'uuid', 'name'],
              paranoid: false,
            },
            {
              association: 'commissions',
              include: [
                {
                  association: 'user',
                  attributes: ['email', 'full_name', 'document_number'],
                },
              ],
            },
          ],
        });
        saleItem.otherSalesItems = otherSalesItems;
      }
      body = resolveBodySaleItem(saleItem, event);
      if (webhooksArco.length > 0) {
        bodyArco = resolveBodyArco(saleItem, event);
        if (!bodyArco) webhooksArco = [];
      }
    } else {
      if (id_cart) {
        const cart = await findOneCartWithProduct({ id: id_cart });
        body = resolveBodyCart(cart, event);
      }
    }

    await Promise.all([
      send(body, webhooks, event_id, false),
      send(bodyArco, webhooksArco, event_id, true),
    ]);

    return {
      body,
      bodyArco,
    };
  }
}
