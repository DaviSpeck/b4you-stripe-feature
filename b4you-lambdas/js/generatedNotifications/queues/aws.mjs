import { SQS } from '../config/sqs.mjs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { v4 } from 'uuid';

const queues = [
  {
    name: 'notification-service',
    suffix: 'notification-service.fifo',
  },
];

export default {
  queues,
  add: async (name, data) => {
    console.log('queue', name, data);

    const { SQS_PREFIX } = process.env;
    const selectedQueue = queues.find((q) => q.name === name);
    const params = {
      MessageBody: JSON.stringify(data),
      QueueUrl: `${SQS_PREFIX}/b4you-production-${selectedQueue.suffix}`,
      MessageGroupId: selectedQueue.name,
      MessageDeduplicationId: v4(),
    };

    const message = await SQS.send(new SendMessageCommand(params));
    console.log(`data sent -> ${message.MessageId}`);
  },
};
