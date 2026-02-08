const yup = require('yup');
const { validateDocument } = require('../../utils/validations');

module.exports = yup.object().shape({
  full_name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  whatsapp: yup.string().required(),
  document_number: yup
    .string()
    .required()
    .test({
      name: 'test cpf',
      message: 'CPF Inválido',
      test: (cpf) => {
        if (!cpf) return false;
        return validateDocument(cpf);
      },
    }),
});
