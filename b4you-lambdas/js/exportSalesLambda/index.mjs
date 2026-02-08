import { BatchClient, SubmitJobCommand } from '@aws-sdk/client-batch';

export const handler = async (event) => {
  console.log(event);
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    ACCESS_KEY,
    SECRET_ACCESS_KEY,
    MAILJET_EMAIL_SENDER,
    MAILJET_PASSWORD,
    MAILJET_TEMPLATE_ID,
    MAILJET_USERNAME,
  } = process.env;
  const { Records } = event;
  const [message] = Records;
  const { query, email, first_name } = JSON.parse(message.body);
  try {
    const jobParams = {
      jobName: 'exportSales',
      jobQueue: 'exportSales',
      jobDefinition: 'arn:aws:batch:sa-east-1:493067706051:job-definition/exportSales:3',
      containerOverrides: {
        command: ['node', 'index.mjs', JSON.stringify(query), email, first_name],
        resourceRequirements: [
          {
            type: 'VCPU',
            value: '1',
          },
          {
            type: 'MEMORY',
            value: '2048',
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
            name: 'ACCESS_KEY',
            value: ACCESS_KEY,
          },
          {
            name: 'SECRET_ACCESS_KEY',
            value: SECRET_ACCESS_KEY,
          },
          {
            name: 'MAILJET_EMAIL_SENDER',
            value: MAILJET_EMAIL_SENDER,
          },
          {
            name: 'MAILJET_USERNAME',
            value: MAILJET_USERNAME,
          },
          {
            name: 'MAILJET_PASSWORD',
            value: MAILJET_PASSWORD,
          },
          {
            name: 'MAILJET_TEMPLATE_ID',
            value: MAILJET_TEMPLATE_ID,
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
