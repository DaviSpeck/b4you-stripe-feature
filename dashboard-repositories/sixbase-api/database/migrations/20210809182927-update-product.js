module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'ebook_file'),
      queryInterface.removeColumn('products', 'ebook_key'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'ebook_file', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'ebook_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};
