import { Sales } from './database/models/Sales.mjs';
import { Database } from './database/sequelize.mjs';
import { BlingShippingV3 } from './useCases/BlingShippingV3.mjs';
import { findSalesStatusByKey } from './status/salesStatus.mjs';
import { Op } from 'sequelize';
import { date as dateHelper } from './utils/date.mjs';
const PHYSICAL_TYPE = 4;

export const handler = async () => {
  console.log('Bling Shipping Attracione START');
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
    const id_user = 158777;
    const sales = await Sales.findAll({
      where: {
        id_user,
        'id_order_bling': null,
        '$sales_items.id_status$': findSalesStatusByKey('paid').id,
        'created_at': {
          [Op.lte]: dateHelper().subtract(24, 'h'),
        },
      },
      include: [
        {
          association: 'sales_items',
          attributes: [
            'price_product',
            'shipping_price',
            'quantity',
            'discount_amount',
            'discount_percentage',
            'integration_shipping_company',
            'type',
          ],
          include: [
            {
              association: 'product',
              where: {
                id_type: PHYSICAL_TYPE,
              },
            },
            {
              association: 'offer',
              attributes: ['uuid', 'id', 'name', 'metadata'],
            },
          ],
        },
        {
          association: 'student',
          attributes: ['full_name', 'document_number', 'email', 'whatsapp'],
        },
      ],
    });
    console.log(sales.length);
    for await (const sale of sales) {
      try {
        await new BlingShippingV3().execute(sale);
      } catch (error) {
        console.log('error on sale->', sale.id);
        console.log(`error->`, error);
      }
    }
  } catch (error) {
    throw error;
  } finally {
    await database.closeConnection();
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  console.log('Bling Shipping Attracione END');

  return response;
};
handler();
