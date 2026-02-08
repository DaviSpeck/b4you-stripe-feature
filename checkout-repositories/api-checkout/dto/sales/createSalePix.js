const yup = require('yup');
const { formatWhatsapp } = require('../../utils/formatters');
const { validateDocument } = require('../../utils/validations');

const dddsValidos = [
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '21',
  '22',
  '24',
  '27',
  '28',
  '31',
  '32',
  '33',
  '34',
  '35',
  '37',
  '38',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '51',
  '53',
  '54',
  '55',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '71',
  '73',
  '74',
  '75',
  '77',
  '79',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
];

module.exports = yup.object().shape({
  offer_id: yup.string().required(),
  order_bumps: yup.array().of(yup.string()).default([]).nullable(),
  socket_id: yup.string().default(null).nullable(),
  coupon: yup.string().nullable(),
  b4f: yup.string().nullable(),
  integration_shipping_price: yup.number().default(0).nullable(),
  integration_shipping_company: yup.string().nullable(),
  document_number: yup
    .string()
    .required()
    .test({
      name: 'test document_number',
      test: (document) => {
        if (!document) return false;
        return validateDocument(document);
      },
    }),
  email: yup.string().email().required(),
  full_name: yup
    .string()
    .trim()
    .lowercase()
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'O nome deve conter apenas letras')
    .required(),
  whatsapp: yup
    .string()
    .required('WhatsApp é obrigatório')
    .test({
      name: 'is-valid-whatsapp',
      message: 'Número de telefone inválido',
      test: (whatsapp) => {
        if (!whatsapp) return false;
        const formattedWhatsapp = formatWhatsapp(whatsapp);
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(formattedWhatsapp)) return false;
        const ddd = formattedWhatsapp.substring(0, 2);
        if (!dddsValidos.includes(ddd)) return false;
        if (formattedWhatsapp.length === 11) {
          return formattedWhatsapp[2] === '9';
        }
        return formattedWhatsapp.length === 10;
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
  params: yup
    .object()
    .shape({
      src: yup.string().nullable(),
      sck: yup.string().nullable(),
      utm_source: yup.string().nullable(),
      utm_medium: yup.string().nullable(),
      utm_campaign: yup.string().nullable(),
      utm_content: yup.string().nullable(),
      utm_term: yup.string().nullable(),
      b1: yup.string().nullable(),
      b2: yup.string().nullable(),
      b3: yup.string().nullable(),
    })
    .noUnknown(false) // Permite campos adicionais além dos definidos
    .default({}),
});
