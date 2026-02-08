module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'bling_sku', {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('products', 'bling_sku')]);
  },
};
