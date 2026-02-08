const yup = require('yup');
const dateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');
const regex = require('../../utils/regex');

const MIN_PERCENTAGE = 1;
const MAX_PERCENTAGE = 80;

module.exports = yup.object().shape({
  coupon: yup
    .string()
    .min(3, 'Cupom precisa ter no mínimo 4 caracteres')
    .max(30, 'Cupom pode ter no máximo 30 caracteres')
    .matches(
      regex.COUPONS,
      'Permitido apenas número e letras (sem espaços ou caracteres especiais)',
    )
    .required(),
  discount_type: yup.string().oneOf(['percentual', 'fixo']).required(),
  percentage: yup
    .number()
    .nullable()
    .when(['discount_type', 'free_shipping'], {
      is: (discount_type, free_shipping) =>
        discount_type === 'percentual' && !free_shipping,
      then: yup
        .number()
        .min(
          MIN_PERCENTAGE,
          `O desconto deve ser maior ou igual a ${MIN_PERCENTAGE}%`,
        )
        .max(MAX_PERCENTAGE)
        .required(),
      otherwise: yup.number().notRequired().nullable(),
    }),
  min_amount: yup.number().min(0).nullable(),
  min_items: yup.number().min(0).nullable(),
  first_sale_only: yup.boolean().default(false).nullable(),
  free_shipping: yup.boolean().default(false).nullable(),
  override_cookie: yup.boolean().default(false).nullable(),
  single_use_by_client: yup.boolean().default(false).nullable(),
  id_affiliate: yup.number().nullable(),
  payment_methods: yup
    .string()
    .oneOf([
      'card,billet,pix',
      'card',
      'billet',
      'pix',
      'card,billet',
      'card,pix',
      'billet,pix',
    ]),
  active: yup.boolean().required(),
  enable_for_affiliates: yup.boolean().default(false).nullable(),
  apply_on_every_charge: yup.boolean().default(false).nullable(),
  restrict_offers: yup.boolean().default(false).nullable(),
  offers_ids: yup
    .array()
    .of(yup.number().integer().positive())
    .default([])
    .when('restrict_offers', {
      is: true,
      then: (schema) =>
        schema.min(1, 'Selecione pelo menos uma oferta para restringir o cupom'),
      otherwise: (schema) =>
        schema.max(
          0,
          'Para aplicar o cupom em todas as ofertas, não selecione ofertas específicas',
        ),
    }),
  expires_at: yup
    .string()
    .test({
      name: 'test expires date',
      message: 'invalid expires date',
      test: (expires_at) => {
        if (!expires_at) return true;
        return dateHelper(expires_at, DATABASE_DATE).isValid();
      },
    })
    .nullable(),
});
