import { NotazzInvoices } from './usecases/NotazzInvoice.mjs';
import { Database } from './database/sequelize.mjs';


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
    await NotazzInvoices();
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

