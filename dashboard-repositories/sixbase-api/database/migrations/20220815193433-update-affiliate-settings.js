module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn(
        'product_affiliate_settings',
        'subscription_fee_only',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      ),
      queryInterface.addColumn('affiliates', 'subscription_fee_only', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn(
        'product_affiliate_settings',
        'subscription_fee_only',
      ),
      queryInterface.removeColumn('affiliates', 'subscription_fee_only'),
    ]);
  },
};
