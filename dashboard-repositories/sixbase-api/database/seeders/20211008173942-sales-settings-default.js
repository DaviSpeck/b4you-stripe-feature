module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'sales_settings_default',
      [
        {
          fee_fixed_billet: 2,
          fee_variable_billet: 0,
          fee_fixed_card: 0,
          fee_fixed_pix: 2,
          fee_variable_pix: 0,
          release_billet: 14,
          release_credit_card: 14,
          release_pix: 14,
          fee_variable_percentage_service: 6,
          fee_fixed_amount_service: 2,
          fee_interest_card: JSON.stringify([
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
    await queryInterface.bulkDelete('sales_settings_default', [{ id: 1 }]);
  },
};
