const { wasVideoUploaded } = require('../common');
const { findEmbedType } = require('../../types/embedTypes');

const serializeProductGallery = (gallery) => {
  if (!gallery)
    return {
      link: null,
      uri: null,
      upload_link: null,
      video_status: 0,
      video_uploaded: false,
      duration: 0,
      thumbnail: null,
      lesson_uuid: null,
    };
  const {
    uuid,
    link,
    uri,
    upload_link,
    video_status,
    video_uploaded,
    duration,
    thumbnail,
    title,
    lessons,
    embed_url,
    id_embed_type,
  } = gallery;
  return {
    uuid,
    link,
    uri,
    upload_link,
    video_status: wasVideoUploaded(video_status),
    video_uploaded,
    duration: duration || 0,
    thumbnail,
    title,
    lesson_uuid: lessons ? lessons.dataValues.uuid : null,
    embed_url,
    type: findEmbedType(id_embed_type),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) return this.data.map(serializeProductGallery);
    return serializeProductGallery(this.data);
  }
};
