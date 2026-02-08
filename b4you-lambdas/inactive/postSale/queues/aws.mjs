import { ClientSQS } from '../config/sqs.mjs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
const { SQS_PREFIX, ENVIRONMENT } = process.env;
import { v4 } from 'uuid';

const queues = [
  {
    name: 'webhookEvent',
    suffix: 'webhookEvent.fifo',
  },
  {
    name: 'studentApprovedPaymentEmails',
    suffix: 'studentApprovedPaymentEmails.fifo',
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
    name: 'generateNotifications',
    suffix: 'generateNotifications.fifo',
  },
  {
    name: 'usersRevenue',
    suffix: 'usersRevenue.fifo',
  },
  {
    name: 'referralCommission',
    suffix: 'referralCommission.fifo',
  },
  {
    name: 'sales-metrics-hourly',
    suffix: 'sales-metrics-hourly.fifo',
  },
];

export const SQS = {
  queues,
  add: async (name, data) => {
    console.log('queue', name, data);
    const selectedQueue = queues.find((q) => q.name === name);
    const params = {
      MessageBody: JSON.stringify(data),
      QueueUrl: `${SQS_PREFIX}/b4you-${ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox'}-${
        selectedQueue.suffix
      }`,
    };

    if (selectedQueue.suffix.includes('fifo')) {
      params.MessageGroupId = selectedQueue.name;
      params.MessageDeduplicationId = v4();
    }

    const message = await ClientSQS.send(new SendMessageCommand(params));
    console.log(`data sent -> ${message.MessageId}`);
  },
};
