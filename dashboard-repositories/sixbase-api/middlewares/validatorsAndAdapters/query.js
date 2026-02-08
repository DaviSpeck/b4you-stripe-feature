const { object, number, string } = require('yup');

const productsQuerySchema = object({
  page: number().integer().min(0).default(0),
  size: number().integer().min(1).default(10),
  status: string().oneOf(['', 'active', 'draft', 'archived']).default(''),
  vendor: string().nullable().default(null),
  title: string().nullable().default(null),
  created_at_min: string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD')
    .nullable()
    .default(null),
  created_at_max: string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD')
    .nullable()
    .default(null),
  shop: string().nullable().default(null),
}).noUnknown(true);

module.exports = async function validateProductsQuery(req, res, next) {
  try {
    const parsed = await productsQuerySchema.validate(req.query, {
      stripUnknown: true,
      context: {},
    });
    req.query = parsed;
    next();
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Parâmetros inválidos', details: err.errors });
  }
};
