import { SQS } from '../config/sqs.mjs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import pLimit from 'p-limit';

const { SQS_PREFIX, ENVIRONMENT } = process.env;
import { v4 } from 'uuid';

const limit = pLimit(5);

const queues = [
  {
    name: 'integrations',
    suffix: 'integrations.fifo',
  },
  {
    name: 'webhookEvent',
    suffix: 'webhookEvent.fifo',
  },
  {
    name: 'zoppy',
    suffix: 'zoppy.fifo',
  },
];

const sendMessageWithRetry = async (params, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const message = await SQS.send(new SendMessageCommand(params));
      console.log(`data sent -> ${message.MessageId}`);
      return message;
    } catch (error) {
      if (
        error.Code === 'RequestThrottled' ||
        error.__type === 'com.amazonaws.sqs#RequestThrottled'
      ) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
        console.log(
          `SQS throttled, attempt ${attempt}/${maxRetries}, waiting ${backoffDelay}ms...`
        );

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          continue;
        }
      }

      throw error;
    }
  }
};

export default {
  queues,
  add: async (name, data) => {
    console.log('queue', name, data);
    const selectedQueue = queues.find((q) => q.name === name);

    // Use p-limit to control concurrent requests
    return limit(async () => {
      const params = {
        MessageBody: JSON.stringify(data),
        QueueUrl: `${SQS_PREFIX}/b4you-${ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox'}-${
          selectedQueue.suffix
        }`,
        MessageGroupId: selectedQueue.name,
        MessageDeduplicationId: v4(),
      };

      return await sendMessageWithRetry(params);
    });
  },
};
