import { SQSClient } from '@aws-sdk/client-sqs';
console.log('new image');

export const SQS = new SQSClient({
  region: 'sa-east-1',
});
