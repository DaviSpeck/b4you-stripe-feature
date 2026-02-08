module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'gross_amount', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'net_amount_student', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn(
        'sales_items',
        'fee_variable_percentage_student',
        {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
          allowNull: false,
        },
      ),
      queryInterface.addColumn('sales_items', 'fee_variable_amount_student', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_fixed_amount_student', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_total_amount_student', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_variable_percentage_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_variable_amount_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_fixed_amount_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_total_amount_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn(
        'sales_items',
        'fee_variable_percentage_service',
        {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
          allowNull: false,
        },
      ),
      queryInterface.addColumn('sales_items', 'fee_variable_amount_service', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_fixed_amount_service', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_total_amount_service', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn(
        'sales_items',
        'fee_variable_percentage_over_psp',
        {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
          allowNull: false,
        },
      ),
      queryInterface.addColumn('sales_items', 'fee_variable_amount_over_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_fixed_amount_over_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'fee_total_amount_over_psp', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'gross_profit', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'tax_variable_percentage', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'tax_variable_amount', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'net_profit', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.addColumn('sales_items', 'net_amount', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'gross_amount'),
      queryInterface.removeColumn('sales_items', 'net_amount_student'),
      queryInterface.removeColumn(
        'sales_items',
        'fee_variable_percentage_student',
      ),
      queryInterface.removeColumn('sales_items', 'fee_variable_amount_student'),
      queryInterface.removeColumn('sales_items', 'fee_fixed_amount_student'),
      queryInterface.removeColumn('sales_items', 'fee_total_amount_student'),
      queryInterface.removeColumn('sales_items', 'fee_variable_percentage_psp'),
      queryInterface.removeColumn('sales_items', 'fee_variable_amount_psp'),
      queryInterface.removeColumn('sales_items', 'fee_fixed_amount_psp'),
      queryInterface.removeColumn('sales_items', 'fee_total_amount_psp'),
      queryInterface.removeColumn(
        'sales_items',
        'fee_variable_percentage_service',
      ),
      queryInterface.removeColumn('sales_items', 'fee_variable_amount_service'),
      queryInterface.removeColumn('sales_items', 'fee_fixed_amount_service'),
      queryInterface.removeColumn('sales_items', 'fee_total_amount_service'),
      queryInterface.removeColumn(
        'sales_items',
        'fee_variable_percentage_over_psp',
      ),
      queryInterface.removeColumn(
        'sales_items',
        'fee_variable_amount_over_psp',
      ),
      queryInterface.removeColumn('sales_items', 'fee_fixed_amount_over_psp'),
      queryInterface.removeColumn('sales_items', 'fee_total_amount_over_psp'),
      queryInterface.removeColumn('sales_items', 'gross_profit'),
      queryInterface.removeColumn('sales_items', 'tax_variable_percentage'),
      queryInterface.removeColumn('sales_items', 'tax_variable_amount'),
      queryInterface.removeColumn('sales_items', 'net_profit'),
      queryInterface.removeColumn('sales_items', 'net_amount'),
    ]);
  },
};
