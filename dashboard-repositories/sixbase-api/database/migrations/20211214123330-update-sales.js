module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales', 'id_upsell'),
      queryInterface.removeColumn('sales', 'id_affiliate'),
      queryInterface.removeColumn('sales', 'cost'),
      queryInterface.removeColumn('sales', 'fee'),
      queryInterface.removeColumn('sales', 'affiliate_percentage'),
      queryInterface.removeColumn('sales', 'id_status_upsell'),
      queryInterface.removeColumn('sales', 'is_upsell_allowed'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales', 'id_upsell', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('sales', 'id_affiliate', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('sales', 'cost', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales', 'fee', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales', 'affiliate_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales', 'id_status_upsell', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn('sales', 'is_upsell_allowed', {
        type: Sequelize.BOOLEAN,
      }),
    ]);
  },
};
