const yup = require('yup');

const saleItemSchema = yup.object().shape({
  id_product: yup.number().integer().required(),
  type: yup
    .string()
    .oneOf(['main', 'upsell', 'order-bump', 'subscription'])
    .required(),
  price: yup.number().positive().required(),
  quantity: yup.number().integer().min(1).default(1),
  id_offer: yup.number().integer().nullable(),
  id_classroom: yup.number().integer().nullable(),
  id_affiliate: yup.number().integer().nullable(),
  subscription_fee: yup.number().min(0).default(0),
  shipping_price: yup.number().min(0).default(0),
  integration_shipping_company: yup.string().nullable(),
  is_upsell: yup.boolean().default(false),
  warranty: yup.number().integer().nullable(),
});

module.exports = yup.object().shape({
  transaction_id: yup.string().uuid().required(),
  order_id: yup.string().required(),
  sale_id: yup.string().required(),
  amount: yup.number().integer().positive().required(),
  currency: yup.string().length(3).lowercase().required(),
  payment_method_types: yup.array().of(yup.string()).default(['card']),
  id_user: yup.number().integer().required(),
  brand: yup.string().required(),
  installments: yup.number().integer().min(1).default(1),
  student_pays_interest: yup.boolean().default(false),
  discount: yup.number().min(0).default(0),
  coupon: yup.object().nullable().default(null),
  customer: yup.object().shape({
    full_name: yup.string().required(),
    email: yup.string().email().required(),
    whatsapp: yup.string().required(),
    document_number: yup.string().required(),
    address: yup.object().nullable().default(null),
    params: yup.object().nullable().default(null),
  }),
  items: yup.array().of(saleItemSchema).min(1).required(),
});
