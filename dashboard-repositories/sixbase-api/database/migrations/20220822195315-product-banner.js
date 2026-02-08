module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'banner', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'banner_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'banner'),
      queryInterface.removeColumn('products', 'banner_key'),
    ]);
  },
};
