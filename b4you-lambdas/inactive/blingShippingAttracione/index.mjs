import { BatchClient, SubmitJobCommand } from '@aws-sdk/client-batch';

export const handler = async (event) => {
  console.log(event);
  const {
    API_BLING_V3,
    BLING_CLIENT_ID,
    BLING_CLIENT_SECRET,
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_USERNAME,
  } = process.env;
  try {
    const jobParams = {
      jobName: 'blingshippingattracione',
      jobQueue: 'blingshippingattracione',
      jobDefinition:
        'arn:aws:batch:sa-east-1:493067706051:job-definition/blingshippingattracione:1',
      containerOverrides: {
        command: ['node', 'function.mjs'],
        resourceRequirements: [
          {
            type: 'VCPU',
            value: '0.5',
          },
          {
            type: 'MEMORY',
            value: '1024',
          },
        ],
        environment: [
          {
            name: 'MYSQL_DATABASE',
            value: MYSQL_DATABASE,
          },
          {
            name: 'MYSQL_HOST',
            value: MYSQL_HOST,
          },
          {
            name: 'MYSQL_PASSWORD',
            value: MYSQL_PASSWORD,
          },
          {
            name: 'MYSQL_USERNAME',
            value: MYSQL_USERNAME,
          },
          {
            name: 'BLING_CLIENT_SECRET',
            value: BLING_CLIENT_SECRET,
          },
          {
            name: 'BLING_CLIENT_ID',
            value: BLING_CLIENT_ID,
          },
          {
            name: 'MYSQL_PORT',
            value: MYSQL_PORT,
          },
          {
            name: 'API_BLING_V3',
            value: API_BLING_V3,
          },
        ],
      },
      retryStrategy: {
        attempts: 3,
      },
    };
    const batchClient = new BatchClient({
      region: 'sa-east-1',
    });

    const data = await batchClient.send(new SubmitJobCommand(jobParams));
    console.log('submitted successfully -> ', data.jobId);
  } catch (error) {
    console.log('error while calling batch job -> ', error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};
