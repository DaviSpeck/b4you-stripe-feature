import { SQSClient } from '@aws-sdk/client-sqs';

export const SQS = new SQSClient({ region: 'sa-east-1' });
