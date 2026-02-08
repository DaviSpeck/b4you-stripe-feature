const SQS = require('../config/sqs');
const HttpClient = require('../services/HTTPClient');
const logger = require('../utils/logger');
const uuid = require('../utils/helpers/uuid');

const queues = [
  {
    name: 'approvedPaymentNotifications',
    suffix: 'approvedPaymentNotifications.fifo',
  },
  {
    name: 'confirmSplits',
    suffix: 'confirmSplits.fifo',
  },
  {
    name: 'studentApprovedPaymentEmails',
    suffix: 'studentApprovedPaymentEmails.fifo',
  },
  {
    name: 'webhookEvent',
    suffix: 'webhookEvent.fifo',
  },
  {
    name: 'integrations',
    suffix: 'integrations.fifo',
  },
  {
    name: 'blingShipping',
    suffix: 'blingShipping.fifo',
  },
  {
    name: 'exportSales',
    suffix: 'exportSales.fifo',
  },
  {
    name: 'generateNotifications',
    suffix: 'generateNotifications.fifo',
    deduplication: true,
  },
  {
    name: 'splitCommissions',
    suffix: 'splitCommissions.fifo',
  },
  {
    name: 'invision',
    suffix: 'invision.fifo',
  },
  {
    name: 'pendingPaymentEmail',
    suffix: 'pendingPaymentEmail.fifo',
  },
  {
    name: 'groupSales',
    suffix: 'groupSales.fifo',
    deduplication: true,
  },
  {
    name: 'create-seller-pagarme',
    suffix: 'create-seller-pagarme.fifo',
    deduplication: true,
  },
  {
    name: 'tinyShipping',
    suffix: 'tinyShipping.fifo',
  },
  {
    name: 'webhookNotazzBalancer',
    suffix: 'webhookNotazzBalancer.fifo',
    deduplication: true,
  },
  {
    name: 'zoppy',
    suffix: 'zoppy.fifo',
  },
  {
    name: 'woocommerce',
    suffix: 'woocommerce.fifo',
  },
  {
    name: 'shopify',
    suffix: 'shopify.fifo',
  },
];

module.exports = {
  queues,
  add: async (name, data) => {
    try {
      const selectedQueue = queues.find((q) => q.name === name);
      
      if (!selectedQueue) {
        logger.error(`Queue "${name}" não encontrada na lista de queues disponíveis`);
        return; // Não quebra a execução, apenas loga o erro
      }

      const params = {
        MessageBody: JSON.stringify(data),
        QueueUrl: `${process.env.SQS_PREFIX}/b4you-${
          process.env.ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox'
        }-${selectedQueue.suffix}`,
        MessageGroupId: selectedQueue.name,
      };

      if (selectedQueue.deduplication) {
        params.MessageDeduplicationId = uuid.v4();
      }

      await new Promise((resolve, reject) => {
        if (
          process.env.ENVIRONMENT === 'PRODUCTION' ||
          process.env.ENVIRONMENT === 'SANDBOX'
        ) {
          SQS.sendMessage(params, (error, body) => {
            if (error) {
              logger.error(`Erro ao enviar mensagem para queue "${name}":`, error);
              // Em SANDBOX, apenas loga e resolve (não quebra a execução)
              if (process.env.ENVIRONMENT === 'SANDBOX') {
                return resolve();
              }
              // Em PRODUCTION, rejeita o erro
              return reject(error);
            }
            logger.info(`data sent -> ${body.MessageId}`);
            return resolve();
          });
        } else {
          const httpInstance = new HttpClient({
            baseURL: process.env.URL_LAMBDA_DEV,
          });

          httpInstance.post(`/${selectedQueue.name}`, { ...data })
            .then(() => resolve())
            .catch((error) => {
              logger.error(`Erro ao enviar mensagem para queue "${name}" (dev):`, error);
              resolve(); // Não quebra em dev também
            });
        }
      });
    } catch (error) {
      // Captura qualquer erro não tratado e apenas loga, não quebra a execução
      logger.error(`Erro ao processar queue "${name}":`, error);
    }
  },
};
