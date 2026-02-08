import { Op } from 'sequelize';
import { Cart } from './database/models/Cart.mjs';
import { findRulesTypesByKey } from './integrationRulesTypes.mjs';
import { date as DateHelper } from './date.mjs';
import Queue from './queues/aws.mjs';
import { Database } from './database/sequelize.mjs';

const inserteOnIntegration = async (cart, payment_method) => {
  await Queue.add('integrations', {
    id_product: cart.id_product,
    eventName: 'abandonedCart',
    data: {
      payment_method: payment_method || null,
      email: cart.email || null,
      full_name: cart.full_name || null,
      phone: cart.whatsapp || null,
      checkout: {
        url: cart?.offer?.uuid
          ? `https://checkout.b4you.com.br/${cart.offer.uuid}${
              cart?.product?.id_type && ![1, 2].includes(cart.product.id_type) ? '/3steps' : ''
            }`
          : '',
      },
      sale: {
        amount: cart?.offer?.price || null,
        created_at: cart.created_at || null,
        document_number: cart.document_number || null,
        sale_uuid: cart?.sale_item ? cart.sale_item.uuid : null,
        cart_uuid: cart.uuid || null,
        products: [
          {
            uuid: cart.product.uuid || null,
            product_name: cart.product.name || null,
            quantity: 1,
            price: cart?.sale_item ? cart.sale_item.price : null,
          },
        ],
      },
    },
  });
};

const insertOnWebhookQueue = async (cart, id_sale_item) => {
  await Queue.add('webhookEvent', {
    id_product: cart.id_product,
    id_sale_item,
    id_cart: cart.id,
    id_user: cart.product.id_user,
    id_event: findRulesTypesByKey('abandoned-cart').id,
  });

  if (cart && cart.id_affiliate) {
    await Queue.add('webhookEvent', {
      id_product: cart.id_product,
      id_sale_item: cart?.id_sale_item || null,
      id_cart: cart.id,
      id_user: cart.id_affiliate,
      id_event: findRulesTypesByKey('abandoned-cart').id,
    });
  }
};

const insertOnZoppy = async (cart, payment_method) => {
   await Queue.add('zoppy', {
    sale_id: null,
    event_name: 'abandonedCart',
    cart: {
      externalId: cart.id,
      costumerEmail: cart.email,
      url: `https://checkout.b4you.com.br/${cart.offer.uuid}`,
      createdAt: cart.created_at || null,
      updatedAt: new Date().toISOString(),
      subtotal: cart.offer.price,
      discount: payment_method ? cart.offer[`discount_${payment_method}`] : 0,
      shipping: cart.offer.shipping_price || 0,
      product: {
        id: cart.id_product,
        quantity: 1,
        name: cart.product.name,
      }
    },
    id_user: cart.product.id_user,
  });
}

export const handler = async () => {
  const promises = [];
  const promisesIntegrations = [];
  const promisesWebhooks = [];
  const promisesZoppy = [];

  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT } = process.env;

  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();
  try {
    const carts = await Cart.findAll({
      nest: true,
      where: {
        created_at: { [Op.lt]: DateHelper().subtract(1, 'hours') },
        abandoned: false,
      },
      limit: 500,
      include: [
        {
          association: 'sale_item',
          required: false,
          attributes: ['payment_method', 'uuid', 'price', 'id_affiliate'],
          include: [
            {
              association: 'charges',
              required: false,
              attributes: ['next_business_day'],
            },
          ],
        },
        {
          association: 'offer',
          required: false,
          paranoid: false,
          attributes: ['price', 'uuid'],
        },
        {
          association: 'product',
          required: true,
          paranoid: true,
          attributes: ['uuid', 'name', 'id_user', 'id_type'],
          where: {
            id_user: {
              [Op.ne]: 158777,
            },
          },
        },
      ],
    });

    for (const cart of carts) {
      try {
        console.log(
          `WORKER ABANDONED CART - ${JSON.stringify({
            id: cart.id,
            uuid: cart.uuid,
            id_product: cart.id_product,
            id_offer: cart.id_offer,
            email: cart.email,
            full_name: cart.full_name,
            document_number: cart.document_number,
            whatsapp: cart.whatsapp,
          })}`
        );
        if (!cart.id_sale_item) {
          promises.push(Cart.update({ abandoned: true }, { where: { id: cart.id } }));
          promisesIntegrations.push(inserteOnIntegration(cart, null));
          promisesWebhooks.push(insertOnWebhookQueue(cart, null));
          promisesZoppy.push(insertOnZoppy(cart, null));
        } else if (cart.sale_item && cart.sale_item.payment_method) {
          promises.push(Cart.update({ abandoned: true }, { where: { id: cart.id } }));
          promisesIntegrations.push(inserteOnIntegration(cart, cart.sale_item.payment_method));
          promisesWebhooks.push(insertOnWebhookQueue(cart, cart.sale_item.id));
          promisesZoppy.push(insertOnZoppy(cart, cart.sale_item.payment_method));
        } else {
          const date = DateHelper().add(1, 'day');
          if (cart.sale_item && cart.sale_item.charges.length > 0) {
            const nextBusinessDay = cart.sale_item.charges[0].next_business_day;
            if (date.diff(nextBusinessDay, 'days') > 1) {
              promises.push(Cart.update({ abandoned: true }, { where: { id: cart.id } }));
              promisesIntegrations.push(
                inserteOnIntegration(cart, cart.sale_item.payment_method, true)
              );
              promisesWebhooks.push(insertOnWebhookQueue(cart, cart.sale_item.id));
              promisesZoppy.push(insertOnZoppy(cart, cart.sale_item.payment_method));
            }
          }
        }
      } catch (error) {
        console.log('error inside loop -> ', error);
      }
    }
    const results = await Promise.allSettled(promises);
    const resultsIntegrations = await Promise.allSettled(promisesIntegrations);
    const resultsWebhooks = await Promise.allSettled(promisesWebhooks);
    const resultsZoppy = await Promise.allSettled(promisesZoppy);

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Erro na promessa:', result.reason);
      }
    }
    for (const result of resultsIntegrations) {
      if (result.status === 'rejected') {
        console.error('Erro na promessa integrations:', result.reason);
      }
    }
    for (const result of resultsWebhooks) {
      if (result.status === 'rejected') {
        console.error('Erro na promessa webhooks:', result.reason);
      }
    }
    for (const result of resultsZoppy) {
      if (result.status === "rejected") {
        console.error("Erro na promessa zoppy:", result.reason);
      }
    }
  } catch (error) {
    console.log('error geral -> ', error);
  } finally {
    await database.closeConnection();
  }
};
