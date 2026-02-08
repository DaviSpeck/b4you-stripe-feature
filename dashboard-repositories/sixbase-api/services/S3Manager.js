const lodash = require('lodash');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { generateRandomCode } = require('../utils/generators');
const { v4 } = require('../utils/helpers/uuid');

module.exports = class S3Manager {
  #bucket;

  #accessKeyId;

  #secretAccessKey;

  #region;

  constructor(bucket) {
    const { AWS_ACCESS_KEY_ID, AWS_DEFAULT_REGION, AWS_SECRET_ACCESS_KEY } =
      process.env;
    this.#bucket = bucket;
    this.#accessKeyId = AWS_ACCESS_KEY_ID;
    this.#region = AWS_DEFAULT_REGION;
    this.#secretAccessKey = AWS_SECRET_ACCESS_KEY;
  }

  async getSignedUrl(filename) {
    const file_extension = lodash.last(filename.split('.'));
    const Key = `${v4()}-${generateRandomCode(4)}.${file_extension}`;
    const credentials = {
      accessKeyId: this.#accessKeyId,
      secretAccessKey: this.#secretAccessKey,
    };

    const client = new S3Client({ credentials, region: this.#region });
    const command = new PutObjectCommand({
      Bucket: this.#bucket,
      Key,
      ContentType: file_extension,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return { url, key: Key };
  }
};
