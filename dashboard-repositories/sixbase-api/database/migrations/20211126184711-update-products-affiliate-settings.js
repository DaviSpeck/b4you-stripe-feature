module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('product_affiliate_settings', 'description', {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn(
        'product_affiliate_settings',
        'general_rules',
        {
          type: Sequelize.TEXT,
        },
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('product_affiliate_settings', 'description', {
        type: Sequelize.VARCHAR,
      }),
      queryInterface.changeColumn(
        'product_affiliate_settings',
        'general_rules',
        {
          type: Sequelize.VARCHAR,
        },
      ),
    ]);
  },
};
