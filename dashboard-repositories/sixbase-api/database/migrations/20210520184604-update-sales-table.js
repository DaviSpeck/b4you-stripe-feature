module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales', 'price'),
      queryInterface.removeColumn('sales', 'psp_id'),
      queryInterface.removeColumn('sales', 'psp_upsell'),
      queryInterface.removeColumn('sales', 'payment_method'),
      queryInterface.removeColumn('sales', 'paid_at'),
      queryInterface.removeColumn('sales', 'next_charge'),
      queryInterface.removeColumn('sales', 'active'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales', 'price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      }),
      queryInterface.addColumn('sales', 'psp_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('sales', 'psp_upsell', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('sales', 'payment_method', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('sales', 'paid_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn('sales', 'next_charge', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }),
      queryInterface.addColumn('sales', 'active', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },
};
