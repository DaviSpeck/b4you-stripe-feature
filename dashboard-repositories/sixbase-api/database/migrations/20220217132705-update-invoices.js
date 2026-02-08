module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('invoices', 'id_plugin', {
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('invoices', 'id_plugin')]);
  },
};
