import { Database } from './database/sequelize.mjs';
import { SplitCommission } from './useCases/SplitCommission.mjs';
import { BalancesRepository } from './database/repositories/BalancesRepository.mjs';
import { SalesItemsRepository } from './database/repositories/SalesItemsRepository.mjs';
import SQS from './queues/aws.mjs';

export const handler = async (event) => {
  console.log(event);

  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT } = process.env;

  let database;

  let dbTransaction;
  try {
    database = await new Database({
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
    const { Records } = event;
    for await (const message of Records) {
      const { sale_item_id, first_charge = true, shipping_type = 0 } = JSON.parse(message.body);

      dbTransaction = await database.sequelize.transaction();
      await new SplitCommission(
        BalancesRepository,
        SalesItemsRepository,
        dbTransaction,
        database
      ).execute({
        sale_item_id,
        first_charge,
        shipping_type,
      });
      await dbTransaction.commit();

      await SQS.add('generateNotifications', {
        sale_item_id,
      });
    }
  } catch (error) {
    console.log(error);
    await dbTransaction.rollback();
    await database.closeConnection();
    throw error;
  } finally {
    await database.closeConnection();
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
