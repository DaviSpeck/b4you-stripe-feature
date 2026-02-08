/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('charges', 'psp_cost_variable_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'psp_cost_variable_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'psp_cost_fixed_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'psp_cost_total', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'revenue', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'interest_installment_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'interest_installment_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'fee_variable_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'fee_variable_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'fee_fixed_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'fee_total', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'user_gross_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'user_net_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'company_gross_profit_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'tax_fee_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'tax_fee_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'tax_interest_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'tax_interest_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'tax_total', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'company_net_profit_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn(
        'charges',
        'spread_over_price_total_percentage',
        {
          type: Sequelize.DECIMAL(10, 2),
        },
      ),
      queryInterface.addColumn('charges', 'discount_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('charges', 'discount_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('charges', 'psp_cost_variable_percentage'),
      queryInterface.removeColumn('charges', 'psp_cost_variable_amount'),
      queryInterface.removeColumn('charges', 'psp_cost_fixed_amount'),
      queryInterface.removeColumn('charges', 'psp_cost_total'),
      queryInterface.removeColumn('charges', 'revenue'),
      queryInterface.removeColumn('charges', 'interest_installment_percentage'),
      queryInterface.removeColumn('charges', 'interest_installment_amount'),
      queryInterface.removeColumn('charges', 'fee_variable_percentage'),
      queryInterface.removeColumn('charges', 'fee_variable_amount'),
      queryInterface.removeColumn('charges', 'fee_fixed_amount'),
      queryInterface.removeColumn('charges', 'fee_total'),
      queryInterface.removeColumn('charges', 'user_gross_amount'),
      queryInterface.removeColumn('charges', 'user_net_amount'),
      queryInterface.removeColumn('charges', 'company_gross_profit_amount'),
      queryInterface.removeColumn('charges', 'tax_fee_percentage'),
      queryInterface.removeColumn('charges', 'tax_fee_amount'),
      queryInterface.removeColumn('charges', 'tax_interest_percentage'),
      queryInterface.removeColumn('charges', 'tax_interest_amount'),
      queryInterface.removeColumn('charges', 'tax_total'),
      queryInterface.removeColumn('charges', 'company_net_profit_amount'),
      queryInterface.removeColumn(
        'charges',
        'spread_over_price_total_percentage',
      ),
      queryInterface.removeColumn('charges', 'discount_percentage'),
      queryInterface.removeColumn('charges', 'discount_amount'),
    ]);
  },
};
