module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'sidebar_picture_mobile'),
      queryInterface.removeColumn('products', 'sidebar_picture_mobile_key'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'sidebar_picture_mobile', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'sidebar_picture_mobile_key', {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
