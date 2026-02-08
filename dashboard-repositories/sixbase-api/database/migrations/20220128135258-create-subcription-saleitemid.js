module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('subscriptions', 'id_sale_item', {
        type: Sequelize.BIGINT,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('subscriptions', 'id_sale_item'),
    ]);
  },
};
