const yup = require('yup');

module.exports = yup.object().shape({
  affiliate_uuid: yup.string().required(),
  sale_item_uuid: yup.string().required(),
});
