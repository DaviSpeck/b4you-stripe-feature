const SQS = require('../config/sqs');
const HttpClient = require('../services/HTTPClient');
const logger = require('../utils/logger');
const uuid = require('../utils/helpers/uuid');

const queues = [
  {
    name: 'blingRefund',
    suffix: 'blingRefund.fifo',
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
      QueueUrl: `${process.env.SQS_PREFIX}/b4you-production-${selectedQueue.suffix}`,
      MessageGroupId: selectedQueue.name,
    };

    if (selectedQueue.deduplication) {
      params.MessageDeduplicationId = uuid.v4();
    }

    await new Promise((resolve, reject) => {
      SQS.sendMessage(params, (error, body) => {
        if (error) {
          logger.error(error);
          return reject(error);
        }
        logger.info(`data sent -> ${body.MessageId}`);
        return resolve();
      });

      resolve();
    });
  },
};
