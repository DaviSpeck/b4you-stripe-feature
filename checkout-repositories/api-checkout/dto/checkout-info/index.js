const yup = require('yup');
const { validateDocument } = require('../../utils/validations');
const { formatWhatsapp } = require('../../utils/formatters');

module.exports = yup.object().shape({
  document_number: yup
    .string()
    .nullable()
    .test({
      name: 'test document_number',
      test: (document) => {
        if (!document) return true;
        return validateDocument(document);
      },
    }),
  email: yup.string().email().nullable(),
  full_name: yup.string().trim().lowercase().nullable(),
  whatsapp: yup
    .string()
    .nullable()
    .test({
      name: 'test whatsapp',
      test: (whatsapp) => {
        if (!whatsapp) return true;
        const formattedWhatsapp = formatWhatsapp(whatsapp);
        const phoneRegex = /^[0-9]*$/;
        return phoneRegex.test(formattedWhatsapp);
      },
    }),
  address: yup
    .object()
    .shape({
      zipcode: yup.string(),
      street: yup.string(),
      number: yup.string(),
      complement: yup.string().nullable(),
      neighborhood: yup.string(),
      city: yup.string(),
      state: yup.string(),
    })
    .default({}),
});
