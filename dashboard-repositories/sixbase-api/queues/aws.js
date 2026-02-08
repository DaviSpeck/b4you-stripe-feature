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
    name: 'affiliateUserInvite',
    suffix: 'affiliateUserInvite.fifo',
  },
  {
    name: 'generateNotifications',
    suffix: 'generateNotifications.fifo',
    deduplication: true,
  },
  {
    name: 'collaboratorsActivity',
    suffix: 'collaboratorsActivity.fifo',
  },
  {
    name: 'requestWithdrawal',
    suffix: 'requestWithdrawal.fifo',
  },
  {
    name: 'splitCommissions',
    suffix: 'splitCommissions.fifo',
  },
  {
    name: 'exportSalesShipping',
    suffix: 'exportSalesShipping.fifo',
  },
  {
    name: 'exportAffiliates',
    suffix: 'exportAffiliates.fifo',
    deduplication: true,
  },
  {
    name: 'importSalesShipping',
    suffix: 'importSalesShipping.fifo',
  },
  {
    name: 'invision',
    suffix: 'invision.fifo',
  },
  {
    name: 'usersRevenue',
    suffix: 'usersRevenue.fifo',
    deduplication: true,
  },
  {
    name: 'callbacksCard',
    suffix: 'callbacksCard.fifo',
    deduplication: true,
  },
  {
    name: 'sales-metrics-hourly',
    suffix: 'sales-metrics-hourly.fifo',
    deduplication: true,
  },
  {
    name: 'create-seller-pagarme',
    suffix: 'create-seller-pagarme.fifo',
    deduplication: true,
  },
  {
    name: 'groupSales',
    suffix: 'groupSales.fifo',
    deduplication: true,
  },
  {
    name: 'pagarmePaidCharge',
    suffix: 'pagarmePaidCharge.fifo',
    deduplication: true,
  },
  {
    name: 'tinyShipping',
    suffix: 'tinyShipping.fifo',
  },
  {
    name: 'blingRefund',
    suffix: 'blingRefund.fifo',
  },
  {
    name: 'exportAffiliateRanking',
    suffix: 'exportAffiliateRanking.fifo',
  },
  {
    name: 'exportPendingAffiliate',
    suffix: 'exportPendingAffiliate.fifo',
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
    name: 'paidPayment',
    suffix: 'paidPayment.fifo',
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
    const selectedQueue = queues.find((q) => q.name === name);
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
      if (!process.env.URL_LAMBDA_DEV) {
        SQS.sendMessage(params, (error, body) => {
          if (error) {
            logger.error(error);
            return reject(error);
          }
          logger.info(`data sent -> ${body.MessageId}`);
          return resolve();
        });
      } else {
        const httpInstance = new HttpClient({
          baseURL: process.env.URL_LAMBDA_DEV,
        });

        resolve(httpInstance.post(`/${selectedQueue.name}`, { ...data }));
      }
      resolve();
    });
  },
};
