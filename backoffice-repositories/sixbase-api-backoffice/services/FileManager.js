const s3Config = require('../config/s3');

class FileManager {
  #service;

  #bucket;

  constructor(bucket) {
    this.#service = s3Config;
    this.#bucket = bucket;
  }

  async uploadFile(fileStream, Key, ACL) {
    const params = { ACL, Body: fileStream, Key, Bucket: this.#bucket };
    const response = await this.#service.upload(params).promise();
    const { Location } = response;
    return Location;
  }

  async deleteFile(Key) {
    const params = {
      Bucket: this.#bucket,
      Key,
    };
    await this.#service.headObject(params).promise();
    await this.#service.deleteObject(params).promise();
  }

  async getFile(Key) {
    const params = {
      Bucket: this.#bucket,
      Key,
    };
    const file = await this.#service.getObject(params).promise();
    return file;
  }
}

module.exports = FileManager;
module.exports.ACLS = {
  PUBLICREAD: 'public-read',
  PRIVATE: 'private',
};
