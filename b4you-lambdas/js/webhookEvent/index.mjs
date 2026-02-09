import { WebhooksEvents } from './useCases/WebhookEvents.mjs';
import { processStripeWebhookEvent } from './useCases/StripeWebhookProcessor.mjs';
import { Stripe_payment_intents } from './database/models/Stripe_payment_intents.mjs';
import { Stripe_webhook_events } from './database/models/Stripe_webhook_events.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';
import { Products } from './database/models/Products.mjs';
import { Database } from './database/sequelize.mjs';

/**
 * Cria a configuração do banco de dados a partir das variáveis de ambiente
 */
export function createDatabaseConfig(env = process.env) {
  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_PORT, MYSQL_USERNAME } = env;

  return {
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
  };
}

/**
 * Extrai os dados da mensagem SQS do evento
 */
export function parseEventMessage(event) {
  const { Records } = event;
  const [message] = Records;
  const body = JSON.parse(message.body);

  if (body?.provider === 'stripe') {
    return {
      type: 'stripe',
      payload: body,
    };
  }

  const {
    id_product,
    id_user,
    id_sale_item = null,
    id_event,
    id_cart = null,
    id_affiliate = null,
  } = body;

  return {
    type: 'webhook',
    payload: {
      id_product,
      id_user,
      id_sale_item,
      id_event,
      id_cart,
      id_affiliate,
    },
  };
}

/**
 * Processa o evento de webhook
 * @param {Object} eventData - Dados extraídos do evento
 * @param {WebhooksEvents} webhooksEvents - Instância do use case
 */
export async function processWebhookEvent(eventData, webhooksEvents) {
  const { id_event, id_cart, id_product, id_sale_item, id_user, id_affiliate } = eventData;

  const data = await webhooksEvents.send({
    event_id: id_event,
    id_cart,
    id_product,
    id_sale_item,
    id_user,
    id_affiliate,
  });

  console.dir(data, { depth: null });
  return data;
}

/**
 * Handler principal da Lambda
 */
export const handler = async (event) => {
  console.log(event);

  const dbConfig = createDatabaseConfig();
  const database = await new Database(dbConfig).connect();

  try {
    const eventData = parseEventMessage(event);
    const webhooksEvents = new WebhooksEvents();

    if (eventData.type === 'stripe') {
      await processStripeWebhookEvent(eventData.payload, {
        StripeWebhookEvents: Stripe_webhook_events,
        StripePaymentIntents: Stripe_payment_intents,
        Sales_items,
        Products,
        webhooksEvents,
      });
    } else {
      await processWebhookEvent(eventData.payload, webhooksEvents);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Webhook event processed successfully' }),
    };
  } catch (error) {
    console.error('Error processing webhook event:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to process webhook event',
      }),
    };
  } finally {
    await database.closeConnection();
  }
};
