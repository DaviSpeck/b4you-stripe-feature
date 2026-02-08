module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'pixel_id', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'google_analytics', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'custom_javascript', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      await queryInterface.removeColumn('products', 'pixel_id'),
      await queryInterface.removeColumn('products', 'google_analytics'),
      await queryInterface.removeColumn('products', 'custom_javascript'),
    ]);
  },
};
