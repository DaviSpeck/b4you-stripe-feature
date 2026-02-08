module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'banner_mobile', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'banner_mobile_key', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'banner_mobile'),
      queryInterface.removeColumn('products', 'banner_mobile_key'),
    ]);
  },
};
