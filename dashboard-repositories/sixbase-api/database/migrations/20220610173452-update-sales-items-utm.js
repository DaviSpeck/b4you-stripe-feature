module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.addColumn(
          'sales_items',
          'src',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_items',
          'sck',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_items',
          'utm_source',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_items',
          'utm_medium',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_items',
          'utm_campaign',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_items',
          'utm_content',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_items',
          'utm_term',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
      ]),
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.removeColumn('sales_items', 'src', { transaction: t }),
        queryInterface.removeColumn('sales_items', 'sck', { transaction: t }),
        queryInterface.removeColumn('sales_items', 'utm_source', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'utm_medium', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'utm_campaign', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'utm_content', {
          transaction: t,
        }),
        queryInterface.removeColumn('sales_items', 'utm_term', {
          transaction: t,
        }),
      ]),
    );
  },
};
