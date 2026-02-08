module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.removeColumn('sales_items', 'gross_amount', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'net_amount_student', {
          transaction: t,
        }),
        queryInterface.removeColumn(
          'sales_items',
          'fee_variable_percentage_student',
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn(
          'sales_items',
          'fee_variable_amount_student',
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn('sales_items', 'fee_fixed_amount_student', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'fee_total_amount_student', {
          transaction: t,
        }),
        queryInterface.removeColumn(
          'sales_items',
          'fee_variable_percentage_psp',
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn('sales_items', 'fee_variable_amount_psp', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'fee_fixed_amount_psp', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'fee_total_amount_psp', {
          transaction: t,
        }),
        queryInterface.removeColumn(
          'sales_items',
          'fee_variable_percentage_service',
          { transaction: t },
        ),
        queryInterface.removeColumn(
          'sales_items',
          'fee_variable_amount_service',
          { transaction: t },
        ),
        queryInterface.removeColumn('sales_items', 'fee_fixed_amount_service', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'fee_total_amount_service', {
          transaction: t,
        }),
        queryInterface.removeColumn(
          'sales_items',
          'fee_variable_percentage_over_psp',
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn(
          'sales_items',
          'fee_variable_amount_over_psp',
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn(
          'sales_items',
          'fee_fixed_amount_over_psp',
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn(
          'sales_items',
          'fee_total_amount_over_psp',
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn('sales_items', 'gross_profit', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'tax_variable_percentage', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'tax_variable_amount', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'net_profit', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'net_amount', {
          transaction: t,
        }),
      ]),
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.addColumn(
          'sales_items',
          'gross_amount',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'net_amount_student',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_variable_percentage_student',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_variable_amount_student',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_fixed_amount_student',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_total_amount_student',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_variable_percentage_psp',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_variable_amount_psp',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_fixed_amount_psp',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_total_amount_psp',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_variable_percentage_service',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_variable_amount_service',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_fixed_amount_service',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_total_amount_service',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_variable_percentage_over_psp',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_variable_amount_over_psp',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_fixed_amount_over_psp',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'fee_total_amount_over_psp',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'gross_profit',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'tax_variable_percentage',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'tax_variable_amount',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'net_profit',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'sales_items',
          'net_amount',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0, allowNull: false },
          {
            transaction: t,
          },
        ),
      ]),
    );
  },
};
