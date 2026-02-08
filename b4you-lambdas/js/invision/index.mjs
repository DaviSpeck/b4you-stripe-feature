import { Database } from './database/sequelize.mjs';
import { InvisionIntegration } from './useCases/invision.mjs';

export const handler = async event => {
  console.log('Invision ->', event);
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

    const { sale_id } = JSON.parse(message.body);
    console.log('Sale_id ->', sale_id);
    const response = await new InvisionIntegration(sale_id).execute();
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
