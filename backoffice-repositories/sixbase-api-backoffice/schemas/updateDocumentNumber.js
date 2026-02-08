const yup = require('yup');
const { cpf } = require('cpf-cnpj-validator');
const { rawDocument } = require('../utils/formatters');

module.exports = yup.object().shape({
  document_number: yup
    .string()
    .required()
    .test({
      name: 'validate cpf',
      test: (documentNumber) => {
        if (!documentNumber) return false;
        const raw = rawDocument(documentNumber);
        return cpf.isValid(raw);
      },
    }),
});
