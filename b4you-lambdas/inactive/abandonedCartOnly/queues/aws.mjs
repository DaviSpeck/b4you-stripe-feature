import { SQS } from '../config/sqs.mjs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
const { SQS_PREFIX, ENVIRONMENT } = process.env;
import { v4 } from 'uuid';

const queues = [
  {
    name: 'integrations',
    suffix: 'integrations.fifo',
  },
  {
    name: 'webhookEvent',
    suffix: 'webhookEvent.fifo',
  },
];

export default {
  queues,
  add: async (name, data) => {
    console.log('queue', name, data);
    const selectedQueue = queues.find((q) => q.name === name);
    const params = {
      MessageBody: JSON.stringify(data),
      QueueUrl: `${SQS_PREFIX}/b4you-${ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox'}-${selectedQueue.suffix
        }`,
      MessageGroupId: selectedQueue.name,
      MessageDeduplicationId: v4(),
    };

    const message = await SQS.send(new SendMessageCommand(params));
    console.log(`data sent -> ${message.MessageId}`);
  },
};
