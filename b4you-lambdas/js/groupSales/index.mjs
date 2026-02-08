import { Op } from 'sequelize';
import { Sales_items } from './database/models/SalesItems.mjs';
import { SalesMetricsDaily } from './database/models/SalesMetricsDaily.mjs';
import { Database } from './database/sequelize.mjs';
import moment from 'moment';
const response = {
  statusCode: 200,
  body: JSON.stringify('Hello from Lambda!'),
};

export const handler = async (event) => {
  console.log(event);
  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME } = process.env;
  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();

  try {
    const { Records } = event;
    const [message] = Records;
    const { id_student, id_product, id_sale_item } = JSON.parse(message.body);
    const salesItems = await Sales_items.findAll({
      raw: true,
      attributes: ['id', 'created_at'],
      where: {
        id_student,
        id_product,
        id_status: 3,
        id: { [Op.ne]: +id_sale_item },
        payment_method: 'card',
      },
    });

    for await (const si of salesItems) {
      const transaction = await database.sequelize.transaction();
      try {
        await Sales_items.update(
          { id_parent: +id_sale_item, list: false },
          { where: { id: si.id }, transaction }
        );
        const [commissions] = await database.sequelize.query(
          'select * from commissions where id_sale_item = :id',
          {
            replacements: {
              id: si.id,
            },
          }
        );
        console.log(commissions);
        for await (const commission of commissions) {
          await Promise.all([
            SalesMetricsDaily.decrement('denied_count', {
              by: 1,
              where: {
                id_user: commission.id_user,
                time: moment(si.created_at)
                  .subtract(3, 'h')
                  .startOf('day')
                  .add(3, 'h')
                  .toISOString(),
              },
              transaction,
            }),
            SalesMetricsDaily.decrement('denied_total', {
              by: commission.amount,
              where: {
                id_user: commission.id_user,
                time: moment(si.created_at)
                  .subtract(3, 'h')
                  .startOf('day')
                  .add(3, 'h')
                  .toISOString(),
              },
              transaction,
            }),
          ]);
        }

        await transaction.commit();
      } catch (error) {
        console.log(error);
        await transaction.rollback();
      }
    }
    return response;
  } catch (error) {
    console.log(error);
    await database.closeConnection();
    throw error;
  }
};
