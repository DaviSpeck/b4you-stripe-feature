const yup = require('yup');

module.exports = yup.object().shape({
  gallery: yup.array().of(
    yup.object().shape({
      title: yup.string().required(),
      video_size: yup.number().required(),
    }),
  ),
});
