const yup = require('yup');
const { findProductCategories } = require('../../types/productCategories');
const { SINGLE, SUBSCRIPTION } = require('../../types/productTypes');

const isValidUrl = (url) => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (e) {
    return false;
  }
  return true;
};

module.exports = yup.object().shape({
  name: yup
    .string()
    .trim('Nome de produto inválido')
    .min(3, 'Nome do produto deve ter no mínimo 3 caracteres')
    .max(200, 'O nome pode ter no máximo 200 caracteres')
    .required('Nome de produto inválido'),
  sales_page_url: yup
    .string()
    .test('is-url-valid', 'URL inválida', (value) => isValidUrl(value)),
  category: yup
    .number()
    .positive()
    .required()
    .test({
      name: 'test category',
      message: 'invalid category',
      test: (value) => {
        if (!value) return false;
        return findProductCategories(value);
      },
    }),
  payment_type: yup
    .string()
    .required()
    .test({
      name: 'test payment_type',
      message: 'payment_type must be single or subscription',
      test: (value) => value === SINGLE || value === SUBSCRIPTION,
    }),
  type: yup
    .string()
    .required()
    .test({
      name: 'test type',
      message: 'type must be video, ebook or payment_only',
      test: (value) =>
        value === 'video' ||
        value === 'ebook' ||
        value === 'payment_only' ||
        value === 'physical',
    }),
  warranty: yup.number().required().min(7).max(30),
  operation_scope: yup
    .string()
    .oneOf(['national', 'international'])
    .default('national'),
  currency_code: yup
    .string()
    .uppercase()
    .length(3)
    .default('BRL'),
  acquirer_key: yup
    .string()
    .trim()
    .default('pagarme'),
  conversion_context: yup.object().nullable(),
});
