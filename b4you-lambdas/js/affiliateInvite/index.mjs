import { InviteUsers } from './useCases/InviteUsers.mjs';
import { Database } from './database/sequelize.mjs';
import { MailService } from './services/MailService.mjs';

export const handler = async (event) => {
  console.log(event);

  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
    MAILJET_PASSWORD,
    MAILJET_USERNAME,
    MAILJET_EMAIL_SENDER,
    MAILJET_TEMPLATE_ID,
    URL_SIXBASE_DASHBOARD,
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
    const { email, producer_name, product_name, id_product } = JSON.parse(message.body);
    const mailServiceInstance = new MailService({
      username: MAILJET_USERNAME,
      password: MAILJET_PASSWORD,
      emailSender: MAILJET_EMAIL_SENDER,
      templateID: MAILJET_TEMPLATE_ID,
    });
    await new InviteUsers(mailServiceInstance).execute({
      email: (email || "").trim(),
      producer_name,
      product_name,
      id_product,
      url_dashboard: URL_SIXBASE_DASHBOARD,
    });
    console.log('Finalizado execução com sucesso');
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
