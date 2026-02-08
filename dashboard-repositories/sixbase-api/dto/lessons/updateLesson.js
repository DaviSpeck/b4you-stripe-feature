const yup = require('yup');

module.exports = yup.object().shape({
  title: yup.string().nullable(),
  description: yup.string().nullable(),
  video_size: yup.number().positive().integer().nullable(),
  video_title: yup.string().nullable(),
  active: yup.boolean().nullable(),
  gallery_video: yup.string().nullable(),
  embed_url: yup.string().nullable().url(),
  duration: yup.number().nullable(),
  release: yup.number().integer().min(0).nullable(),
});
