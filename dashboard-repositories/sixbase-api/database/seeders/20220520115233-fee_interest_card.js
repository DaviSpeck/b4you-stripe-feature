const uuid = require('../../utils/helpers/uuid');

module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'fee_interest_card',
      [
        {
          uuid: uuid.v4(),
          id_user: null,
          created_at: new Date(),
          updated_at: new Date(),
          is_default: true,
          producer_fees: JSON.stringify([
            {
              brand: 'visa',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'master',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'amex',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'elo',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'diners',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'hiper',
              monthly_installment_interest: 2.89,
            },
          ]),
          student_fees: JSON.stringify([
            {
              brand: 'visa',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'master',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'amex',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'elo',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'diners',
              monthly_installment_interest: 2.89,
            },
            {
              brand: 'hiper',
              monthly_installment_interest: 2.89,
            },
          ]),
        },
      ],
      {},
    ),

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('fee_interest_card', [{ id: 1 }]);
  },
};
