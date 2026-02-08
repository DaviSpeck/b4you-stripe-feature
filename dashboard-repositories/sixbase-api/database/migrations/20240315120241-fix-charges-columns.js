/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      // queryInterface.removeColumn('charges', 'fee_fixed_amount'),
      // queryInterface.removeColumn('charges', 'fee_total'),
      // queryInterface.removeColumn('charges', 'user_gross_amount'),
      // queryInterface.removeColumn('charges', 'user_net_amount'),
      // queryInterface.removeColumn('charges', 'tax_fee_percentage'),
      // queryInterface.removeColumn('charges', 'tax_fee_amount'),
      // queryInterface.removeColumn('charges', 'tax_total'),
      // queryInterface.removeColumn('charges', 'revenue'),
      // queryInterface.removeColumn('charges', 'fee_variable_percentage'),
      // queryInterface.removeColumn('charges', 'fee_variable_amount'),
      // queryInterface.removeColumn('charges', 'company_net_profit_amount'),
      // queryInterface.removeColumn(
      // 'charges',
      // 'spread_over_price_total_percentage',
      // ),
    ]);
  },
};
