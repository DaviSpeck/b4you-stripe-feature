import { Database } from './database/sequelize.mjs';
import { CreateSeller } from './useCases/CreateSeller.mjs';

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
    const { id_user, is_company = false, data } = JSON.parse(message.body);

    if (id_user) {
      await new CreateSeller(database).create({ id_user, is_company, data });
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

// handler({
//   Records: [
//     {
//       body: JSON.stringify({
//         id_user: 4,
//         is_company: true,
//       }),
//     },
//   ],
// });
