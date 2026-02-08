const yup = require('yup');

module.exports = yup.object().shape({
  status: yup
    .string()
    .oneOf(['approved', 'rejected', 'pending'])
    .required(),
});

