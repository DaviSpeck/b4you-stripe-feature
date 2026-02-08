const yup = require('yup');
const { validateDocument } = require('../../utils/validations');
const { formatWhatsapp } = require('../../utils/formatters');

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
  full_name: yup.string().nullable(),
  email: yup.string().email('E-mail Inválido').nullable(),
  whatsapp: yup
    .string()
    .nullable()
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
  document_number: yup
    .string()
    .nullable()
    .test({
      name: 'test cpf',
      message: 'CPF Inválido',
      test: (cpf) => {
        if (!cpf) return false;
        return validateDocument(cpf);
      },
    }),
  zipcode: yup.string().nullable(),
  street: yup.string().nullable(),
  number: yup.string().nullable(),
  complement: yup.string().nullable(),
  neighborhood: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable(),
});
