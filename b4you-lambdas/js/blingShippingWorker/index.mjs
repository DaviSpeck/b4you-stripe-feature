import moment from 'moment';
import { Op, col } from 'sequelize';
import { Sales } from './database/models/Sales.mjs';
import { Database } from './database/sequelize.mjs';
import Queue from './queues/aws.mjs';
import { findSalesStatusByKey } from './status/salesStatus.mjs';
import { findIntegrationTypeByKey } from './types/integrationTypes.mjs';
const PHYSICAL_TYPE = 4;

export const handler = async (event) => {
  console.log('Bling Shipping ->', event);
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
  } = process.env;

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
    const timezone = 'America/Sao_Paulo';
    const startDate = moment()
      .subtract(1, 'day')
      .set({ hour: 21, minute: 0, second: 0 })
      .toDate();
    const endDate = moment()
      .tz(timezone)
      .set({ hour: 9, minute: 0, second: 0, millisecond: 0 })
      .toDate();

    console.log('Start:', startDate);
    console.log('End:', endDate);


    const sales = await Sales.findAll({
      subQuery: false,
      attributes: ['id'],
      distinct: true,
      limit: 130,
      logging: true,
      order: [['id', 'desc']],
      where: {
        id_order_bling: null,
        id_user: {
          [Op.ne]: 158777,
        },
      },
      include: [
        {
          association: 'sales_items',
          required: true,
          where: {
            id_status: findSalesStatusByKey('paid').id,
            paid_at: {
              [Op.between]: [startDate, endDate],
            },
          },
          attributes: ['id', 'paid_at'],
          include: [
            {
              paranoid: false,
              association: 'product',
              where: {
                id_type: PHYSICAL_TYPE,
                payment_type: {
                  [Op.ne]: 'subscription',
                },
              },
            },
          ],
        },
        {
          association: 'user',
          required: true,
          include: [
            {
              association: 'plugins',
              required: true,
              where: {
                active: true,
                id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
                created_at: { [Op.lt]: col('sales_items.paid_at') },
              },
            },
          ],
        },
      ],
    });

    for (const sale of sales) {
      await Queue.add('blingShipping', { sale_id: sale.id });
      console.log(`Processed sale_id: ${sale.id}`);
    }
    console.log("length", sales.length)

    return;
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
