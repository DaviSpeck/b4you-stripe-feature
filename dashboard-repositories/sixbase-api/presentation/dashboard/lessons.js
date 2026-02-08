const { capitalizeName } = require('../../utils/formatters');
const {
  wasVideoUploaded,
  resolveAttachments,
  translateDurationToStringTime,
} = require('../common');
const { findEmbedType } = require('../../types/embedTypes');

const resolveVideoData = (video) => {
  if (!video)
    return {
      link: null,
      uri: null,
      upload_link: null,
      video_status: 0,
      video_uploaded: false,
      duration: 0,
    };
  const {
    link,
    uri,
    upload_link,
    video_status,
    video_uploaded,
    duration,
    embed_url,
    id_embed_type,
  } = video;
  return {
    link,
    uri,
    upload_link,
    video_status: wasVideoUploaded(video_status),
    video_uploaded,
    duration: translateDurationToStringTime(duration),
    embed_url,
    type: findEmbedType(Number(id_embed_type)),
  };
};

const serializeSingleLesson = (lesson) => {
  const {
    uuid,
    title,
    description,
    order,
    active,
    created_at,
    updated_at,
    attachments,
    video,
    release,
  } = lesson;
  return {
    uuid,
    release,
    title: capitalizeName(title),
    description,
    order,
    active,
    vimeo: resolveVideoData(video),
    attachments: resolveAttachments(attachments),
    created_at,
    updated_at,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleLesson);
    }
    return serializeSingleLesson(this.data);
  }
};
