import { Op } from 'sequelize';
import { Charges } from './database/models/Charges.mjs';
import { Database } from './database/sequelize.mjs';
import { date } from './date.mjs';
import SQS from './queues/aws.mjs';

export const handler = async () => {
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
    let offset = 0;
    const limit = 100;
    let total = 100;
    while (total !== 0) {
      const charges = await Charges.findAll({
        nest: true,
        logging: console.log,
        subQuery: false,
        limit,
        offset,
        where: {
          id_status: 1,
          payment_method: 'pix',
          qrcode_url: {
            [Op.ne]: null,
          },
          count_notification: {
            [Op.or]: {
              [Op.lt]: 4,
              [Op.eq]: null,
            },
          },
          created_at: {
            [Op.gte]: '2025-11-29 00:00:00', // serviço estava travado varios dias, coloquei para nao disparar pedidos antigos
          },
        },
        attributes: ['id', 'count_notification', 'qrcode_url', 'pix_code', 'price', 'created_at'],
        include: [
          {
            association: 'sale',
            attributes: ['full_name', 'email'],
            include: [
              {
                association: 'sales_items',
                attributes: ['uuid'],
                where: {
                  type: 1,
                },
                include: [
                  {
                    association: 'product',
                    required: true,
                    paranoid: false,
                    attributes: ['name', 'support_email'],
                  },
                ],
              },
              {
                association: 'user',
                attributes: ['email', 'full_name'],
              },
            ],
          },
        ],
      });
      console.log(charges.length);
      total = charges.length;
      if (total < 100) {
        total = 0;
      }
      offset += 100;
      for (const charge of charges) {
        await SQS.add('pendingPaymentEmail', {
          payment_method: 'pix',
          email: charge.sale.email,
          amount: charge.price,
          qrcode: charge.qrcode_url,
          pix_code: charge.pix_code,
          student_name: charge.sale.full_name,
          support_email: charge.sale.sales_items[0].product.support_email
            ? charge.sale.sales_items[0].product.support_email
            : charge.sale.user.email,
          producer_name: charge.sale.user.full_name,
          product_name: charge.sale.sales_items[0].product.name,
          url: `https://checkout.b4you.com.br/sales/pix/info/${charge.sale.sales_items[0].uuid}`,
        });
        await Charges.update(
          {
            last_notification: date().now(),
            count_notification: (charge.count_notification ?? 1) + 1,
          },
          { where: { id: charge.id } }
        );
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await database.closeConnection();
  }
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
