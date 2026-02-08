module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'type', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.removeColumn('product_offer', 'price_upsell'),
      queryInterface.removeColumn('product_offer', 'id_classroom_upsell'),
      queryInterface.renameColumn(
        'product_offer',
        'thankyou_page_upsell',
        'thankyou_page',
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'type'),
      queryInterface.addColumn('product_offer', 'price_upsell', {
        type: Sequelize.DECIMAL(20, 2),
      }),
      queryInterface.addColumn('product_offer', 'id_classroom_upsell', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.renameColumn(
        'product_offer',
        'thankyou_page',
        'thankyou_page_upsell',
      ),
    ]);
  },
};
