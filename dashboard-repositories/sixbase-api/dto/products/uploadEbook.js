const yup = require('yup');

module.exports = yup.object().shape({
  is_bonus: yup.boolean().default(true).nullable(),
  filename: yup.string().required(),
  key: yup.string().required(),
  file_size: yup.number().required(),
});
