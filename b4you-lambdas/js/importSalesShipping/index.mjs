import { Database } from './database/sequelize.mjs';
import { UpdateTracking } from './useCases/UpdateTracking.mjs';
import { MailService } from './services/MailService.mjs';

export const handler = async (event) => {
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
    MAILJET_EMAIL_SENDER,
    MAILJET_TEMPLATE_ID,
    MAILJET_PASSWORD,
    MAILJET_USERNAME,
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
    const { rows } = JSON.parse(message.body);
    await new UpdateTracking({
      MailService: new MailService({
        userName: MAILJET_USERNAME,
        password: MAILJET_PASSWORD,
        emailSender: MAILJET_EMAIL_SENDER,
        templateID: MAILJET_TEMPLATE_ID,
      }),
    }).execute(rows);
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
