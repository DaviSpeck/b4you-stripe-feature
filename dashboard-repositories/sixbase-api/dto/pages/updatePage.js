const yup = require('yup');

const string = yup.string();

module.exports = yup.object().shape({
  label: string.nullable(),
  type: string.nullable(),
  url: string.url().nullable(),
});
