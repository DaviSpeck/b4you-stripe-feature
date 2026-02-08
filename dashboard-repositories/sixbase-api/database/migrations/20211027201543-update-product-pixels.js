module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'google_analytics'),
      queryInterface.removeColumn('products', 'custom_javascript'),
      queryInterface.removeColumn('products', 'pixel_id'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'google_analytics', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'custom_javascript', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'pixel_id', {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
