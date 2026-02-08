export class FileManager {
  #service;

  #bucket;

  constructor(service, bucket) {
    this.#service = service;
    this.#bucket = bucket;
  }

  async uploadFile(fileStream, Key) {
    const params = { ACL: 'public-read', Body: fileStream, Key, Bucket: this.#bucket };
    const response = await this.#service.upload(params);
    const { Location } = response;
    return Location;
  }
}
