const yup = require('yup');

module.exports = yup.object().shape({
  id_manager: yup.number().required(),
  commission_type: yup.string().oneOf(['fixed', 'percentage']).required(),
  commission_with_affiliate: yup.number().min(0).required(),
  commission_without_affiliate: yup.number().min(0).default(0),
  allow_share_link: yup.boolean().required(),
});
