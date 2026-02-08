const yup = require('yup');

const string = yup.string();

module.exports = yup.object().shape({
  label: string.required(),
  type: string.required(),
  url: string.url(),
});
