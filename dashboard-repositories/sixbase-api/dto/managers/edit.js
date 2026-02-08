const yup = require('yup');

module.exports = yup.object().shape({
  commission_type: yup.string().oneOf(['fixed', 'percentage']).nullable(),
  commission_with_affiliate: yup.number().min(0).nullable(),
  commission_without_affiliate: yup.number().min(0).nullable(),
  allow_share_link: yup.boolean().nullable(),
});
