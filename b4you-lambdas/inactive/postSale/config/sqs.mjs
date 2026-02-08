import { SQSClient } from '@aws-sdk/client-sqs';

export const ClientSQS = new SQSClient({ region: 'sa-east-1' });
