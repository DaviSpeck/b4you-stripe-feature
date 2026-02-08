import { Database } from './database/sequelize.mjs';
import { Charges } from './database/models/Charges.mjs';
import { Sales } from './database/models/Sales.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';
import { Commissions } from './database/models/Commissions.mjs';
import { Products } from './database/models/Products.mjs';
import { Product_offer } from './database/models/Product_offer.mjs';
import { Plugins } from './database/models/Plugins.mjs';
import { Affiliates } from './database/models/Affiliates.mjs';
import { SalesMetricsDaily } from './database/models/SalesMetricsDaily.mjs';
import { Student_products } from './database/models/StudentsProducts.mjs';
import moment from 'moment';
import { ShopifyNotification } from './services/ShopifyNotification.mjs';
import { findRulesTypesByKey } from './utils/rulesTypes.mjs';
import SQS from './queues/aws.mjs';

const splitFullName = (name) => ({
  firstName: name.split(' ')[0],
  lastName: name.substring(name.split(' ')[0].length).trim(),
});

const response = {
  statusCode: 200,
  body: JSON.stringify('Hello from Lambda!'),
};

export const handler = async (event) => {
  console.log(event);

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
    const { Records } = event;
    const [message] = Records;
    const { provider_id } = JSON.parse(message.body);
    const charge = await Charges.findOne({
      nest: true,
      where: {
        provider_id,
        id_status: 4,
      },
      include: [
        {
          association: 'sales_items',
        },
      ],
    });
    if (!charge) {
      console.log('charge not found with provider_id = ', provider_id);
      await database.closeConnection();
      return response;
    }

    const t = await database.sequelize.transaction();
    await Charges.update(
      { paid_at: charge.created_at, id_status: 2 },
      { where: { id: charge.id }, transaction: t }
    );
    const sale = await Sales.findOne({
      raw: true,
      where: { id: charge.id_sale },
    });
    for await (const saleItem of charge.sales_items) {
      await Sales_items.update(
        {
          paid_at: saleItem.created_at,
          id_status: 2,
          list: true,
        },
        { where: { id: saleItem.id }, transaction: t }
      );
      const product = await Products.findOne({
        raw: true,
        where: { id: saleItem.id_product },
      });
      const commissions = await Commissions.findAll({
        raw: true,
        where: {
          id_sale_item: saleItem.id,
        },
      });
      const dateAfter = moment(saleItem.created_at)
        .subtract(3, 'h')
        .startOf('day')
        .add(3, 'h')
        .toISOString();

      for await (const commission of commissions) {
        await Commissions.update(
          {
            id_status: 2,
            release_date: moment().add(1, 'd').format('YYYY-MM-DD'),
          },
          { where: { id: commission.id }, transaction: t }
        );
        await SalesMetricsDaily.increment(`paid_count`, {
          by: 1,
          where: {
            id_product: product.id,
            id_user: commission.id_user,
            time: dateAfter,
          },
          transaction: t,
        });
        await SalesMetricsDaily.increment(`paid_total`, {
          by: commission.amount,
          where: {
            id_product: product.id,
            id_user: commission.id_user,
            time: dateAfter,
          },
          transaction: t,
        });
      }

      const offer = await Product_offer.findOne({
        raw: true,
        attributes: ['shipping_type', 'name', 'quantity', 'id_classroom'],
        where: {
          id: saleItem.id_offer,
        },
      });
      if (product.content_delivery === 'membership') {
        await Student_products.create(
          {
            id_student: saleItem.id_student,
            id_product: saleItem.id_product,
            id_classroom: offer.id_classroom ?? null,
            id_sale_item: saleItem.id,
          },
          {
            transaction: t,
          }
        );
      }
      t.afterCommit(async () => {
        const plugins = await Plugins.findOne({
          where: {
            id_user: product.id_user,
            id_plugin: 19,
          },
          raw: true,
        });
        if (plugins) {
          const { shopName } = plugins.settings;
          const { accessToken } = plugins.settings;
          const { firstName, lastName } = splitFullName(sale.full_name);
          const orderData = {
            line_items: [
              {
                id: saleItem.id_product,
                title: offer.name,
                price: saleItem.price_total,
                grams: 1000,
                quantity: offer.quantity,
              },
            ],

            transactions: [
              {
                kind: 'sale',
                status: 'success',
                amount: saleItem.price_total,
              },
            ],
            email: sale.email,
            total_tax: 0,
            currency: 'BRL',
            shipping_address: {
              first_name: firstName,
              last_name: lastName,
              address1: sale.address.street,
              phone: sale.whatsapp,
              city: sale.address.city,
              province: sale.address.state,
              country: 'Brasil',
              country_code: 'BR',
              zip: sale.address.zipcode,
            },
          };

          const shopifyNotification = new ShopifyNotification(shopName, accessToken);
          await shopifyNotification.createOrUpdateOrder(orderData);
        }
        await SQS.add('webhookEvent', {
          id_product: saleItem.id_product,
          id_sale_item: saleItem.id,
          id_user: product.id_user,
          id_event: findRulesTypesByKey('approved-payment').id,
        });

        await SQS.add('studentApprovedPaymentEmails', {
          product,
          currentStudent: { ...sale },
          saleItem,
          charge,
        });

        const affiliate = await Affiliates.findOne({
          raw: true,
          where: {
            id: saleItem.id_affiliate,
          },
        });

        if (affiliate) {
          await SQS.add('webhookEvent', {
            id_product: saleItem.id_product,
            id_sale_item: saleItem.id,
            id_user: affiliate.id_user,
            id_event: findRulesTypesByKey('approved-payment').id,
          });
        }

        await SQS.add('integrations', {
          id_product: saleItem.id_product,
          eventName: 'approvedPayment',
          data: {
            payment_method: 'card',
            email: sale.email,
            full_name: sale.full_name,
            phone: sale.whatsapp,
            sale: {
              amount: saleItem.price_total,
              created_at: saleItem.created_at,
              document_number: sale.document_number,
              paid_at: saleItem.created_at,
              sale_uuid: saleItem.uuid,
              products: [
                {
                  uuid: product.uuid,
                  product_name: product.name,
                  quantity: 1,
                  price: saleItem.price_total,
                },
              ],
            },
          },
        });
        await SQS.add('blingShipping', {
          sale_id: sale.id,
          is_upsell: false,
        });
        await SQS.add('groupSales', {
          id_product: saleItem.id_product,
          id_student: saleItem.id_student,
          id_sale_item: saleItem.id,
        });
      });
    }
    await t.commit();
  } catch (error) {
    console.log(error);
  } finally {
    await database.closeConnection();
  }

  return response;
};
