module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'ebook_cover', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'ebook_cover_key', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'ebook_cover'),
      queryInterface.removeColumn('products', 'ebook_cover_key'),
    ]);
  },
};
