module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'uuid', {
        type: Sequelize.UUID,
        unique: true,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('transactions', 'uuid')]);
  },
};
