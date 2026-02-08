module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products_ebooks', 'file_size', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('products_ebooks', 'file_extension', {
        type: Sequelize.STRING(10),
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products_ebooks', 'file_size'),
      queryInterface.removeColumn('products_ebooks', 'file_extension'),
    ]);
  },
};
