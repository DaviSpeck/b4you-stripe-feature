const yup = require('yup');

const upsellNativeDto = yup.object({
  isActive: yup.boolean().default(false),
  header: yup.string(),
  isMultiOffer: yup.boolean().default(false),
  offers: yup
    .array()
    .of(yup.string())
    .default([])
    .when('isMultiOffers', {
      is: true,
      then: (schema) => schema.min(1, 'Selecione pelo menos 1 oferta.'),
      otherwise: (schema) => schema,
    }),
  upsellProductId: yup.string().required('product is required'),
  upsellOfferId: yup
    .string()
    .nullable()
    .when('isMultiOffer', {
      is: true,
      then: (schema) => schema.nullable(), // não obrigatório
      otherwise: (schema) => schema.required('Campo obrigatório'), // obrigatório
    }),
  title: yup.string().required('title is required'),
  subtitle: yup.string(),
  isOneClick: yup.boolean().default(true),
  isEmbedVideo: yup.boolean().default(false),
  isMessageNotClose: yup.boolean().default(true),
  mediaUrl: yup.string().default(null).nullable(),
  mediaEmbed: yup.string().default(null).nullable(),
  background: yup.string().default('#f2f4f7'),
  stepColorBackground: yup.string().default('#ffffffff'),
  stepColor: yup.string().default('#0f1b35'),
  alertNotClosePrimaryColor: yup.string().default('#0f1b35'),
  alertNotClosePrimaryTextColor: yup.string().default('#f1f1f1'),
  btnTextAccept: yup.string().required('btn text is required'),
  btnTextRefuse: yup.string().required('btn text is required'),
  btnColorAccept: yup.string().default('#0f1b35'),
  btnTextColorAccept: yup.string().default('#ffffffff'),
  btnTextColorRefuse: yup.string().default('#0f1b35'),
  btnTextAcceptSize: yup.number().default(16),
  btnTextRefuseSize: yup.number().default(16),
});

const upsellNativeProductActiveInactiveDto = yup.object({
  isActive: yup.boolean().default(false),
});

module.exports = {
  upsellNativeDto,
  upsellNativeProductActiveInactiveDto,
};
