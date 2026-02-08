const yup = require('yup');
const { eNotasTypes } = require('../../types/eNotasTypes');

module.exports = yup.object().shape({
  api_key: yup.string().required(),
  cancel_invoice_chargeback: yup.boolean().required(),
  issue_invoice: yup.number().test({
    name: 'test issueInvoice',
    message: `issueInvoice must be one of these: ${eNotasTypes.map(
      ({ id, name }) => ` id: ${id} - ${name}`,
    )}`,
    test: (value) => !!eNotasTypes.find(({ id }) => value === id),
  }),
  send_invoice_customer_mail: yup.boolean().required(),
});
