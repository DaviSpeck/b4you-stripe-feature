import * as yup from 'yup';

export const schemaConfig = yup.object({
  upsellProductId: yup.string().nullable().required('Campo obrigatório'),
  upsellOfferId: yup
    .string()
    .nullable()
    .when('isMultiOffer', {
      is: true,
      then: (schema) => schema.nullable(), // não obrigatório
      otherwise: (schema) => schema.required('Campo obrigatório'), // obrigatório
    }),
  header: yup.string(),
  title: yup.string(),
  subtitle: yup.string(),
  isMultiOffer: yup.boolean(),
  offers: yup.array().when('isMultiOffer', {
    is: true,
    then: (schema) =>
      schema
        .min(1, 'Selecione ao menos uma oferta')
        .test(
          'valid-offers',
          'Selecione todas as ofertas',
          (offers) =>
            Array.isArray(offers) &&
            offers.length > 0 &&
            offers.every((offer) => offer && offer.uuid)
        ),
    otherwise: (schema) => schema,
  }),
  isOneClick: yup.boolean().required('Campo obrigatório'),
  isEmbedVideo: yup.boolean().required('Campo obrigatório'),
  mediaUrl: yup.string().nullable(),
  mediaEmbed: yup.string().nullable(),
  btnTextAccept: yup.string().nullable().required('Campo obrigatório'),
  btnTextRefuse: yup.string().nullable().required('Campo obrigatório'),
  btnColorAccept: yup.string().nullable().required('Campo obrigatório'),
  btnTextColorAccept: yup.string().nullable().required('Campo obrigatório'),
  btnTextColorRefuse: yup.string().nullable().required('Campo obrigatório'),
  btnTextAcceptSize: yup.number().nullable().required('Campo obrigatório'),
  btnTextRefuseSize: yup.number().nullable().required('Campo obrigatório'),
});
