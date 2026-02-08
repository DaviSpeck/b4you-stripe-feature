const aws = require('aws-sdk');

aws.config.update({
  accessKeyId: process.env.SQS_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION || 'sa-east-1',
  secretAccessKey: process.env.SQS_SECRET_ACCESS_KEY,
});

module.exports = new aws.SQS({ apiVersion: '2012-11-05' });
