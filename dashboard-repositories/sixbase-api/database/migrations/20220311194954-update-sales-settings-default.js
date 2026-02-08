module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn(
      'sales_settings_default',
      'fee_variable_card',
      'fee_interest_card',
    );
  },

  async down(queryInterface) {
    await queryInterface.renameColumn(
      'sales_settings_default',
      'fee_interest_card',
      'fee_variable_card',
    );
  },
};
