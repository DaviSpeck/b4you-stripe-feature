const yup = require('yup');

module.exports = yup.object().shape({
  id_supplier: yup.number().required('Fornecedor é obrigatório'),
  receives_shipping_amount: yup
    .boolean()
    .required('Campo de frete é obrigatório'),
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
        .min(0.01, 'Valor mínimo é R$ 0,01')
        .required('Valor da comissão é obrigatório'),
      otherwise: yup.number().notRequired(),
    }),
});
