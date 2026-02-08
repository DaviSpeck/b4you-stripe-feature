import { ExportXLS } from './useCases/ExportXls.mjs';
import { Database } from './database/sequelize.mjs';
import { date } from './utils/date.mjs';
import { attachmentMessage } from './email/messages.mjs';
import { capitalizeName } from './utils/formatters.mjs';
import { MailService } from './services/MailService.mjs';
import * as nanoid from 'nanoid';
nanoid.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-');

export const handler = async (event) => {
  console.log(event);

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
    const { query, email, first_name } = JSON.parse(message.body);
    const dateFormat = 'DD-MM-YYYY';
    const file = await new ExportXLS(query).execute();
    let filename;
    if (query.startDate) {
      filename = `vendas_${date(query.startDate).format(dateFormat)}_${date(query.endDate).format(
        dateFormat
      )}.xlsx`;
    } else {
      filename = `vendas_${query.id_user}.xlsx`;
    }
    const name = capitalizeName(first_name);
    const emailTemplate = attachmentMessage(name);
    await new MailService({
      userName: MAILJET_USERNAME,
      password: MAILJET_PASSWORD,
      emailSender: MAILJET_EMAIL_SENDER,
      templateID: MAILJET_TEMPLATE_ID,
    }).sendMail({
      subject: 'Sua planilha de vendas para rastreio está pronta',
      toAddress: [
        {
          Email: email,
          Name: name,
        },
      ],
      variables: emailTemplate,
      Attachments: [
        {
          ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          Filename: filename,
          Base64Content: Buffer.from(await file['xlsx'].writeBuffer()).toString('base64'),
        },
      ],
    });
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
