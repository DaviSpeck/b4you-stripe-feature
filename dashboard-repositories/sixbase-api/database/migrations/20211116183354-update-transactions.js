module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'gross_amount', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'fee_variable_percentage_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'fee_variable_amount_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'fee_fixed_amount_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'fee_total_amount_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn(
        'transactions',
        'fee_variable_percentage_over_psp',
        {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
          allowNull: false,
        },
      ),
      queryInterface.addColumn('transactions', 'fee_variable_amount_over_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'fee_fixed_amount_over_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'fee_total_amount_over_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'fee_total_amount_service', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'net_amount', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'gross_profit', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'tax_variable_percentage', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'tax_variable_amount', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('transactions', 'net_profit', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('transactions', 'gross_amount'),

      queryInterface.removeColumn(
        'transactions',
        'fee_variable_percentage_psp',
      ),
      queryInterface.removeColumn('transactions', 'fee_variable_amount_psp'),
      queryInterface.removeColumn('transactions', 'fee_fixed_amount_psp'),
      queryInterface.removeColumn('transactions', 'fee_total_amount_psp'),
      queryInterface.removeColumn(
        'transactions',
        'fee_variable_percentage_over_psp',
      ),
      queryInterface.removeColumn(
        'transactions',
        'fee_variable_amount_over_psp',
      ),
      queryInterface.removeColumn('transactions', 'fee_fixed_amount_over_psp'),
      queryInterface.removeColumn('transactions', 'fee_total_amount_over_psp'),
      queryInterface.removeColumn('transactions', 'fee_total_amount_service'),
      queryInterface.removeColumn('transactions', 'net_amount'),
      queryInterface.removeColumn('transactions', 'gross_profit'),
      queryInterface.removeColumn('transactions', 'tax_variable_percentage'),
      queryInterface.removeColumn('transactions', 'tax_variable_amount '),
      queryInterface.removeColumn('transactions', 'net_profit'),
    ]);
  },
};
