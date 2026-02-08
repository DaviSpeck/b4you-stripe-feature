module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'url_video_checkout', {
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn('product_offer', 'url_video_checkout', {
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'url_video_checkout'),
      queryInterface.removeColumn('product_offer', 'url_video_checkout'),
    ]);
  },
};
