module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('plugins_products', 'settings', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('plugins_products', 'settings'),
    ]);
  },
};
