module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('subscriptions', 'id_affiliate', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('subscriptions', 'affiliate_commission', {
        type: Sequelize.BIGINT,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('subscriptions', 'id_affiliate'),
      queryInterface.removeColumn('subscriptions', 'affiliate_commission'),
    ]);
  },
};
