import { start as startRedis, stop as stopRedis } from './config/redis.mjs';
import { Database } from './database/sequelize.mjs';
import { NotazzService } from './services/NotazzService.mjs';
import { WebhookService } from './services/WebhookService.mjs';
import { RedisUtils } from './utils/redisUtils.mjs';

const WEBHOOK = 'webhook';
const NOTAZZ = 'notazz';

export const handler = async (event) => {
  console.log('WebhookNotazzBalancer Lambda started');
  console.log('Event:', JSON.stringify(event, null, 2));

  const { Records } = event;

  if (!Records || Records.length === 0) {
    console.log('No records to process');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'No records to process' }),
    };
  }

  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME } = process.env;

  let redisUtils;
  let webhookService;
  let notazzService;
  let database;

  try {
    await startRedis();
    redisUtils = new RedisUtils();
    webhookService = new WebhookService();
    notazzService = new NotazzService();

    database = await new Database({
      database: MYSQL_DATABASE,
      host: MYSQL_HOST,
      password: MYSQL_PASSWORD,
      username: MYSQL_USERNAME,
      port: 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        decimalNumbers: true,
      },
    }).connect();

    const [record] = Records;

    try {
      console.log(`Processing record: ${record.messageId}`);

      const messageData = JSON.parse(record.body);
      console.log('Message data:', JSON.stringify(messageData, null, 2));

      const { id_product, id_sale_item, id_cart, id_user, id_event, id_sale } = messageData;

      const keyToCheck = `product_${id_user}_action`;

      console.log(`Checking Redis key: ${keyToCheck}`);

      const service = await redisUtils.getValue(keyToCheck);
      console.log('redis key -> ', service);

      let result;
      let action;

      if (service !== WEBHOOK) {
        console.log('Sending webhook...');
        action = WEBHOOK;
        result = await webhookService.sendWebhook({
          id_product,
          id_sale_item,
          id_cart,
          id_user,
          id_event,
        });

        const redisSetSuccess = await redisUtils.setValue(keyToCheck, WEBHOOK);
        if (!redisSetSuccess) {
          console.error(`Failed to set Redis key: ${keyToCheck}`);
        }
      } else {
        console.log('Generating Notazz nota...');
        action = NOTAZZ;
        result = await notazzService.generateNota({
          id_product,
          id_sale_item,
          id_cart,
          id_user,
          id_event,
          id_sale,
        });

        const redisSetSuccess = await redisUtils.setValue(keyToCheck, NOTAZZ);
        if (!redisSetSuccess) {
          console.error(`Failed to set Redis key: ${keyToCheck}`);
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Processing completed',
          messageId: record.messageId,
          action: action,
          success: true,
        }),
      };
    } catch (error) {
      console.error(`Error processing record ${record.messageId}:`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error processing record',
          messageId: record.messageId,
          success: false,
          error: error.message,
        }),
      };
    }
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
      }),
    };
  } finally {
    try {
      await stopRedis();
      if (database) {
        await database.closeConnection();
      }
    } catch (error) {
      console.error('Error closing connections:', error);
    }
  }
};
