const yup = require('yup');
const { eNotasTypes } = require('../../../types/eNotasTypes');

module.exports = yup.object().shape({
  name: yup.string().required(),
  api_key: yup.string().required(),
  api_key_logistic: yup.string().nullable(),
  type: yup.string().required(),
  send_invoice_customer_mail: yup.boolean().required(),
  generate_invoice: yup.boolean().nullable(),
  group_upsell_order: yup.boolean().nullable(),
  service_label: yup.string().nullable(),
  id_product: yup.string().required(),
  start_date: yup.string().required(),
  webhook_token: yup.string().nullable(),
  id_external_notazz: yup.string().nullable(),
  issue_invoice: yup.number().test({
    name: 'test issueInvoice',
    message: `issueInvoice must be one of these: ${eNotasTypes.map(
      ({ id, name }) => ` id: ${id} - ${name}`,
    )}`,
    test: (value) => !!eNotasTypes.find(({ id }) => value === id),
  }),
});
