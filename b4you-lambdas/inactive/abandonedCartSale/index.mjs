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

export const handler = async () => {
  const promises = [];
  const promisesIntegrations = [];
  const promisesWebhooks = [];
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
  let total = 100;
  let offset = 100;
  while (total !== 0) {
    try {
      const carts = await Cart.findAll({
        logging: console.log,
        subQuery: false,
        nest: true,
        where: {
          created_at: { [Op.lt]: DateHelper().add(30, 'minutes') },
          abandoned: false,
          id_sale_item: {
            [Op.ne]: null,
          },
        },
        limit: 100,
        offset,
        include: [
          {
            association: 'sale_item',
            required: true,
            attributes: ['payment_method', 'uuid', 'price', 'id_affiliate'],
            where: {
              payment_method: ['pix', 'billet'],
            },
            include: [
              {
                association: 'charges',
                required: false,
                attributes: ['id', 'next_business_day'],
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

      for (const cartFull of carts) {
        const cart = cartFull.toJSON();
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
          if (cart.sale_item.payment_method === 'pix') {
            promises.push(Cart.update({ abandoned: true }, { where: { id: cart.id } }));
            promisesIntegrations.push(
              inserteOnIntegration(cart, cart.sale_item.payment_method, true)
            );
            promisesWebhooks.push(insertOnWebhookQueue(cart, cart.sale_item.id));
          } else {
            const date = DateHelper().add(1, 'day');
            const nextBusinessDay = cart.sale_item.charges[0].next_business_day;
            if (date.diff(nextBusinessDay, 'days') > 1) {
              promises.push(Cart.update({ abandoned: true }, { where: { id: cart.id } }));
              promisesIntegrations.push(
                inserteOnIntegration(cart, cart.sale_item.payment_method, true)
              );
              promisesWebhooks.push(insertOnWebhookQueue(cart, cart.sale_item.id));
            }
          }
        } catch (error) {
          console.log('erro no for -> ', error);
        }
      }

      const results = await Promise.allSettled(promises);
      const resultsIntegrations = await Promise.allSettled(promisesIntegrations);
      const resultsWebhooks = await Promise.allSettled(promisesWebhooks);
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
    } catch (error) {
      console.log('erro geral -> ', error);
    } finally {
    }
  }

  await database.closeConnection();
};
