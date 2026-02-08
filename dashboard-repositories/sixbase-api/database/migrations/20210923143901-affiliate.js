module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('affiliates', 'active', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.renameColumn('affiliates', 'active', 'status'),
      queryInterface.renameColumn(
        'affiliates',
        'commission_percentage',
        'commission',
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('affiliates', 'active', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.renameColumn(
        'affiliates',
        'commission_percentage',
        'commission',
      ),
    ]);
  },
};
