module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_gallery', 'embed_url', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('product_gallery', 'id_embed_type', {
        type: Sequelize.STRING,
        defaultValue: 4,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_gallery', 'embed_url'),
      queryInterface.removeColumn('product_gallery', 'id_embed_type'),
    ]);
  },
};
