import aws from 'aws-sdk';

const AWS_DEFAULT_REGION = process.env.AWS_REGION || "sa-east-1";

aws.config.update({
  region: AWS_DEFAULT_REGION,
});

export default aws;
