module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete('sales_settings_default', [{}]);
    await queryInterface.bulkInsert(
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
        },
      ],
      {},
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('sales_settings_default', [{}]);
  },
};
