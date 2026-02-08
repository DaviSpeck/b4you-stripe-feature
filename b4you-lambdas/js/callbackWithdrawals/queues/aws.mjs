import { SQS } from '../config/sqs.mjs';
import { HttpClient } from '../services/HTTPClient.mjs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
const { SQS_PREFIX, ENVIRONMENT, URL_LAMBDA_DEV } = process.env;

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
];

export default {
  queues,
  add: async (name, data) => {
    console.log('queue', name, data);
    const selectedQueue = queues.find((q) => q.name === name);
    const params = {
      MessageBody: JSON.stringify(data),
      QueueUrl: `${SQS_PREFIX}/b4you-${
        ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox'
      }-${selectedQueue.suffix}`,
      MessageGroupId: selectedQueue.name,
    };

    // if (ENVIRONMENT === 'PRODUCTION') {
    const message = await SQS.send(new SendMessageCommand(params));
    console.log(`data sent -> ${message.MessageId}`);
    // } else {
    // const httpInstance = new HttpClient({
    //   baseURL: URL_LAMBDA_DEV,
    // });
    // const responseHTTP = await httpInstance.post(`/${selectedQueue.name}`, {
    //   ...data,
    // });
    // console.log(responseHTTP);
    // }
  },
};
