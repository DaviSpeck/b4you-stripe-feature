const yup = require('yup');
const { validateDocument } = require('../../utils/validations');

module.exports = yup.object().shape({
  has_sold: yup.number().default(0).nullable(),
  revenue: yup.number().default(0).nullable(),
  platform: yup.string().nullable(),
  signup_reason: yup.number().default(0),
  instagram: yup.string().nullable(),
  document_number: yup
    .string()
    .nullable()
    .test({
      name: 'test cpf',
      message: 'CPF Inválido',
      test: (cpf) => {
        if (!cpf) return true;
        return validateDocument(cpf);
      },
    }),

  tiktok: yup.string().nullable(),
  user_type: yup.string().nullable(),
  nicho_other: yup.string().nullable(),
  nicho: yup.string().nullable(),
  business_model_other: yup.string().nullable(),
  has_experience_as_creator_or_affiliate: yup.number().default(0).nullable(),
  audience_size: yup.number().default(0).nullable(),
  origem: yup.number().default(0).nullable(),
  business_model: yup.number().default(0).nullable(),
  company_size: yup.number().default(0).nullable(),
  worked_with_affiliates: yup.number().default(0).nullable(),
  invested_in_affiliates: yup.number().default(0).nullable(),
  origem_other: yup.string().nullable(),
});
