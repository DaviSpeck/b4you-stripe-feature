module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('coproductions', 'allow_access', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('affiliates', 'allow_access', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('product_affiliate_settings', 'allow_access', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('coproductions', 'allow_access'),
      queryInterface.removeColumn('affiliates', 'allow_access'),
      queryInterface.removeColumn('product_affiliate_settings', 'allow_access'),
    ]);
  },
};
