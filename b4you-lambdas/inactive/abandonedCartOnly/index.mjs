import { Op } from 'sequelize';
import { Affiliates } from './database/models/Affiliates.mjs';
import { Cart } from './database/models/Cart.mjs';
import { Database } from './database/sequelize.mjs';
import { date as DateHelper } from './date.mjs';
import { findRulesTypesByKey } from './integrationRulesTypes.mjs';
import Queue from './queues/aws.mjs';

const inserteOnIntegration = async (cart, payment_method, sale) => {
  await Queue.add('integrations', {
    id_product: cart.id_product,
    eventName: 'abandonedCart',
    data: {
      payment_method: payment_method || null,
      email: cart.email || null,
      full_name: cart.full_name || null,
      phone: cart.whatsapp || null,
      checkout: {
        url: `https://checkout.b4you.com.br/${cart.offer.uuid}`,
      },
      sale: {
        amount: cart.offer.price || null,
        created_at: cart.created_at || null,
        document_number: cart.document_number || null,
        sale_uuid: sale ? cart.sale_item.uuid : null,
        cart_uuid: cart.uuid || null,
        products: [
          {
            uuid: cart.product.uuid || null,
            product_name: cart.product.name || null,
            quantity: 1,
            price: sale ? cart.sale_item.price : null,
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
  if (cart && cart.sale_item && cart.sale_item.id_affiliate) {
    const affiliate = await Affiliates.findOne({
      raw: true,
      attributes: ['id_user'],
      where: {
        id: cart.sale_item.id_affiliate,
      },
    });
    if (affiliate) {
      await Queue.add('webhookEvent', {
        id_product: cart.id_product,
        id_sale_item,
        id_cart: cart.id,
        id_user: affiliate.id_user,
        id_event: findRulesTypesByKey('abandoned-cart').id,
      });
    }
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

  let offset = 0;
  let total = 100;
  while (total !== 0) {
    const carts = await Cart.findAll({
      nest: true,
      logging: console.log,
      where: {
        created_at: { [Op.lt]: DateHelper().subtract(15, 'minutes') },
        abandoned: false,
        id_sale_item: null,
      },
      limit: 100,
      offset,
      include: [
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
          attributes: ['uuid', 'name', 'id_user'],
          where: {
            id_user: 158777,
          },
        },
      ],
    });
    offset += 100;
    total = carts.length;
    if (total < 100) {
      total = 0;
    }

    for (const cart of carts) {
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
      promises.push(Cart.update({ abandoned: true }, { where: { id: cart.id } }));
      promisesIntegrations.push(inserteOnIntegration(cart, null, null));
      promisesWebhooks.push(insertOnWebhookQueue(cart, null));
      promisesZoppy.push(insertOnZoppy(cart, null));
    }
    await Promise.all(promises);
    await Promise.all(promisesIntegrations);
    await Promise.all(promisesWebhooks);
    await Promise.all(promisesZoppy);
  }
  await database.closeConnection();
};
