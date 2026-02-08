module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('order_bumps', 'id_classroom'),
      queryInterface.removeColumn('order_bumps', 'price'),
      queryInterface.renameColumn(
        'order_bumps',
        'id_product',
        'order_bump_offer',
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('order_bumps', 'id_classroom', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('order_bumps', 'price', {
        type: Sequelize.DECIMAL(20, 2),
      }),
      queryInterface.renameColumn(
        'order_bumps',
        'order_bump_offer',
        'id_product',
      ),
    ]);
  },
};
