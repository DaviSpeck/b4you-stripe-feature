/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'installments'),
      queryInterface.removeColumn('sales_items', 'payment_splited'),
      queryInterface.addColumn('sales_items', 'revenue', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn(
        'sales_items',
        'interest_installment_percentage',
        {
          type: Sequelize.DECIMAL(10, 2),
        },
      ),
      queryInterface.addColumn('sales_items', 'interest_installment_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'company_gross_profit_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'company_net_profit_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'tax_fee_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'tax_fee_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'tax_interest_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'tax_interest_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'tax_total', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'spread_over_price_product', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'spread_over_price_total', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'monthly_installment_interest', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'original_price', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'customer_paid_interest', {
        type: Sequelize.BOOLEAN,
      }),
    ]);
  },
};
