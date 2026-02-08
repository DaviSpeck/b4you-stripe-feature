module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'sidebar_picture_mobile', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'sidebar_picture_mobile_key', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'header_picture_mobile', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'header_picture_mobile_key', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'sidebar_picture_mobile'),
      queryInterface.removeColumn('products', 'sidebar_picture_mobile_key'),
      queryInterface.removeColumn('products', 'header_picture_mobile'),
      queryInterface.removeColumn('products', 'header_picture_mobile_key'),
    ]);
  },
};
