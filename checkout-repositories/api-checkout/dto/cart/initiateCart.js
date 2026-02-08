const yup = require('yup');
const { validateDocument } = require('../../utils/validations');
const { formatWhatsapp } = require('../../utils/formatters');

module.exports = yup.object().shape({
  offer_uuid: yup.string().required(),
  document_number: yup
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .test({
      name: 'is-valid-document',
      message: 'Documento inválido',
      test: (document) => {
        if (!document) return true;
        return document.length === 11 || document.length === 14
          ? validateDocument(document)
          : false;
      },
    }),
  email: yup.string().email().required(),
  full_name: yup.string().trim().lowercase().required(),
  whatsapp: yup
    .string()
    .required()
    .test({
      name: 'test whatsapp',
      test: (whatsapp) => {
        if (!whatsapp) return false;
        const formattedWhatsapp = formatWhatsapp(whatsapp);
        const phoneRegex = /^[0-9]*$/;
        return phoneRegex.test(formattedWhatsapp);
      },
    }),
  params: yup.object().shape({
    src: yup.string().nullable(),
    sck: yup.string().nullable(),
    utm_source: yup.string().nullable(),
    utm_medium: yup.string().nullable(),
    utm_campaign: yup.string().nullable(),
    utm_content: yup.string().nullable(),
    utm_term: yup.string().nullable(),
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
  coupon: yup
    .object()
    .nullable()
    .shape({
      code: yup.string().required(),
      id: yup.number().required(),
      discount: yup.number().required(),
      finalValue: yup.number().required(),
    })
    .default(null),
});
