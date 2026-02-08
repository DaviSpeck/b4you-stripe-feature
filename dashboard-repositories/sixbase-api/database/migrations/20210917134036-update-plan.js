module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_plans', 'frequency_quantity', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.addColumn('product_plans', 'frequency_label', {
        type: Sequelize.STRING(10),
        allowNull: false,
      }),
      queryInterface.addColumn('product_plans', 'deleted_at', {
        type: Sequelize.DATE,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_plans', 'frequency_quantity'),
      queryInterface.removeColumn('product_plans', 'frequency_label'),
      queryInterface.removeColumn('product_plans', 'deleted_at'),
    ]);
  },
};
