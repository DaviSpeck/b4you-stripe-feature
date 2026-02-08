module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameColumn(
        'products_ebooks',
        'main_product',
        'is_bonus',
      ),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameColumn(
        'products_ebooks',
        'is_bonus',
        'main_product',
      ),
    ]);
  },
};
