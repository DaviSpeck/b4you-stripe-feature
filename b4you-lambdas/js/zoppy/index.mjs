import { Database } from './database/sequelize.mjs';
import { ZoppyShipping } from './useCases/ZoppyShipping.mjs';

export const handler = async (event) => {
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
    console.log('EVENT', event)
    const { Records } = event;
    const [message] = Records;
    const { sale_id, event_name, cart, id_user } = JSON.parse(message.body);

    const response = await new ZoppyShipping(sale_id, event_name, cart, id_user).execute();
    console.log(response);
  } catch (error) {
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
