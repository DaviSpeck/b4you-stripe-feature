const yup = require('yup');

module.exports = yup.object().shape({
  sale_id: yup.string().required(),
  tracking_url: yup.string().nullable(),
  tracking_code: yup.string().nullable(),
  tracking_company: yup.string().nullable(),
  status: yup
    .string()
    .oneOf(['delivery_problem', 'delivered', 'forwarded', 'shipping'])
    .nullable(),
});
