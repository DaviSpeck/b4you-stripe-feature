import { Database } from './database/sequelize.mjs';
import { GeneratedNotifications } from './useCases/GeneratedNotifications.mjs';
import { sendNotification } from './useCases/SendNotification.mjs';

export const handler = async (event) => {
  console.log(event);

  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
    ONESIGNAL_SOUND,
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
    const { Records } = event;
    const [message] = Records;
    const { sale_item_id } = JSON.parse(message.body);
    const response = await new GeneratedNotifications(sendNotification).execute({
      sale_item_id,
      sound: ONESIGNAL_SOUND,
    });
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
