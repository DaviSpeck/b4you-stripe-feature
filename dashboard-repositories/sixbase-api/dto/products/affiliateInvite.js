const yup = require('yup');

module.exports = yup.object().shape({
  emails: yup.array().of(yup.string()).required(),
});
