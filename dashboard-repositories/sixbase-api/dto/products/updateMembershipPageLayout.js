const yup = require('yup');

const blockSchema = yup.object({
  id: yup.string().required(),
  type: yup
    .string()
    .oneOf([
      'hero',
      'text',
      'modules',
      'video',
      'testimonials',
      'faq',
      'cta',
      'spacer',
      'image',
      'description',
      'producer',
      'social',
      'stats',
    ])
    .required(),
  order: yup.number().integer().min(0).required(),
  // Use mixed() with noTransform to preserve the entire config object exactly as received
  // This ensures all config properties are preserved without any transformation
  config: yup.mixed().notRequired(),
});

const layoutSchema = yup.object({
  version: yup.string().required(),
  layout: yup.array().of(blockSchema).min(1).required(),
});

module.exports = yup.object({
  layout: layoutSchema.required(),
}).noUnknown(false);

