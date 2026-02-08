const HTTPClient = require('./HTTPClient');
const videoSettings = require('../config/videoUpload');

class VideoManeger {
  #service;

  #authorization;

  constructor(service, authorization) {
    this.#service = service;
    this.#authorization = authorization;
  }

  async getURLforTusUpload({ size, title: name, description }) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
      Authorization: this.#authorization,
    };
    const body = {
      name,
      description,
      upload: {
        approach: 'tus',
        size,
      },
      ...videoSettings,
    };
    const response = await this.#service.post('/me/videos', body, { headers });
    const {
      data: {
        upload: { upload_link },
        uri,
        link,
      },
    } = response;
    return { upload_link, uri, link, title: name };
  }

  async deleteVideo(uri) {
    const headers = {
      Authorization: this.#authorization,
    };
    await this.#service.delete(uri, { headers });
  }

  async replaceVideo({ size, title: name, description, uri }) {
    await this.deleteVideo(uri);
    const response = await this.getURLforTusUpload({
      size,
      title: name,
      description,
    });
    return response;
  }

  async getVideoInfo(uri) {
    const headers = {
      Authorization: this.#authorization,
    };

    const { data } = await this.#service.get(
      `${uri}?fields=status,duration,pictures`,
      { headers },
    );
    return data;
  }

  async createFolder(name) {
    const headers = {
      Authorization: this.#authorization,
    };
    const { data } = await this.#service.post(
      '/me/projects',
      { name },
      { headers },
    );
    return data;
  }

  async moveVideoToAFolder(folder_uri, video_id) {
    const headers = {
      Authorization: this.#authorization,
    };
    const response = await this.#service.put(
      `${folder_uri}/${video_id}`,
      {},
      { headers },
    );
    return response;
  }
}

module.exports = new VideoManeger(
  new HTTPClient({ baseURL: 'https://api.vimeo.com' }),
  process.env.VIMEO_AUTHORIZATION,
);
