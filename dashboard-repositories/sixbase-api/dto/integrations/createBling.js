const yup = require('yup');
const { blingTypes } = require('../../types/blingTypes');

module.exports = yup.object().shape({
  api_key: yup.string().required(),
  cancel_invoice_chargeback: yup.boolean().required(),
  send_invoice_customer_mail: yup.boolean().required(),
  nat_operacao: yup.string().required(),
  issue_invoice: yup.number().test({
    name: 'test issueInvoice',
    message: `issueInvoice must be one of these: ${blingTypes.map(
      ({ id, name }) => ` id: ${id} - ${name}`,
    )}`,
    test: (value) => !!blingTypes.find(({ id }) => value === id),
  }),
});
