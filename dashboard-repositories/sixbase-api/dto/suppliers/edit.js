const yup = require('yup');

module.exports = yup.object().shape({
  receives_shipping_amount: yup.boolean(),
  amount: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? undefined : value,
    )
    .when('receives_shipping_amount', {
      is: false,
      then: yup
        .number()
        .typeError('Valor da comissão deve ser um número')
        .min(0.01, 'Valor mínimo é R$ 0,01 quando não recebe frete')
        .required('Valor da comissão é obrigatório'),
      otherwise: yup.number().notRequired(),
    }),
});
