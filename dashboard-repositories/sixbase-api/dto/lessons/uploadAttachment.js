const yup = require('yup');

module.exports = yup.object().shape({
  key: yup.string().required(),
  filename: yup.string().required(),
  file_size: yup.number().positive().integer().required(),
});
