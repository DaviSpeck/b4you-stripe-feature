const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

module.exports = class S3Manager {
  #bucket;

  #accessKeyId;

  #secretAccessKey;

  #region;

  constructor(bucket = 'arquivos-mango5') {
    const { AWS_ACCESS_KEY_ID, AWS_DEFAULT_REGION, AWS_SECRET_ACCESS_KEY } =
      process.env;
    this.#bucket = bucket;
    this.#accessKeyId = AWS_ACCESS_KEY_ID;
    this.#region = AWS_DEFAULT_REGION;
    this.#secretAccessKey = AWS_SECRET_ACCESS_KEY;
  }

  async uploadFile(key, blob) {
    const Key = key;
    const credentials = {
      accessKeyId: this.#accessKeyId,
      secretAccessKey: this.#secretAccessKey,
    };

    const client = new S3Client({ credentials, region: this.#region });
    const command = new PutObjectCommand({
      Bucket: this.#bucket,
      Key,
      Body: blob,
      ACL: 'public-read',
    });
    await client.send(command);
    return {
      url: `https://${this.#bucket}.s3.${this.#region}.amazonaws.com/${key}`,
      key,
    };
  }
};
