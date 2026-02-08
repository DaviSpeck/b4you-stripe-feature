import { StudentEmailApprovedPayment } from './useCases/StudentApprovedPaymentEmails.mjs';
import { Database } from './database/Database.mjs';
import { MailService } from './services/MailService.mjs';

export const handler = async (event) => {
  console.log(event);
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MAILJET_PASSWORD,
    MAILJET_USERNAME,
    MAILJET_EMAIL_SENDER,
    MAILJET_TEMPLATE_ID,
  } = process.env;
  const database = new Database();

  await database.connect({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    user: MYSQL_USERNAME,
  });

  const mailInstance = new MailService({
    username: MAILJET_USERNAME,
    password: MAILJET_PASSWORD,
    emailSender: MAILJET_EMAIL_SENDER,
    templateID: MAILJET_TEMPLATE_ID,
  });
  try {
    const { Records } = event;
    const [message] = Records;
    const { product, currentStudent, saleItem, renew = false, charge } = JSON.parse(message.body);
    const data = await new StudentEmailApprovedPayment(
      {
        currentStudent,
        product,
        saleItem,
        renew,
        charge,
      },
      database,
      mailInstance
    ).execute();
    console.log(data);
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

