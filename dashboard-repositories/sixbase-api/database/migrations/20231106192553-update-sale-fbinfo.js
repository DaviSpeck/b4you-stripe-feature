module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales', 'fb_pixel_info', {
        type: Sequelize.JSON,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('sales', 'fb_pixel_info')]);
  },
};
