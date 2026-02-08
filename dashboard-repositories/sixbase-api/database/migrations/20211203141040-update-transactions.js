module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'id_role', {
        type: Sequelize.TINYINT,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('transactions', 'id_role')]);
  },
};
