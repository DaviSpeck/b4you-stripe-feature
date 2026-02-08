module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameColumn('products', 'picture', 'cover'),
      queryInterface.renameColumn('products', 'picture_key', 'cover_key'),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameColumn('products', 'cover', 'picture'),
      queryInterface.renameColumn('products', 'cover_key', 'picture_key'),
    ]);
  },
};
