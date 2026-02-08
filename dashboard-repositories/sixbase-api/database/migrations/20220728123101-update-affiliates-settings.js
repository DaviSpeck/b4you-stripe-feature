module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn(
        'product_affiliate_settings',
        'subscription_fee',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      ),
      queryInterface.addColumn(
        'product_affiliate_settings',
        'subscription_fee_commission',
        {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
      ),
      queryInterface.addColumn(
        'product_affiliate_settings',
        'commission_all_charges',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
      ),
      queryInterface.addColumn('affiliates', 'subscription_fee', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('affiliates', 'subscription_fee_commission', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      }),
      queryInterface.addColumn('affiliates', 'commission_all_charges', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn(
        'product_affiliate_settings',
        'subscription_fee',
      ),
      queryInterface.removeColumn(
        'product_affiliate_settings',
        'subscription_fee_commission',
      ),
      queryInterface.removeColumn(
        'product_affiliate_settings',
        'commission_all_charges',
      ),
      queryInterface.removeColumn('affiliates', 'subscription_fee'),
      queryInterface.removeColumn('affiliates', 'subscription_fee_commission'),
      queryInterface.removeColumn('affiliates', 'commission_all_charges'),
    ]);
  },
};
