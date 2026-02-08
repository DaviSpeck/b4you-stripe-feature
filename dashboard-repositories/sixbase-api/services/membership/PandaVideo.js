const HTTPClient = require('../HTTPClient');

const b64 = (str) => Buffer.from(str).toString('base64');
const uuid = require('../../utils/helpers/uuid');

const { PANDA_URL, PANDA_KEY } = process.env;

class PandaVideo {
  #service;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: PANDA_KEY,
    };
    this.#service = new HTTPClient({ baseURL: `${PANDA_URL}` });
  }

  async uploadVideo({ video_size: size, video_title: name, folder_id }) {
    const videoId = uuid.v4();

    const metadata = [
      `authorization ${b64(PANDA_KEY)}`,
      `filename ${b64(name)}`,
      `video_id ${b64(videoId)}`,
      `folder_id ${b64(folder_id)}`,
    ];

    const headers = {
      'Tus-Resumable': '1.0.0',
      'Upload-Length': size,
      'Upload-Metadata': metadata.join(', '),
    };
    const response = await this.#service.post(
      'https://uploader-us01.pandavideo.com.br/files',
      null,
      { headers },
    );

    const {
      headers: { location },
    } = response;
    return {
      upload_link: location,
      uri: location,
      link: location,
      title: name,
      external_id: videoId,
    };
  }

  async deleteVideo(video_id) {
    const response = await this.#service.delete(`${PANDA_URL}/videos`, {
      headers: this.headers,
      data: [{ video_id }],
    });

    return response;
  }

  async createProductFolder(product_uuid) {
    const response = await this.#service.post(
      `${PANDA_URL}/folders`,
      { name: product_uuid },
      {
        headers: this.headers,
      },
    );

    return response.data;
  }
}

module.exports = PandaVideo;
