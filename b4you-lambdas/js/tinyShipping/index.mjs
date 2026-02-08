import { Database } from './database/sequelize.mjs';
import { TinyShipping } from './useCases/TinyShipping.mjs';

export const handler = async (event) => {
  console.log('Tiny Shipping ->', event);

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
    const { sale_id, is_subscription = false, id_sale_item = [] } = JSON.parse(message.body);
    console.log('Sale_id ->', sale_id);
    const response = await new TinyShipping(sale_id, is_subscription, id_sale_item).execute();
    console.log(response);
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
