const aws = require("aws-sdk");

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_DEFAULT_REGION,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

module.exports = new aws.S3({
  params: {
    Bucket: process.env.BUCKET_NAME,
  },
});
