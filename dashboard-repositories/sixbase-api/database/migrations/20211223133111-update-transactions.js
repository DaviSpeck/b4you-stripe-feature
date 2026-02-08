module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'socket_id', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('transactions', 'socket_id'),
    ]);
  },
};
