import { SendMessageCommand } from '@aws-sdk/client-sqs';
const { SQS_PREFIX, ENVIRONMENT } = process.env;
import { v4 } from 'uuid';
import { SQS } from '../config/sqs.mjs';

const queues = [
  {
    name: 'usersRevenue',
    suffix: 'usersRevenue.fifo',
  },
  {
    name: 'sales-metrics-hourly',
    suffix: 'sales-metrics-hourly.fifo',
  },
];

export default {
  queues,
  add: async (name, data) => {
    console.log('queue', name, data);
    const selectedQueue = queues.find((q) => q.name === name);
    const params = {
      MessageBody: JSON.stringify(data),
      QueueUrl: `${SQS_PREFIX}/b4you-${ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox'}-${
        selectedQueue.suffix
      }`,
      MessageGroupId: selectedQueue.name,
      MessageDeduplicationId: v4(),
    };

    const message = await SQS.send(new SendMessageCommand(params));
    console.log(`data sent -> ${message.MessageId}`);
  },
};
