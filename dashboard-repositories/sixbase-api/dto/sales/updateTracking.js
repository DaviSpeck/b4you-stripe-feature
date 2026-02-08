const yup = require('yup');

module.exports = yup.object().shape({
  tracking_url: yup.string().nullable(),
  tracking_code: yup.string().nullable(),
});
