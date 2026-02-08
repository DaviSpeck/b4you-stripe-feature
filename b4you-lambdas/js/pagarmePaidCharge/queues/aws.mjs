import { SQS } from '../config/sqs.mjs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
const { SQS_PREFIX, ENVIRONMENT } = process.env;
import { v4 } from 'uuid';

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
