const yup = require('yup');

const upsellNativeOfferDto = yup.object({
  upsellProductId: yup.string().required('product is required'),
  upsellOfferId: yup.string().required('product offer is required'),
  title: yup.string().required('title is required'),
  subtitle: yup.string().required('subtitle is required'),
  isOneClick: yup.boolean().default(false),
  isEmbedVideo: yup.boolean().default(false),
  mediaUrl: yup.string().default(null).nullable(),
  mediaEmbed: yup.string().default(null).nullable(),
  btnTextAccept: yup.string().required('btn text is required'),
  btnTextRefuse: yup.string().required('btn text is required'),
  btnColorAccept: yup.string().default('#0f1b35'),
  btnTextColorAccept: yup.string().default('#ffffff'),
  btnTextColorRefuse: yup.string().default('#0f1b35'),
  btnTextAcceptSize: yup.number().default(16),
  btnTextRefuseSize: yup.number().default(16),
});

module.exports = {
  upsellNativeOfferDto,
};
