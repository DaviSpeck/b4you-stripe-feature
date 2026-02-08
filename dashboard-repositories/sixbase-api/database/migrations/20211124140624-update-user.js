module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'status_cnpj', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('users', 'status_cnpj')]);
  },
};
