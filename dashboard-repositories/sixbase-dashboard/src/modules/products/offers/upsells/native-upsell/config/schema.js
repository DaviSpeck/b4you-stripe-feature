import * as yup from 'yup';

export const upsellConfigSchema = yup.object({
  upsellProductId: yup.string().nullable().required('Campo obrigatório'),
  upsellOfferId: yup
    .string()
    .nullable()
    .when('isMultiOffer', {
      is: true,
      then: (schema) => schema.nullable(), // não obrigatório
      otherwise: (schema) => schema.required('Campo obrigatório'), // obrigatório
    }),
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
});
