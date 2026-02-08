const yup = require('yup');

module.exports = yup.object().shape({
  files_description: yup.string().required(),
});
