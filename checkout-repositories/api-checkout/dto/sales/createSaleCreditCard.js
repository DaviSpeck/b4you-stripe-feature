const yup = require('yup');
const { isValid, isSecurityCodeValid } = require('creditcard.js');
const date = require('../../utils/helpers/date');
const { formatWhatsapp } = require('../../utils/formatters');
const { validateDocument } = require('../../utils/validations');

const expirationDateRegex = '^(0[1-9]|1[0-2])/([0-9]{2})$';
const expirationDateMessage =
  'Data de vencimento inválida. Use o formato MM/AA (ex.: 05/28)';
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

const cardSchema = yup
  .object()
  .shape({
    card_number: yup
      .string()
      .min(14)
      .max(18)
      .required()
      .test({
        name: 'test credit card number',
        message: 'Número Inválido',
        test: (card_number) => {
          if (!card_number) return false;
          return isValid(card_number);
        },
      }),
    card_holder: yup.string().required(),
    expiration_date: yup
      .string()
      .length(5)
      .matches(expirationDateRegex, expirationDateMessage)
      .required()
      .test({
        name: 'testing expiration date',
        message: 'Data Inválida',
        test: (value) => date(value, 'MM/YY').diff(date(), 'M') >= 0,
      }),
    cvv: yup
      .string()
      .min(3)
      .max(4)
      .required()
      .test({
        name: 'test cvv',
        test: (cvv, { parent: { card_number } }) =>
          isSecurityCodeValid(card_number, cvv),
        message: 'cvv Inválido',
      }),
    installments: yup
      .number()
      .integer()
      .positive()
      .min(1)
      .max(12)
      .default(1)
      .nullable(),
    amount: yup
      .number()
      .positive('O valor do cartão deve ser maior que zero')
      .nullable(),
  })
  .required();

module.exports = yup
  .object()
  .shape({
    offer_id: yup.string().required(),
    coupon: yup.string().nullable(),
    sessionID: yup.string().required(),
    visitorId: yup.string().nullable(),
    order_bumps: yup.array().of(yup.string()).default([]).nullable(),
    b4f: yup.string().nullable(),
    integration_shipping_price: yup.number().default(0).nullable(),
    integration_shipping_company: yup.string().nullable(),
    // Array de cartões (sempre obrigatório)
    cards: yup
      .array()
      .of(cardSchema)
      .min(1, 'Envie pelo menos um cartão')
      .required('É necessário informar os cartões'),
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
      .required()
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
      .default({}),
  })
  .test({
    name: 'validate-cards-amount',
    message: 'Validação de valores dos cartões',
    test(value) {
      const { cards } = value;
      if (!cards || !Array.isArray(cards) || cards.length === 0) {
        return true; // Validação de required já é feita pelo schema
      }
      // Validar amount quando houver 2 ou mais cartões
      if (cards.length > 1) {
        const allHaveAmount = cards.every(
          (c) => c.amount !== null && c.amount !== undefined,
        );
        if (!allHaveAmount) {
          return this.createError({
            path: 'cards',
            message:
              'Informe o valor (amount) para todos os cartões quando houver 2 ou mais',
          });
        }
        // Validar que todos os amounts são positivos
        const allAmountsPositive = cards.every((c) => c.amount > 0);
        if (!allAmountsPositive) {
          return this.createError({
            path: 'cards',
            message: 'O valor do cartão deve ser maior que zero',
          });
        }
      } else if (
        cards[0].amount !== null &&
        cards[0].amount !== undefined &&
        cards[0].amount <= 0
      ) {
        // Com 1 cartão, validar que se amount foi informado, deve ser positivo
        return this.createError({
          path: 'cards',
          message: 'O valor do cartão deve ser maior que zero',
        });
      }
      return true;
    },
  });
