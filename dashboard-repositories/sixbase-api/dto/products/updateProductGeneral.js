const yup = require('yup');
const { findProductCategories } = require('../../types/productCategories');

module.exports = yup.object().shape({
  name: yup
    .string()
    .nullable()
    .max(200, 'O nome pode ter no máximo 200 caracteres'),
  nickname: yup.string().nullable(),
  bling_sku: yup.string().nullable(),
  tiny_sku: yup.string().nullable(),
  biography: yup.string().nullable(),
  category: yup
    .number()
    .positive()
    .nullable()
    .test({
      name: 'test category',
      message: 'Categoria inválida',
      test: (value) => {
        if (!value) return true;
        return findProductCategories(value);
      },
    }),
  description: yup.string().nullable(),
  excerpt: yup.string().nullable(),
  warranty: yup.number().integer().positive().min(7).nullable(),
  support_email: yup.string().email().nullable(),
  refund_email: yup.string().email().nullable(),
  support_whatsapp: yup.string().nullable(),
  sales_page_url: yup.string().url('URL Inválida').nullable(),
  length: yup.number().default(0).nullable(),
  height: yup.number().default(0).nullable(),
  weight: yup.number().default(0).nullable(),
  width: yup.number().default(0).nullable(),
  email_subject: yup.string().default(null).nullable(),
  email_template: yup.string().default(null).nullable(),
  module_cover_format: yup
    .string()
    .oneOf(['vertical', 'horizontal'], 'Formato inválido')
    .nullable(),
});
