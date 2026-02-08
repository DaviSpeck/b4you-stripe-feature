const yup = require('yup');

module.exports = yup.object().shape({
  commission: yup.number().min(0.1).max(99).required(),
  email: yup.string().email().required(),
  expires_at: yup.number().required(),
  allow_access: yup.boolean().default(false).nullable(),
});
