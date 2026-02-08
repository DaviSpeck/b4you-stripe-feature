module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'id_pre_offer'),
      queryInterface.removeColumn('product_offer', 'price_pre_offer'),
      queryInterface.renameColumn(
        'product_offer',
        'id_post_offer',
        'id_upsell',
      ),
      queryInterface.renameColumn(
        'product_offer',
        'price_post_offer',
        'price_upsell',
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'id_pre_offer', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('product_offer', 'price_pre_offer', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.renameColumn(
        'product_offer',
        'id_upsell',
        'id_post_offer',
      ),
      queryInterface.renameColumn(
        'product_offer',
        'price_upsell',
        'price_post_offer',
      ),
    ]);
  },
};
