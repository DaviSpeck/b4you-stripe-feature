module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'sidebar_picture', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'header_picture', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'thumbnail', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'sidebar_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'header_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'thumbnail_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'sidebar_picture'),
      queryInterface.removeColumn('products', 'header_picture'),
      queryInterface.removeColumn('products', 'thumbnail'),
      queryInterface.removeColumn('products', 'sidebar_key'),
      queryInterface.removeColumn('products', 'header_key'),
      queryInterface.removeColumn('products', 'thumbnail_key'),
    ]);
  },
};
