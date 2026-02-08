const yup = require('yup');
const { frequency_types } = require('../../types/frequencyTypes');

const { MIN_PRICE } = process.env;

module.exports = yup.object().shape({
  price: yup.number().positive().min(MIN_PRICE).required(),
  label: yup.string().required(),
  payment_frequency: yup.string().test({
    name: 'test payment_frequency',
    message: `payment_frequency must be one of these: ${frequency_types.map(
      (frequency) => frequency,
    )}`,
    test: (value) => frequency_types.includes(value),
  }),
  subscription_fee: yup.boolean().default(false).nullable(),
  subscription_fee_price: yup.number().when('subscription_fee', {
    is: true,
    then: yup.number().positive().min(MIN_PRICE).required(),
    otherwise: yup.number().default(0).nullable(),
  }),
  charge_first: yup.boolean().default(false).nullable(),
});
