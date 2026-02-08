import { Op } from 'sequelize';
import { Subscriptions } from './database/models/Subscriptions.mjs';
import { Database } from './database/sequelize.mjs';
import { date } from './utils/date.mjs';
import { StudentNotifySubscription } from './emails/StudentNotifySubscription.mjs';
import { SubscriptionLate } from './emails/SubscriptionLate.mjs';
import { Sales_items } from './database/models/SalesItems.mjs';
import { MailService } from './services/Mail.mjs';

const isSubscriptionBeforeDueDate = (next_charge) =>
  date(next_charge, DATABASE_DATE_WITHOUT_TIME).diff(date(), 'days') >= 0;

const DATABASE_DATE_WITHOUT_TIME = 'YYYY-MM-DD';

export const handler = async () => {
  const {
    MYSQL_DATABASE,
    MYSQL_PORT = 3306,
    MYSQL_USERNAME,
    MAILJET_EMAIL_SENDER,
    MAILJET_PASSWORD,
    MAILJET_TEMPLATE_ID,
    MAILJET_USERNAME,
    MYSQL_HOST,
    MYSQL_PASSWORD,
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
    let total = 100;
    let offset = 0;
    while (total !== 0) {
      const subscriptions = await Subscriptions.findAll({
        nest: true,
        limit: 100,
        offset,
        subQuery: false,
        attributes: ['id', 'id_user', 'attempt_count', 'id_student', 'id_product', 'uuid'],
        logging: true,
        where: {
          active: 1,
          id_status: 1,
          valid_until: null,
          payment_method: {
            [Op.ne]: 'card',
          },
          [Op.or]: [
            {
              [Op.and]: {
                next_charge: date().add(3, 'd').format(DATABASE_DATE_WITHOUT_TIME),
                renew: false,
              },
            },
            {
              [Op.and]: {
                renew: true,
                last_notify: {
                  [Op.ne]: date().format(DATABASE_DATE_WITHOUT_TIME),
                },
              },
            },
          ],
        },
        include: [
          {
            association: 'product',
            attributes: ['id', 'name'],
            paranoid: true,
            required: true,
          },
          {
            association: 'student',
            attributes: ['email', 'full_name', 'whatsapp'],
            required: true,
          },
        ],
      });
      console.log('quantity -> ', subscriptions.length);
      total = subscriptions.length;
      offset += 100;
      if (total < 100) {
        total = 0;
      }

      const mailService = new MailService({
        username: MAILJET_USERNAME,
        password: MAILJET_PASSWORD,
        emailSender: MAILJET_EMAIL_SENDER,
        templateID: MAILJET_TEMPLATE_ID,
      });

      for await (const subscription of subscriptions) {
        console.log('doing now -> ', subscription.uuid);
        const url = `https://checkout.b4you.com.br?subscription_id=${subscription.uuid}`;
        if (isSubscriptionBeforeDueDate(subscriptions.next_charge)) {
          await new StudentNotifySubscription(mailService).send({
            due_date: subscription.next_charge,
            email: subscription.student.email,
            full_name: subscription.student.full_name,
            product_name: subscription.product.name,
            url,
          });
        } else {
          await new SubscriptionLate(mailService).send({
            email: subscription.student.email,
            full_name: subscription.student.full_name,
            product_name: subscription.product.name,
            url,
          });
          const saleItem = await Sales_items.findOne({
            raw: true,
            attributes: ['id'],
            where: {
              id_subscription: subscription.id,
            },
            order: [['id', 'desc']],
          });

          await Queue.add('webhookEvent', {
            id_product: subscription.product.id,
            id_sale_item: saleItem.id,
            id_user: subscription.id_user,
            id_event: 9, //late-subscription
          });

          await Queue.add('integrations', {
            id_product: subscription.id_product,
            eventName: 'lateSubscription',
            data: {
              email: subscription.student.email,
              full_name: subscription.student.full_name,
              phone: subscription.student.whatsapp,
            },
          });
        }
        await Subscriptions.update(
          {
            renew: true,
            last_notify: date().format(DATABASE_DATE_WITHOUT_TIME),
          },
          {
            where: {
              id: subscription.id,
            },
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
    await database.closeConnection();
    throw error;
  } finally {
    await database.closeConnection();
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};
