const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().required(),
  pixel_id: yup.string().required(),
});
