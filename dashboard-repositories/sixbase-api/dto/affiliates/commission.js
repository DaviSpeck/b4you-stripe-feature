const yup = require('yup');

module.exports = yup.object().shape({
  commission: yup.number().min(1).max(100).required(),
  subscription_fee_commission: yup.number().min(1).max(80).nullable(),
  subscription_fee_only: yup.boolean().nullable(),
});
