module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameColumn('products', 'producer_name', 'nickname'),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameColumn('products', 'nickname', 'producer_name'),
    ]);
  },
};
